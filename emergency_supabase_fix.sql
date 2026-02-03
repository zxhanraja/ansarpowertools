-- ==========================================
-- ANSAR POWER TOOLS - EMERGENCY RECOVERY FIX
-- Version: 5.0 (Silent & Robust)
-- Goal: Ensure Signup/Login never hangs
-- ==========================================

-- 1. CLEANUP ALL EXISTING TRIGGERS
-- We start from scratch to avoid any recursive or failing triggers
DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 2. ROBUST TRIGGER FUNCTION
-- This function uses BEGIN...EXCEPTION to ensure that even if profile 
-- creation fails, the actual user signup in auth.users is NOT blocked.
CREATE OR REPLACE FUNCTION public.handle_new_user_emergency()
RETURNS TRIGGER AS $$
BEGIN
  -- We wrap the insert in a sub-block to catch errors
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      new.id, 
      new.email, 
      COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
      COALESCE(new.raw_user_meta_data->>'role', 'CUSTOMER')
    )
    ON CONFLICT (id) DO UPDATE 
    SET email = excluded.email, 
        full_name = COALESCE(excluded.full_name, profiles.full_name);
  EXCEPTION WHEN OTHERS THEN
    -- Log error to Supabase logs but DON'T stop the signup
    RAISE WARNING 'Profile creation failed for user %: %', new.id, SQLERRM;
  END;
  
  -- Update app_metadata to ensure JWT has the role for RLS
  BEGIN
    UPDATE auth.users 
    SET raw_app_meta_data = jsonb_set(
      COALESCE(raw_app_meta_data, '{}'::jsonb), 
      '{role}', 
      format('"%s"', COALESCE(new.raw_user_meta_data->>'role', 'CUSTOMER'))::jsonb
    )
    WHERE id = new.id;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RE-ATTACH TRIGGER
CREATE TRIGGER on_auth_user_created 
AFTER INSERT ON auth.users 
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_emergency();

-- 4. ULTRA-PERMISSIVE ADMIN CHECK
-- If you are locked out, this check trusts the metadata first
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- 1. Trust JWT (Fastest)
  IF (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'ADMIN') THEN
    RETURN TRUE;
  END IF;

  -- 2. Hardcoded Emergency Override for Owner
  IF (auth.jwt() ->> 'email' = 'foltairezzzz@gmail.com') THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. ENSURE TABLES ARE CORRECT
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'CUSTOMER';

-- 6. ADMIN PROMOTION
CREATE OR REPLACE FUNCTION public.make_admin(admin_email text)
RETURNS void AS $$
DECLARE
  target_id uuid;
BEGIN
  SELECT id INTO target_id FROM auth.users WHERE email = admin_email;
  
  UPDATE auth.users 
  SET raw_app_meta_data = jsonb_set(COALESCE(raw_app_meta_data, '{}'::jsonb), '{role}', '"ADMIN"') 
  WHERE id = target_id;
  
  INSERT INTO public.profiles (id, email, role)
  VALUES (target_id, admin_email, 'ADMIN')
  ON CONFLICT (id) DO UPDATE SET role = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- EXECUTE THIS AFTER RUNNING THE SCRIPT:
-- SELECT public.make_admin('foltairezzzz@gmail.com');
