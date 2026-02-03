-- =========================================================================
-- COMPLETE SUPABASE SETUP SCRIPT FOR ANSAR POWER TOOLS (PROFESSIONAL VERSION)
-- =========================================================================
-- This script sets up the entire database architecture including:
-- 1. Table Structures (Profiles, Categories, Products, Orders, Order Items)
-- 2. Row Level Security (RLS) Policies
-- 3. Automatic Profile Creation Triggers
-- 4. Storage Bucket Policies
-- 5. Admin Promotion Logic
-- =========================================================================

-- -------------------------------------------------------------------------
-- 0. SCHEMA NORMALIZATION (Fixes column "user_id" / "order_number" etc. errors)
-- -------------------------------------------------------------------------
-- This block ensures existing tables follow the snake_case naming convention
-- expected by the frontend code.

DO $$
BEGIN
    -- Fix Orders Table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='userId') THEN
        ALTER TABLE public.orders RENAME COLUMN "userId" TO user_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='orderNumber') THEN
        ALTER TABLE public.orders RENAME COLUMN "orderNumber" TO order_number;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customerEmail') THEN
        ALTER TABLE public.orders RENAME COLUMN "customerEmail" TO customer_email;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='totalAmount') THEN
        ALTER TABLE public.orders RENAME COLUMN "totalAmount" TO total_amount;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='shippingDetails') THEN
        ALTER TABLE public.orders RENAME COLUMN "shippingDetails" TO shipping_details;
    END IF;
    
    -- Fix Products Table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='imageUrl') THEN
        ALTER TABLE public.products RENAME COLUMN "imageUrl" TO image_url;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Normalization skipped or failed: %', SQLERRM;
END $$;

-- -------------------------------------------------------------------------
-- 1. EXTENSIONS & INITIAL SETUP
-- -------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- 2. TABLES DEFINITIONS
-- -------------------------------------------------------------------------

-- PROFILES: Role-based access control
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CATEGORIES: Product categorization
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PRODUCTS: Main inventory
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  sku TEXT,
  stock INTEGER DEFAULT 0,
  category TEXT, -- Store category name for direct lookup, or link to categories.name
  image_url TEXT,
  rating NUMERIC DEFAULT 5.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ORDERS: Customer purchases
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT,
  total_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
  shipping_details JSONB,
  payment_id TEXT,
  tracking_number TEXT,
  courier_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ORDER ITEMS: Individual items within an order (with safe product deletion)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT, -- Snapshot of product name at time of purchase
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) & POLICIES
-- -------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 3.1 PROFILES POLICIES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 3.2 CATEGORIES POLICIES
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories (Insert)" ON public.categories;
CREATE POLICY "Admins can manage categories (Insert)" ON public.categories FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can manage categories (Update)" ON public.categories;
CREATE POLICY "Admins can manage categories (Update)" ON public.categories FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can manage categories (Delete)" ON public.categories;
CREATE POLICY "Admins can manage categories (Delete)" ON public.categories FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 3.3 PRODUCTS POLICIES
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage products (Insert)" ON public.products;
CREATE POLICY "Admins can manage products (Insert)" ON public.products FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can manage products (Update)" ON public.products;
CREATE POLICY "Admins can manage products (Update)" ON public.products FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can manage products (Delete)" ON public.products;
CREATE POLICY "Admins can manage products (Delete)" ON public.products FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 3.4 ORDERS POLICIES
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders" ON public.orders FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 3.5 ORDER ITEMS POLICIES
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'))));

DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
CREATE POLICY "Users can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- -------------------------------------------------------------------------
-- 4. REPAIR EXISTING CONSTRAINTS (Crucial if tables already existed)
-- -------------------------------------------------------------------------
-- This ensures you can delete products even if they are in old orders.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'order_items_product_id_fkey') THEN
    ALTER TABLE public.order_items DROP CONSTRAINT order_items_product_id_fkey;
  END IF;
  
  -- Add the safe constraint
  ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Constraint repair skipped or failed: %', SQLERRM;
END $$;

-- -------------------------------------------------------------------------
-- 4. TRIGGERS FOR PROFILE CREATION
-- -------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
    'CUSTOMER'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Profile creation failed for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -------------------------------------------------------------------------
-- 5. STORAGE POLICIES
-- -------------------------------------------------------------------------
-- Note: Create bucket 'product-images' manually in Supabase UI first.

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin Management" ON storage.objects;
CREATE POLICY "Admin Management" ON storage.objects FOR ALL 
  USING (bucket_id = 'product-images' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- -------------------------------------------------------------------------
-- 6. ADMIN PROMOTION
-- -------------------------------------------------------------------------

-- REPLACE 'foltairezzzz@gmail.com' with your actual admin email
-- RUN THIS AFTER SIGNING UP
DO $$
BEGIN
  UPDATE public.profiles SET role = 'ADMIN' WHERE email = 'foltairezzzz@gmail.com';
  
  -- If profile wasn't created yet for some reason
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'foltairezzzz@gmail.com') THEN
    INSERT INTO public.profiles (id, email, full_name, role)
    SELECT id, email, COALESCE(raw_user_meta_data->>'name', 'Admin User'), 'ADMIN'
    FROM auth.users
    WHERE email = 'foltairezzzz@gmail.com'
    ON CONFLICT (id) DO UPDATE SET role = 'ADMIN';
  END IF;
END $$;
