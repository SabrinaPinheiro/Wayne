-- Populate access_logs and resources with demo data using existing user
DO $$
DECLARE
    demo_user_id uuid;
    resource_id1 uuid;
    resource_id2 uuid;
    resource_id3 uuid;
BEGIN
    -- Get existing demo user ID from profiles
    SELECT user_id INTO demo_user_id 
    FROM public.profiles 
    WHERE role = 'admin' 
    LIMIT 1;
    
    -- If no user found, skip demo data creation
    IF demo_user_id IS NULL THEN
        RAISE NOTICE 'No demo user found, skipping demo data creation';
        RETURN;
    END IF;
    
    -- Insert demo resources if they don't exist
    INSERT INTO public.resources (name, type, description, status, location, created_by)
    VALUES 
    ('Notebook Dell XPS 15', 'Equipamento', 'Notebook para desenvolvimento', 'disponivel', 'Sala de TI - Mesa 01', demo_user_id),
    ('Projetor Epson', 'Equipamento', 'Projetor para apresentações', 'em_uso', 'Sala de Reuniões A', demo_user_id),
    ('Chave Sala 302', 'Acesso', 'Chave de acesso à sala 302', 'disponivel', 'Recepção', demo_user_id),
    ('Carro Corporativo', 'Veículo', 'Honda Civic 2023', 'disponivel', 'Garagem - Vaga 05', demo_user_id),
    ('Tablet Samsung', 'Equipamento', 'Tablet para apresentações móveis', 'manutencao', 'Sala de TI', demo_user_id)
    ON CONFLICT (name) DO NOTHING;
    
    -- Get resource IDs for access logs
    SELECT id INTO resource_id1 FROM public.resources WHERE name = 'Notebook Dell XPS 15' LIMIT 1;
    SELECT id INTO resource_id2 FROM public.resources WHERE name = 'Projetor Epson' LIMIT 1;
    SELECT id INTO resource_id3 FROM public.resources WHERE name = 'Chave Sala 302' LIMIT 1;
    
    -- Insert demo access logs only if resources exist
    IF resource_id1 IS NOT NULL AND resource_id2 IS NOT NULL AND resource_id3 IS NOT NULL THEN
        INSERT INTO public.access_logs (user_id, resource_id, action, notes, timestamp)
        VALUES 
        (demo_user_id, resource_id1, 'checkout', 'Retirada para projeto de desenvolvimento', NOW() - INTERVAL '2 hours'),
        (demo_user_id, resource_id2, 'checkout', 'Apresentação para cliente', NOW() - INTERVAL '1 day'),
        (demo_user_id, resource_id2, 'checkin', 'Apresentação finalizada', NOW() - INTERVAL '23 hours'),
        (demo_user_id, resource_id3, 'checkout', 'Reunião na sala 302', NOW() - INTERVAL '3 hours'),
        (demo_user_id, resource_id3, 'checkin', 'Reunião finalizada', NOW() - INTERVAL '2 hours 30 minutes'),
        (demo_user_id, resource_id1, 'maintenance', 'Limpeza e atualização do sistema', NOW() - INTERVAL '5 days')
        ON CONFLICT DO NOTHING;
    END IF;
    
END $$;