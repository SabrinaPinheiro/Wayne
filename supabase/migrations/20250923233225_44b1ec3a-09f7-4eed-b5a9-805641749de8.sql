-- Remove old demo user profile (the auth.users entry will be handled by Supabase)
DELETE FROM public.profiles WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'demo@wayne.app.br'
);

-- Update create_demo_user function to create the 3 new demo users
DROP FUNCTION IF EXISTS public.create_demo_user() CASCADE;

CREATE OR REPLACE FUNCTION public.create_three_demo_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    funcionario_user_id uuid;
    gerente_user_id uuid;
    admin_user_id uuid;
BEGIN
    -- Check and create funcionario demo user
    SELECT id INTO funcionario_user_id
    FROM auth.users 
    WHERE email = 'funcionario@wayne.app.br';
    
    IF funcionario_user_id IS NULL THEN
        -- User will need to be created via Supabase Auth UI or API
        RAISE NOTICE 'Funcionário demo user not found. Create it via Supabase Auth.';
    ELSE
        -- Create/update profile
        INSERT INTO public.profiles (
            user_id,
            full_name,
            role
        ) VALUES (
            funcionario_user_id,
            'Funcionário Demo - Wayne Industries',
            'funcionario'
        ) ON CONFLICT (user_id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            updated_at = now();
    END IF;
    
    -- Check and create gerente demo user
    SELECT id INTO gerente_user_id
    FROM auth.users 
    WHERE email = 'gerente@wayne.app.br';
    
    IF gerente_user_id IS NULL THEN
        RAISE NOTICE 'Gerente demo user not found. Create it via Supabase Auth UI or API.';
    ELSE
        -- Create/update profile
        INSERT INTO public.profiles (
            user_id,
            full_name,
            role
        ) VALUES (
            gerente_user_id,
            'Gerente Demo - Wayne Industries',
            'gerente'
        ) ON CONFLICT (user_id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            updated_at = now();
    END IF;
    
    -- Check and create admin demo user
    SELECT id INTO admin_user_id
    FROM auth.users 
    WHERE email = 'admin@wayne.app.br';
    
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'Admin demo user not found. Create it via Supabase Auth UI or API.';
    ELSE
        -- Create/update profile
        INSERT INTO public.profiles (
            user_id,
            full_name,
            role
        ) VALUES (
            admin_user_id,
            'Administrador Demo - Wayne Industries',
            'admin'
        ) ON CONFLICT (user_id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            updated_at = now();
    END IF;
    
    -- Create demo resources if they don't exist
    INSERT INTO public.resources (
        name,
        type,
        description,
        status,
        location,
        created_by
    ) VALUES 
    ('Batmóvel', 'Veículo', 'Veículo blindado com tecnologia avançada', 'disponivel', 'Batcaverna - Setor A', COALESCE(admin_user_id, funcionario_user_id, gerente_user_id)),
    ('Computador Principal', 'Equipamento', 'Supercomputador da Batcaverna', 'em_uso', 'Batcaverna - Centro de Comando', COALESCE(admin_user_id, funcionario_user_id, gerente_user_id)),
    ('Traje do Batman', 'Equipamento', 'Traje tático com proteção balística', 'disponivel', 'Armário de Equipamentos', COALESCE(admin_user_id, funcionario_user_id, gerente_user_id))
    ON CONFLICT (name) DO NOTHING;
END;
$$;

-- Update the handle_admin_user function to handle all three demo user types
DROP FUNCTION IF EXISTS public.handle_admin_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_demo_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Handle admin users
  IF NEW.email = 'admin@wayne.app.br' THEN
    INSERT INTO public.profiles (user_id, full_name, role)
    VALUES (
      NEW.id,
      'Administrador Demo - Wayne Industries',
      'admin'
    );
  -- Handle gerente users  
  ELSIF NEW.email = 'gerente@wayne.app.br' THEN
    INSERT INTO public.profiles (user_id, full_name, role)
    VALUES (
      NEW.id,
      'Gerente Demo - Wayne Industries', 
      'gerente'
    );
  -- Handle funcionario users
  ELSIF NEW.email = 'funcionario@wayne.app.br' THEN
    INSERT INTO public.profiles (user_id, full_name, role)
    VALUES (
      NEW.id,
      'Funcionário Demo - Wayne Industries',
      'funcionario'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop old trigger and create new one
DROP TRIGGER IF EXISTS on_admin_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_demo_user_created ON auth.users;

CREATE TRIGGER on_demo_users_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  WHEN (NEW.email IN ('admin@wayne.app.br', 'gerente@wayne.app.br', 'funcionario@wayne.app.br'))
  EXECUTE FUNCTION public.handle_demo_users();