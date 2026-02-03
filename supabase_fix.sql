-- ==========================================
-- SUPABASE SETUP SCRIPT FOR POWER TOOLS APP
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1. PROFILES TABLE (Role Management)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN'))
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- -------------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL UNIQUE
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admins can insert categories" 
ON public.categories FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

CREATE POLICY "Admins can update categories" 
ON public.categories FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

CREATE POLICY "Admins can delete categories" 
ON public.categories FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);


-- -------------------------------------------------------------------------
-- 3. PRODUCTS TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  sku TEXT,
  stock INTEGER DEFAULT 0,
  category TEXT, -- Storing category name for simplicity as per existing frontend
  image_url TEXT,
  rating NUMERIC DEFAULT 5.0
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Products are viewable by everyone" 
ON public.products FOR SELECT USING (true);

CREATE POLICY "Admins can insert products" 
ON public.products FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

CREATE POLICY "Admins can update products" 
ON public.products FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

CREATE POLICY "Admins can delete products" 
ON public.products FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);


-- -------------------------------------------------------------------------
-- 4. ORDERS TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT,
  total_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'PAID',
  shipping_details JSONB,
  payment_id TEXT,
  tracking_number TEXT,
  courier_name TEXT
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all orders" 
ON public.orders FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

CREATE POLICY "Users can view their own orders" 
ON public.orders FOR SELECT 
USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can create orders" 
ON public.orders FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR user_id IS NULL -- Allow guest checkout if architected, but here standard is auth
);

CREATE POLICY "Admins can update orders" 
ON public.orders FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);


-- -------------------------------------------------------------------------
-- 5. ORDER ITEMS TABLE (The Fix for Deletion Issue)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL, -- <--- KEY FIX: Allow product deletion
  name TEXT,      -- Snapshot of product name
  quantity INTEGER,
  unit_price NUMERIC
);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all order items" 
ON public.order_items FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

CREATE POLICY "Users can view their own order items" 
ON public.order_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create order items" 
ON public.order_items FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  )
);

-- -------------------------------------------------------------------------
-- 6. STORAGE BUCKET SETUP
-- -------------------------------------------------------------------------
-- Note: You have to create the bucket 'product-images' manually in the dashboard if it doesn't exist,
-- or run this via the API. SQL support for storage buckets is limited to Policies.

-- Storage Policies for 'product-images'
-- (Assuming bucket is created and public)

-- Allow public read access
CREATE POLICY "Give public access to product-images" ON storage.objects FOR SELECT USING ( bucket_id = 'product-images' );

-- Allow Admin upload/delete
CREATE POLICY "Allow Admin Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'product-images' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN') );
CREATE POLICY "Allow Admin Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'product-images' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN') );


-- -------------------------------------------------------------------------
-- 7. TRIGGERS
-- -------------------------------------------------------------------------

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', 'CUSTOMER');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- -------------------------------------------------------------------------
-- 8. ADMIN PROMOTION (Your Specific Account)
-- -------------------------------------------------------------------------

-- This ensures your user is an admin if they already exist
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, raw_user_meta_data->>'name', 'ADMIN'
FROM auth.users
WHERE email = 'foltairezzzz@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'ADMIN';

-- -------------------------------------------------------------------------
-- 9. SAFE CONSTRAINT UPDATE (If tables already exist)
-- -------------------------------------------------------------------------
-- If order_items already exists with strict constraint, we drop and re-add it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'order_items_product_id_fkey') THEN
    ALTER TABLE public.order_items DROP CONSTRAINT order_items_product_id_fkey;
    ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_id_fkey 
      FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;
  END IF;
END $$;
