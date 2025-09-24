-- Clean up existing data and create correct demo users
-- First, clean up existing access_logs to avoid foreign key issues
DELETE FROM public.access_logs WHERE user_id IN (
  SELECT user_id FROM public.profiles WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%wayne.app.br'
  )
);

-- Delete existing profiles for demo users
DELETE FROM public.profiles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%wayne.app.br'
);

-- Delete existing demo users
DELETE FROM auth.users WHERE email IN ('demo@wayne.app.br', 'funcionario@wayne.app.br', 'gerente@wayne.app.br', 'admin@wayne.app.br');