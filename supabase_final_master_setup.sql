-- ==========================================
-- ANSAR POWER TOOLS - MASTER PRODUCTION SETUP
-- Version: 2.0 (Stable & Consolidated)
-- ==========================================

-- 1. CLEANUP (Wipe out old policies to avoid "Already Exists" errors)
create or replace function public.cleanup_database()
returns void as $$
declare
    pol record;
begin
    for pol in (select policyname, tablename, schemaname from pg_policies where schemaname = 'public') loop
        execute format('drop policy if exists %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    end loop;
end;
$$ language plpgsql;

select public.cleanup_database();
drop function public.cleanup_database();

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

-- RECURSION-PROOF ADMIN CHECK (JWT Based)
-- This avoids calling the profiles table repeatedly in RLS
create or replace function public.is_admin()
returns boolean as $$
begin
  return (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'ADMIN'
    or
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'ADMIN'
  );
end;
$$ language plpgsql security definer;

-- 4. STORAGE SETUP
-- Create bucket if not exists
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Storage Policies
drop policy if exists "Public Read" on storage.objects;
create policy "Public Read" on storage.objects for select using (bucket_id = 'product-images');

drop policy if exists "Admin Full Access" on storage.objects;
create policy "Admin Full Access" on storage.objects for all using (
    bucket_id = 'product-images' and (select public.is_admin())
) with check (
    bucket_id = 'product-images' and (select public.is_admin())
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
    category text references public.categories(name) on update cascade,
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

-- ORDER ITEMS (Normalized sub-table)
create table if not exists public.order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade,
    product_id uuid references public.products(id) on delete set null,
    name text, -- Snapshot of product name
    quantity integer not null check (quantity > 0),
    unit_price decimal(12,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. INDICES
create index if not exists idx_products_sku on public.products(sku);
create index if not exists idx_orders_number on public.orders(order_number);
create index if not exists idx_orders_user_id on public.orders(user_id);

-- 7. ENABLE RLS
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- 8. POLICIES (RECURSION-PROOF)

-- PRODUCTS & CATEGORIES: Publicly viewable
create policy "Anyone can view products" on public.products for select using (true);
create policy "Admins can manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "Anyone can view categories" on public.categories for select using (true);
create policy "Admins can manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());

-- PROFILES: Users see own, Admins see all
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (public.is_admin());

-- ORDERS: Users see own, Admins see all, Anyone can insert (for checkout)
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id or public.is_admin());
create policy "Admins can manage orders" on public.orders for all using (public.is_admin());
create policy "Anyone can create orders" on public.orders for insert with check (true);

-- ORDER ITEMS: Linked to orders
create policy "Users can view own order items" on public.order_items for select using (
    exists (
        select 1 from public.orders 
        where orders.id = order_items.order_id 
        and (orders.user_id = auth.uid() or public.is_admin())
    )
);
create policy "Anyone can create order items" on public.order_items for insert with check (true);

-- 9. AUTH SYNC TRIGGER
-- Automatically create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
    'CUSTOMER'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- 10. ADMIN PROMOTION UTILITY
-- Function to promote any user to ADMIN (updates both JWT and profiles)
create or replace function public.make_admin(admin_email text)
returns void as $$
begin
  -- 1. Update JWT Metadata (Critical for RLS via public.is_admin())
  update auth.users 
  set raw_app_meta_data = jsonb_set(coalesce(raw_app_meta_data, '{}'::jsonb), '{role}', '"ADMIN"') 
  where email = admin_email;
  
  -- 2. Update Profiles Table (For UI checks)
  update public.profiles 
  set role = 'ADMIN' 
  where email = admin_email;
end;
$$ language plpgsql security definer;

-- ==========================================
-- FINAL ACTION: PROMOTE YOURSELF
-- Run this block ONLY after you have signed up in your app
-- ==========================================
-- SELECT public.make_admin('foltairezzzz@gmail.com');
