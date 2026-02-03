-- EMERGENCY FIX SCRIPT
-- This script drops complicated triggers and policies to ensure basic Login/Signup works.

-- 1. DROP EXISTING TRIGGERS (To prevent hanging on Signup)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. RECREATE PROFILE TRIGGER (Robust Version)
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', 'CUSTOMER')
  ON CONFLICT (id) DO NOTHING; -- Prevent errors if it already exists
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- If profile creation fails, LOG it but do not fail the signup transaction
    RAISE WARNING 'Profile creation failed for user %', new.id;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created 
AFTER INSERT ON auth.users 
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. RESET PROFILE POLICIES (Allow everything for now)
DROP POLICY IF EXISTS "Public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Self insert" ON public.profiles;
DROP POLICY IF EXISTS "Self update" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow Read All" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow Update Own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow Insert Own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. ENSURE ADMIN PROFILE EXISTS
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, raw_user_meta_data->>'name', 'ADMIN'
FROM auth.users
WHERE email = 'foltairezzzz@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'ADMIN';

-- 5. FIX STORAGE PERMISSIONS (For Admin Panel)
-- Drop all policies to be safe
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

-- Simple Permissive Policies
CREATE POLICY "Give Me Images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Let Me Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Let Me Update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
