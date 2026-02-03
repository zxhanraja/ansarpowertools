-- COMPLETE SUPABASE SCHEMA FOR ANSAR POWER TOOLS
-- Includes: User Profiles (with Address), Products, Categories, and Order History

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. CATEGORIES TABLE
create table if not exists categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PRODUCTS TABLE
create table if not exists products (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    price decimal(12,2) not null,
    currency text default 'INR',
    sku text unique,
    stock integer default 0,
    category text references categories(name) on update cascade,
    image_url text,
    rating decimal(3,2) default 5.0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PROFILES TABLE (Saves user info and persistence for address)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique,
    full_name text,
    role text default 'CUSTOMER' check (role in ('CUSTOMER', 'ADMIN')),
    
    -- PERSISTENT ADDRESS FIELDS
    address text,
    city text,
    zip_code text,
    state text default 'West Bengal',
    country text default 'India',
    phone text,
    
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ORDERS TABLE
create table if not exists orders (
    id uuid default uuid_generate_v4() primary key,
    order_number text unique not null,
    user_id uuid references public.profiles(id),
    customer_email text not null,
    items jsonb not null, -- Stores snapshot of products at time of purchase
    total_amount decimal(12,2) not null,
    currency text default 'INR',
    status text default 'PAID',
    
    -- SHIPPING SNAPSHOT (Used for specific order delivery)
    shipping_details jsonb not null, 
    
    tracking_number text,
    courier_name text,
    payment_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ROW LEVEL SECURITY (RLS)
alter table profiles enable row level security;
alter table products enable row level security;
alter table categories enable row level security;
alter table orders enable row level security;

-- 7. POLICIES

-- Products (Read by all, Write by Admin)
create policy "Products are viewable by everyone" on products for select using (true);
create policy "Only admins can modify products" on products for all 
    using (exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN'));

-- Categories (Read by all, Write by Admin)
create policy "Categories are viewable by everyone" on categories for select using (true);
create policy "Only admins can modify categories" on categories for all 
    using (exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN'));

-- Profiles (Users read/write own, Admin read all)
create policy "Users can view own profile" on profiles for select 
    using (auth.uid() = id or exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN'));
create policy "Users can update own profile" on profiles for update 
    using (auth.uid() = id);

-- Orders (Users read own, Admin read/write all)
create policy "Users can view own orders" on orders for select 
    using (auth.uid() = user_id or exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN'));
create policy "Admins can modify orders" on orders for all 
    using (exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN'));
create policy "Anyone can create order" on orders for insert with check (true);

-- 8. AUTOMATION: Create profile on Auth Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'name', 'CUSTOMER');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 9. STORAGE BUCKET (Run via Supabase Dashboard if possible, or use these settings)
-- Bucket name: "product-images"
-- Public access: Enabled

-- 10. INITIAL SEED DATA
insert into categories (name) values 
('Drills'), ('Grinders'), ('Saws'), ('Marble Cutters'), ('Spare Parts')
on conflict do nothing;
