-- Implementar CASCADE DELETE para todas as tabelas relacionadas aos usuários
-- Quando um usuário for excluído, todos os dados relacionados serão automaticamente removidos

-- 1. Primeiro, remover as constraints existentes que não têm CASCADE
ALTER TABLE public.access_logs DROP CONSTRAINT IF EXISTS access_logs_user_id_fkey;
ALTER TABLE public.access_logs DROP CONSTRAINT IF EXISTS fk_access_logs_user;

ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_created_by_fkey;

ALTER TABLE public.user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- 2. Adicionar foreign key para alerts (que não tinha)
-- Primeiro verificar se já existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'alerts_user_id_fkey' 
        AND table_name = 'alerts'
    ) THEN
        ALTER TABLE public.alerts 
        ADD CONSTRAINT alerts_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Recriar todas as constraints com CASCADE DELETE
ALTER TABLE public.access_logs 
ADD CONSTRAINT access_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.resources 
ADD CONSTRAINT resources_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.user_settings 
ADD CONSTRAINT user_settings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Comentários explicativos
COMMENT ON CONSTRAINT access_logs_user_id_fkey ON public.access_logs IS 
'Cascade delete: quando usuário é excluído, todos os logs de acesso são removidos';

COMMENT ON CONSTRAINT alerts_user_id_fkey ON public.alerts IS 
'Cascade delete: quando usuário é excluído, todos os alertas são removidos';

COMMENT ON CONSTRAINT user_settings_user_id_fkey ON public.user_settings IS 
'Cascade delete: quando usuário é excluído, as configurações são removidas';

COMMENT ON CONSTRAINT profiles_user_id_fkey ON public.profiles IS 
'Cascade delete: quando usuário é excluído, o perfil é removido';

COMMENT ON CONSTRAINT resources_created_by_fkey ON public.resources IS 
'Set null: quando usuário é excluído, o campo created_by é definido como NULL para preservar os recursos';