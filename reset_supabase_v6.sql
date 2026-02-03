-- ========================================================
-- ANSAR POWER TOOLS - NUCLEAR RESET (DEBUG MODE)
-- Version: 6.0 (Security Off - Use for Debugging)
-- ========================================================

-- 1. DROP ALL TRIGGERS & POLICIES
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop triggers
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP TRIGGER IF EXISTS tr_products_updated ON public.products;
    -- Drop all policies
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 2. DISABLE RLS (CRITICAL FOR DEBUGGING)
-- This allows any authenticated (or even anonymous) user to read/write.
-- WE WILL RE-ENABLE THIS LATER.
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items DISABLE ROW LEVEL SECURITY;

-- 3. ENSURE TABLES EXIST (WITH MINIMAL TRAPPINGS)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY,
    email text,
    full_name text,
    role text DEFAULT 'CUSTOMER'
);

CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text,
    price decimal,
    image_url text,
    stock integer DEFAULT 0,
    category text
);

CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number text,
    user_id uuid,
    status text,
    total_amount decimal,
    shipping_details jsonb
);

-- 4. EMERGENCY ADMIN OVERRIDE
-- Manually force your email to be Admin in the DB
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, raw_user_meta_data->>'name', 'ADMIN'
FROM auth.users
WHERE email = 'foltairezzzz@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'ADMIN';

-- 5. SIMPLIFIED ADMIN FUNCTION (Direct Metadata)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email' = 'foltairezzzz@gmail.com' OR 
          COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'ADMIN');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. STORAGE (PUBLIC ACCESS)
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "public_storage" ON storage.objects;
CREATE POLICY "public_storage" ON storage.objects FOR ALL USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');
