-- Create admin profile and update demo user role
-- Note: The actual admin@wayne.app.br user should be created through Supabase Auth UI
-- This migration just prepares the profile structure

-- Update demo user to ensure it has admin role
UPDATE public.profiles 
SET role = 'admin', 
    full_name = 'Usuário Demo - Wayne Industries',
    updated_at = now()
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'demo@wayne.app.br'
);

-- Create a function to easily create admin profile when admin@wayne.app.br signs up
CREATE OR REPLACE FUNCTION public.handle_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- If the new user is admin@wayne.app.br, create admin profile
  IF NEW.email = 'admin@wayne.app.br' THEN
    INSERT INTO public.profiles (user_id, full_name, role)
    VALUES (
      NEW.id,
      'Administrador Principal - Wayne Industries',
      'admin'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for admin user creation
DROP TRIGGER IF EXISTS on_admin_user_created ON auth.users;
CREATE TRIGGER on_admin_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  WHEN (NEW.email = 'admin@wayne.app.br')
  EXECUTE FUNCTION public.handle_admin_user();