-- Check admin user profile data
SELECT 
  p.id,
  p.user_id,
  p.full_name,
  p.role,
  u.email,
  p.created_at,
  p.updated_at
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'admin@wayne.app.br' OR p.role = 'admin';

-- If admin user has null full_name, update it
UPDATE profiles 
SET 
  full_name = 'Administrador Wayne',
  updated_at = now()
WHERE user_id IN (
  SELECT u.id 
  FROM auth.users u 
  WHERE u.email = 'admin@wayne.app.br'
) 
AND (full_name IS NULL OR full_name = '');

-- Verify the update
SELECT 
  p.id,
  p.user_id,
  p.full_name,
  p.role,
  u.email,
  p.updated_at
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'admin@wayne.app.br' OR p.role = 'admin';