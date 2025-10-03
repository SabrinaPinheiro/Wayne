-- Fix profiles update policy to allow admins to update user roles
-- This migration addresses the issue where role changes don't persist in the database

-- Drop existing update policy for profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policies for profile updates
-- Users can update their own profile (excluding role changes)
CREATE POLICY "Users can update own profile data"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND (OLD.role = NEW.role OR NEW.role IS NULL) -- Prevent role changes by regular users
);

-- Admins can update any profile including roles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

-- Success message
SELECT 'Profiles update policies fixed successfully!' as status;