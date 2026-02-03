-- ==========================================
-- ANSAR POWER TOOLS - ULTIMATE MASTER SETUP
-- Version: 3.0 (Production Core Fix)
-- ==========================================

-- 1. CLEANUP (Wipe out old policies to avoid "Already Exists" errors)
-- This ensures we have a clean slate for all RLS policies
create or replace function public.cleanup_database_policies()
returns void as $$
declare
    pol record;
begin
    for pol in (select policyname, tablename, schemaname from pg_policies where schemaname = 'public') loop
        execute format('drop policy if exists %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    end loop;
end;
$$ language plpgsql;

select public.cleanup_database_policies();
drop function public.cleanup_database_policies();

-- 2. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 3. SHARED FUNCTIONS
-- Trigger function for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- RECURSION-PROOF ADMIN CHECK (Double-Check Logic)
-- This check verifies role from both JWT (Fast) and Database (Reliable)
create or replace function public.is_admin()
returns boolean as $$
declare
  is_admin_check boolean;
begin
  -- First try: Check JWT app_metadata (set by public.make_admin)
  if (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'ADMIN') then
    return true;
  end if;

  -- Second try: Check JWT user_metadata (fallback)
  if (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'ADMIN') then
    return true;
  end if;

  -- Final try: Check profiles table (most reliable but carries recursion risk if not handled in logic)
  -- We use security definer on this function so RLS doesn't block it
  return exists (
    select 1 from public.profiles 
    where id = auth.uid() and role = 'ADMIN'
  );
end;
$$ language plpgsql security definer;

-- 4. STORAGE SETUP
-- Create bucket if not exists
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Storage Policies (Public Read, Admin Write)
drop policy if exists "Public Read Access" on storage.objects;
create policy "Public Read Access" on storage.objects for select using (bucket_id = 'product-images');

drop policy if exists "Admin Storage Management" on storage.objects;
create policy "Admin Storage Management" on storage.objects for all using (
    bucket_id = 'product-images' and (public.is_admin())
) with check (
    bucket_id = 'product-images' and (public.is_admin())
);

-- 5. TABLES SETUP

-- CATEGORIES
create table if not exists public.categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

drop trigger if exists trigger_update_categories_timestamp on public.categories;
create trigger trigger_update_categories_timestamp before update on public.categories for each row execute procedure public.handle_updated_at();

-- PRODUCTS
create table if not exists public.products (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    price decimal(12,2) not null check (price >= 0),
    currency text default 'INR',
    sku text unique,
    stock integer default 0 check (stock >= 0),
    category text references public.categories(name) on update cascade on delete set null,
    image_url text,
    rating decimal(3,2) default 5.0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

drop trigger if exists trigger_update_products_timestamp on public.products;
create trigger trigger_update_products_timestamp before update on public.products for each row execute procedure public.handle_updated_at();

-- PROFILES
create table if not exists public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    email text unique not null,
    full_name text,
    avatar_url text,
    role text default 'CUSTOMER' check (role in ('CUSTOMER', 'ADMIN')),
    address text,
    city text,
    zip_code text,
    state text default 'West Bengal',
    country text default 'India',
    phone text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

drop trigger if exists trigger_update_profiles_timestamp on public.profiles;
create trigger trigger_update_profiles_timestamp before update on public.profiles for each row execute procedure public.handle_updated_at();

-- ORDERS
create table if not exists public.orders (
    id uuid default uuid_generate_v4() primary key,
    order_number text unique not null,
    user_id uuid references auth.users(id) on delete set null,
    customer_email text,
    total_amount decimal(12,2) not null,
    currency text default 'INR',
    status text default 'PAID' check (status in ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    shipping_details jsonb,
    payment_id text unique,
    tracking_number text,
    courier_name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

drop trigger if exists trigger_update_orders_timestamp on public.orders;
create trigger trigger_update_orders_timestamp before update on public.orders for each row execute procedure public.handle_updated_at();

-- ORDER ITEMS
create table if not exists public.order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade,
    product_id uuid references public.products(id) on delete set null,
    name text,
    quantity integer not null check (quantity > 0),
    unit_price decimal(12,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ENABLE RLS
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- 7. RLS POLICIES (Consolidated)

-- PRODUCTS: Read all, Admin manage
create policy "Anyone can read products" on public.products for select using (true);
create policy "Admin can manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- CATEGORIES: Read all, Admin manage
create policy "Anyone can read categories" on public.categories for select using (true);
create policy "Admin can manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());

-- PROFILES: Owner view/edit, Admin view all
create policy "Profiles self view" on public.profiles for select using (auth.uid() = id);
create policy "Profiles self update" on public.profiles for update using (auth.uid() = id);
create policy "Admin view all profiles" on public.profiles for select using (public.is_admin());

-- ORDERS: Owner view, Admin all, Anyone insert (Checkout)
create policy "Orders view self or admin" on public.orders for select using (auth.uid() = user_id or public.is_admin());
create policy "Orders insert from anyone" on public.orders for insert with check (true);
create policy "Admin manage orders" on public.orders for all using (public.is_admin());

-- ORDER ITEMS: Linked to Order access
create policy "Order items related access" on public.order_items for select using (
    exists (
        select 1 from public.orders 
        where orders.id = order_items.order_id 
        and (orders.user_id = auth.uid() or public.is_admin())
    )
);
create policy "Order items insert anyone" on public.order_items for insert with check (true);

-- 8. AUTH SYNC TRIGGER (Fixes Registration)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
    coalesce(new.raw_user_meta_data->>'role', 'CUSTOMER')
  )
  on conflict (id) do update 
  set email = excluded.email, 
      full_name = coalesce(excluded.full_name, profiles.full_name);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- 9. ADMIN PROMOTION UTILITY
create or replace function public.make_admin(admin_email text)
returns void as $$
declare
  user_id uuid;
begin
  -- Get user id
  select id into user_id from auth.users where email = admin_email;
  
  if user_id is null then
    raise exception 'User with email % not found', admin_email;
  end if;

  -- 1. Update JWT app_metadata for RLS
  update auth.users 
  set raw_app_meta_data = jsonb_set(coalesce(raw_app_meta_data, '{}'::jsonb), '{role}', '"ADMIN"') 
  where id = user_id;
  
  -- 2. Update Profiles table for UI
  update public.profiles 
  set role = 'ADMIN' 
  where id = user_id;
end;
$$ language plpgsql security definer;

-- ==========================================
-- FINAL ACTION: RUN THE FOLLOWING AFTER SIGNUP
-- SELECT public.make_admin('foltairezzzz@gmail.com');
-- ==========================================
