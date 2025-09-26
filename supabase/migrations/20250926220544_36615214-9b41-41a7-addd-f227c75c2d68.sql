-- Função para deletar avatar anterior quando o perfil é atualizado
CREATE OR REPLACE FUNCTION public.handle_avatar_cleanup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
    old_avatar_path text;
    file_name text;
BEGIN
    -- Se existe uma foto anterior e é diferente da nova
    IF OLD.avatar_url IS NOT NULL AND OLD.avatar_url != NEW.avatar_url THEN
        -- Extrair o nome do arquivo da URL antiga
        file_name := split_part(OLD.avatar_url, '/', -1);
        old_avatar_path := OLD.user_id || '/' || file_name;
        
        -- Deletar o arquivo do storage
        DELETE FROM storage.objects 
        WHERE bucket_id = 'avatars' 
        AND name = old_avatar_path;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger para limpar avatar anterior quando o perfil é atualizado
DROP TRIGGER IF EXISTS cleanup_old_avatar ON public.profiles;
CREATE TRIGGER cleanup_old_avatar
    BEFORE UPDATE OF avatar_url ON public.profiles
    FOR EACH ROW
    WHEN (OLD.avatar_url IS DISTINCT FROM NEW.avatar_url)
    EXECUTE FUNCTION public.handle_avatar_cleanup();

-- Função para garantir que apenas um avatar por usuário existe no storage
CREATE OR REPLACE FUNCTION public.ensure_single_avatar_per_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
    user_folder text;
    existing_files record;
BEGIN
    -- Extrair o ID do usuário do path do arquivo
    user_folder := split_part(NEW.name, '/', 1);
    
    -- Se este é um arquivo de avatar
    IF NEW.bucket_id = 'avatars' AND user_folder ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        -- Deletar outros arquivos do mesmo usuário (exceto o atual)
        DELETE FROM storage.objects 
        WHERE bucket_id = 'avatars' 
        AND name LIKE user_folder || '/%'
        AND name != NEW.name
        AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger para garantir um avatar por usuário no storage
DROP TRIGGER IF EXISTS ensure_single_avatar ON storage.objects;
CREATE TRIGGER ensure_single_avatar
    AFTER INSERT ON storage.objects
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_single_avatar_per_user();