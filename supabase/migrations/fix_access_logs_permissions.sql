-- Fix permissions for access_logs and related tables
-- This migration addresses the 403 error by ensuring proper table permissions

-- Grant basic permissions to anon role for public access
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.resources TO anon;
GRANT SELECT ON public.access_logs TO anon;

-- Grant full permissions to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON public.profiles TO authenticated;
GRANT ALL PRIVILEGES ON public.resources TO authenticated;
GRANT ALL PRIVILEGES ON public.access_logs TO authenticated;
GRANT ALL PRIVILEGES ON public.alerts TO authenticated;

-- Grant sequence permissions for UUID generation
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Ensure RLS policies are working correctly by recreating them
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own access logs" ON public.access_logs;
DROP POLICY IF EXISTS "Managers and admins can view all access logs" ON public.access_logs;
DROP POLICY IF EXISTS "All authenticated users can create access logs" ON public.access_logs;
DROP POLICY IF EXISTS "Admins can update access logs" ON public.access_logs;
DROP POLICY IF EXISTS "Admins can delete access logs" ON public.access_logs;

-- Recreate access_logs policies with better logic
CREATE POLICY "Authenticated users can view access logs based on role"
ON public.access_logs
FOR SELECT
TO authenticated
USING (
  -- Users can see their own logs
  auth.uid() = user_id 
  OR 
  -- Managers and admins can see all logs
  public.get_current_user_role() IN ('admin', 'gerente')
);

CREATE POLICY "Authenticated users can create access logs"
ON public.access_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and managers can update access logs"
ON public.access_logs
FOR UPDATE
TO authenticated
USING (public.get_current_user_role() IN ('admin', 'gerente'));

CREATE POLICY "Admins can delete access logs"
ON public.access_logs
FOR DELETE
TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Ensure resources policies allow proper joins
DROP POLICY IF EXISTS "All authenticated users can view resources" ON public.resources;

CREATE POLICY "Authenticated users can view resources"
ON public.resources
FOR SELECT
TO authenticated
USING (true);

-- Grant permissions on auth schema for user lookups
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Verify current permissions
SELECT 
  grantee, 
  table_name, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND grantee IN ('anon', 'authenticated') 
  AND table_name IN ('access_logs', 'resources', 'profiles')
ORDER BY table_name, grantee;

-- Success message
SELECT 'Permissions for access_logs fixed successfully!' as status;