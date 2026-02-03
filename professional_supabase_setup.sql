-- ========================================================
-- ANSAR POWER TOOLS - PROFESSIONAL PRODUCTION ARCHITECTURE
-- Version: 4.0
-- Focus: Speed, Security, and Non-Recursive RLS
-- ========================================================

-- 1. SECURITY FOUNDATION
-- --------------------------------------------------------
-- Cleanup existing policies to prevent conflicts
do $$ 
declare 
    pol record;
begin
    for pol in (select policyname, tablename, schemaname from pg_policies where schemaname = 'public') loop
        execute format('drop policy if exists %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    end loop;
end $$;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. CORE UTILITY FUNCTIONS
-- --------------------------------------------------------
-- Fast Admin Check (Zero Database Reads when possible)
-- This function is the heart of the security system.
create or replace function public.is_admin()
returns boolean as $$
begin
  -- Check JWT metadata first (Fastest - zero disk I/O)
  if (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'ADMIN' or
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'ADMIN'
  ) then
    return true;
  end if;
  return false;
end;
$$ language plpgsql security definer;

-- Auto-update timestamp function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- 3. DATA STRUCTURES
-- --------------------------------------------------------

-- Categories
create table if not exists public.categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products
create table if not exists public.products (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    sku text unique,
    description text,
    price decimal(12,2) not null check (price >= 0),
    currency text default 'INR',
    stock integer default 0 check (stock >= 0),
    category text references public.categories(name) on update cascade on delete set null,
    image_url text,
    rating decimal(3,2) default 5.0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profiles (Linked to Auth)
create table if not exists public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    email text unique not null,
    full_name text,
    role text default 'CUSTOMER' check (role in ('CUSTOMER', 'ADMIN')),
    phone text,
    address text,
    city text,
    state text default 'West Bengal',
    zip_code text,
    country text default 'India',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders
create table if not exists public.orders (
    id uuid default uuid_generate_v4() primary key,
    order_number text unique not null,
    user_id uuid references auth.users(id) on delete set null,
    customer_email text,
    total_amount decimal(12,2) not null,
    status text default 'PAID' check (status in ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    shipping_details jsonb,
    payment_id text unique,
    tracking_number text,
    courier_name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items
create table if not exists public.order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade,
    product_id uuid references public.products(id) on delete set null,
    name text,
    quantity integer not null check (quantity > 0),
    unit_price decimal(12,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PERFORMANCE OPTIMIZATION (INDEXES)
-- --------------------------------------------------------
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

-- 5. ROW LEVEL SECURITY (RLS) - FAST & ROBUST
-- --------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Tables: Products & Categories (Public Select, Admin All)
create policy "products_public_read" on public.products for select using (true);
create policy "products_admin_all" on public.products for all using (public.is_admin());

create policy "categories_public_read" on public.categories for select using (true);
create policy "categories_admin_all" on public.categories for all using (public.is_admin());

-- Profile Policies (Self View/Update, Admin View All)
create policy "profile_owner_select" on public.profiles for select using (auth.uid() = id);
create policy "profile_owner_update" on public.profiles for update using (auth.uid() = id);
create policy "profile_admin_select" on public.profiles for select using (public.is_admin());

-- Order Policies (Self View, Anyone Insert [Checkout], Admin All)
create policy "orders_owner_select" on public.orders for select using (auth.uid() = user_id);
create policy "orders_insert_guest" on public.orders for insert with check (true);
create policy "orders_admin_all" on public.orders for all using (public.is_admin());

-- Order Items Policies
create policy "items_order_access" on public.order_items for select using (
    exists (select 1 from public.orders where id = order_id and (user_id = auth.uid() or public.is_admin()))
);
create policy "items_insert_checkout" on public.order_items for insert with check (true);

-- 6. AUTOMATION TRIGGERS
-- --------------------------------------------------------

-- Sync updated_at on all tables
create trigger tr_products_updated before update on public.products for each row execute procedure public.handle_updated_at();
create trigger tr_profiles_updated before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger tr_categories_updated before update on public.categories for each row execute procedure public.handle_updated_at();
create trigger tr_orders_updated before update on public.orders for each row execute procedure public.handle_updated_at();

-- Auth Hook: Automatically Create Profile on Signup
create or replace function public.handle_new_user_trigger()
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
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user_trigger();

-- 7. PRODUCTION UTILITIES
-- --------------------------------------------------------

-- Admin Promotion Utility (Updates JWT and Profiles)
create or replace function public.make_admin(admin_email text)
returns void as $$
declare
  target_id uuid;
begin
  select id into target_id from auth.users where email = admin_email;
  
  if target_id is null then
    raise exception 'User with email % not found', admin_email;
  end if;

  -- 1. Elevate in Auth Table (Sets JWT context)
  update auth.users 
  set raw_app_meta_data = jsonb_set(coalesce(raw_app_meta_data, '{}'::jsonb), '{role}', '"ADMIN"') 
  where id = target_id;
  
  -- 2. Elevate in Profiles Table (Sets UI context)
  update public.profiles 
  set role = 'ADMIN' 
  where id = target_id;
end;
$$ language plpgsql security definer;

-- 8. STORAGE ARCHITECTURE
-- --------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "images_public_read" on storage.objects for select using (bucket_id = 'product-images');
create policy "images_admin_manage" on storage.objects for all using (
    bucket_id = 'product-images' and (public.is_admin())
) with check (
    bucket_id = 'product-images' and (public.is_admin())
);

-- ========================================================
-- READY FOR ACTION. 
-- RUN THE ABOVE IN SQL EDITOR, THEN RUN THE LINE BELOW:
-- --------------------------------------------------------
-- SELECT public.make_admin('foltairezzzz@gmail.com');
-- ========================================================
