-- ==========================================
-- ANSAR POWER TOOLS - MASTER SETUP (GOD-MODE)
-- FIXES: RLS Errors, Metadata Sync, Storage, and UI Glitches
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
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- RECURSION-PROOF ADMIN CHECK (JWT Based)
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

-- 4. STORAGE SETUP (Enable Image Uploads)
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

-- 5. TABLES SETUP (Idempotent with ALTER)

-- CATEGORIES
create table if not exists public.categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique
);
alter table public.categories add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());
alter table public.categories add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

drop trigger if exists trigger_update_categories_timestamp on public.categories;
create trigger trigger_update_categories_timestamp before update on public.categories for each row execute procedure public.handle_updated_at();

-- PRODUCTS
create table if not exists public.products (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    price decimal(12,2) not null check (price >= 0)
);
alter table public.products add column if not exists description text;
alter table public.products add column if not exists currency text default 'INR';
alter table public.products add column if not exists sku text unique;
alter table public.products add column if not exists stock integer default 0 check (stock >= 0);
alter table public.products add column if not exists category text references public.categories(name) on update cascade;
alter table public.products add column if not exists image_url text;
alter table public.products add column if not exists rating decimal(3,2) default 5.0;
alter table public.products add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());
alter table public.products add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

drop trigger if exists trigger_update_products_timestamp on public.products;
create trigger trigger_update_products_timestamp before update on public.products for each row execute procedure public.handle_updated_at();

-- PROFILES
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    role text default 'CUSTOMER'
);
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists zip_code text;
alter table public.profiles add column if not exists state text default 'West Bengal';
alter table public.profiles add column if not exists country text default 'India';
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());
alter table public.profiles add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

drop trigger if exists trigger_update_profiles_timestamp on public.profiles;
create trigger trigger_update_profiles_timestamp before update on public.profiles for each row execute procedure public.handle_updated_at();

-- ORDERS
create table if not exists public.orders (
    id uuid default uuid_generate_v4() primary key,
    order_number text unique not null,
    user_id uuid references public.profiles(id)
);
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists items jsonb;
alter table public.orders add column if not exists total_amount decimal(12,2);
alter table public.orders add column if not exists currency text default 'INR';
alter table public.orders add column if not exists status text default 'PAID';
alter table public.orders add column if not exists shipping_details jsonb;
alter table public.orders add column if not exists payment_id text unique;
alter table public.orders add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());
alter table public.orders add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

drop trigger if exists trigger_update_orders_timestamp on public.orders;
create trigger trigger_update_orders_timestamp before update on public.orders for each row execute procedure public.handle_updated_at();

-- 6. INDICES
create index if not exists idx_products_sku on public.products(sku);
create index if not exists idx_orders_number on public.orders(order_number);

-- 7. ENABLE RLS
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;

-- 8. POLICIES (RECURSION-PROOF)
-- Products/Categories
create policy "Public View Products" on public.products for select using (true);
create policy "Admin Manage Products" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "Public View Categories" on public.categories for select using (true);
create policy "Admin Manage Categories" on public.categories for all using (public.is_admin());

-- Profiles
create policy "Users manage own profile" on public.profiles for all using (auth.uid() = id);
create policy "Admin view all profiles" on public.profiles for select using (public.is_admin());

-- Orders
create policy "Users view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Admin handle all orders" on public.orders for all using (public.is_admin());
create policy "Anyone Create" on public.orders for insert with check (true);

-- 9. AUTH SYNC TRIGGER
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 'CUSTOMER');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- 10. ADMIN PROMOTION FUNCTION
create or replace function public.make_admin(admin_email text)
returns void as $$
begin
  -- 1. Update JWT Metadata (Critical for RLS)
  update auth.users set raw_app_meta_data = jsonb_set(coalesce(raw_app_meta_data, '{}'::jsonb), '{role}', '"ADMIN"') where email = admin_email;
  -- 2. Update Profiles Table (For UI)
  update public.profiles set role = 'ADMIN' where email = admin_email;
end;
$$ language plpgsql security definer;

-- FINAL STEP: PROMOTE YOURSELF
-- Run this after signing up:
-- SELECT public.make_admin('foltairezzzz@gmail.com');
