-- Verificar se o bucket 'avatars' existe
SELECT 
  id,
  name,
  public,
  created_at,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'avatars';

-- Se não existir, criar o bucket 'avatars'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE name = 'avatars'
);

-- Verificar políticas RLS para o bucket avatars
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%avatar%';

-- Garantir que as políticas RLS existam para o bucket avatars
-- Política para visualizar avatars (público)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Avatar images are publicly accessible'
  ) THEN
    EXECUTE 'CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = ''avatars'')';
  END IF;
END $$;

-- Política para upload de avatars (usuários autenticados)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Users can upload their own avatar'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''avatars'' AND auth.uid()::text = (storage.foldername(name))[1])';
  END IF;
END $$;

-- Política para atualizar avatars (usuários autenticados)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Users can update their own avatar'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = ''avatars'' AND auth.uid()::text = (storage.foldername(name))[1])';
  END IF;
END $$;

-- Política para deletar avatars (usuários autenticados)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Users can delete their own avatar'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = ''avatars'' AND auth.uid()::text = (storage.foldername(name))[1])';
  END IF;
END $$;

-- Verificar resultado final
SELECT 'Bucket avatars configurado com sucesso!' as status;