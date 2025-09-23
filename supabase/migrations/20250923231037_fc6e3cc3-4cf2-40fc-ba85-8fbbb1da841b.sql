-- Fix remaining function search_path warning
CREATE OR REPLACE FUNCTION public.create_demo_user()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    demo_user_id uuid;
BEGIN
    -- Verificar se já existe usuário demo
    SELECT id INTO demo_user_id
    FROM auth.users 
    WHERE email = 'demo@wayne.app.br';
    
    -- Se não existe, criar através do Supabase Auth
    IF demo_user_id IS NULL THEN
        -- Esta função será executada pelo sistema
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            confirmation_sent_at,
            email_confirmed_at,
            phone_confirmed_at,
            confirmed_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated', 
            'demo@wayne.app.br',
            crypt('123456', gen_salt('bf', 8)),
            now(),
            now(),
            now(),
            now(),
            now(),
            now(),
            now()
        );
        
        -- Obter o ID do usuário criado
        SELECT id INTO demo_user_id
        FROM auth.users 
        WHERE email = 'demo@wayne.app.br';
    END IF;
    
    -- Criar perfil do usuário demo (se não existir)
    INSERT INTO public.profiles (
        user_id,
        full_name,
        role
    ) VALUES (
        demo_user_id,
        'Usuário Demo - Wayne Industries',
        'admin'
    ) ON CONFLICT (user_id) DO NOTHING;
    
    -- Criar alguns recursos de exemplo
    INSERT INTO public.resources (
        name,
        type,
        description,
        status,
        location,
        created_by
    ) VALUES 
    ('Batmóvel', 'Veículo', 'Veículo blindado com tecnologia avançada', 'disponivel', 'Batcaverna - Setor A', demo_user_id),
    ('Computador Principal', 'Equipamento', 'Supercomputador da Batcaverna', 'em_uso', 'Batcaverna - Centro de Comando', demo_user_id),
    ('Traje do Batman', 'Equipamento', 'Traje tático com proteção balística', 'disponivel', 'Armário de Equipamentos', demo_user_id)
    ON CONFLICT DO NOTHING;
    
END;
$function$;