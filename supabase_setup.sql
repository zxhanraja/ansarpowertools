-- =========================================================================
-- COMPLETE SUPABASE SETUP SCRIPT FOR ANSAR POWER TOOLS
-- =========================================================================
-- INSTRUCTIONS:
-- 1. Copy this entire code.
-- 2. Go to your Supabase Dashboard -> SQL Editor.
-- 3. Paste and Click 'RUN'.
-- =========================================================================

-- 1. ENABLE EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PROFILES TABLE (Public Data)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'CUSTOMER' check (role in ('ADMIN', 'CUSTOMER')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for Profiles
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- 3. PRODUCTS TABLE
create table if not exists public.products (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    price numeric not null,
    currency text default 'INR',
    sku text,
    stock integer default 0,
    category text,
    "imageUrl" text, 
    rating numeric default 0,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.products enable row level security;

-- Policies for Products
drop policy if exists "Products are viewable by everyone" on public.products;
create policy "Products are viewable by everyone" on public.products
    for select using (true);

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products" on public.products
    for all using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'ADMIN'
        )
    );

-- 4. ORDERS TABLE
create table if not exists public.orders (
    id uuid default gen_random_uuid() primary key,
    "orderNumber" text not null,
    "customerEmail" text,
    "userId" uuid references auth.users(id),
    "totalAmount" numeric not null,
    status text default 'PENDING',
    "shippingDetails" jsonb,
    items jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.orders enable row level security;

-- Policies for Orders
drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders" on public.orders
    for select using (
        auth.uid() = "userId" 
        or 
        exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
    );

drop policy if exists "Anyone can create orders" on public.orders;
create policy "Anyone can create orders" on public.orders
    for insert with check (true);

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders" on public.orders
    for update using (
        exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
    );

-- 5. AUTOMATIC PROFILE CREATION TRIGGER
-- This function runs every time someone signs up
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
      full_name = excluded.full_name,
      role = coalesce(excluded.role, profiles.role);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. STORAGE SETUP
-- Create bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Storage Policies
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" on storage.objects
  for select using ( bucket_id = 'product-images' );

drop policy if exists "Admin Access" on storage.objects;
create policy "Admin Access" on storage.objects
  for all using (
    bucket_id = 'product-images' 
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );

-- 7. INITIAL ADMIN SETUP (IMPORTANT)
-- If you have already signed up, run this to make yourself ADMIN
-- Replace 'foltairezzzz@gmail.com' with your actual email
UPDATE public.profiles 
SET role = 'ADMIN' 
WHERE email = 'foltairezzzz@gmail.com';

-- This ensures if the user exists but isn't in profiles yet, they get added as ADMIN
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'foltairezzzz@gmail.com') THEN
    INSERT INTO public.profiles (id, email, full_name, role)
    SELECT id, email, COALESCE(raw_user_meta_data->>'name', 'Admin User'), 'ADMIN'
    FROM auth.users
    WHERE email = 'foltairezzzz@gmail.com'
    ON CONFLICT (id) DO UPDATE SET role = 'ADMIN';
  END IF;
END $$;
