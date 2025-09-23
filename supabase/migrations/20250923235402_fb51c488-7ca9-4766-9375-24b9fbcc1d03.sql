-- Fix the create_three_demo_users function to handle resources without unique constraint on name
CREATE OR REPLACE FUNCTION public.create_three_demo_users()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    
    -- Create demo resources if they don't exist (checking by name manually)
    IF NOT EXISTS (SELECT 1 FROM public.resources WHERE name = 'Batmóvel') THEN
        INSERT INTO public.resources (
            name,
            type,
            description,
            status,
            location,
            created_by
        ) VALUES (
            'Batmóvel', 
            'Veículo', 
            'Veículo blindado com tecnologia avançada', 
            'disponivel', 
            'Batcaverna - Setor A', 
            COALESCE(admin_user_id, funcionario_user_id, gerente_user_id)
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.resources WHERE name = 'Computador Principal') THEN
        INSERT INTO public.resources (
            name,
            type,
            description,
            status,
            location,
            created_by
        ) VALUES (
            'Computador Principal', 
            'Equipamento', 
            'Supercomputador da Batcaverna', 
            'em_uso', 
            'Batcaverna - Centro de Comando', 
            COALESCE(admin_user_id, funcionario_user_id, gerente_user_id)
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.resources WHERE name = 'Traje do Batman') THEN
        INSERT INTO public.resources (
            name,
            type,
            description,
            status,
            location,
            created_by
        ) VALUES (
            'Traje do Batman', 
            'Equipamento', 
            'Traje tático com proteção balística', 
            'disponivel', 
            'Armário de Equipamentos', 
            COALESCE(admin_user_id, funcionario_user_id, gerente_user_id)
        );
    END IF;
END;
$function$;