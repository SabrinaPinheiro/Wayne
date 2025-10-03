-- Fix profiles policies to allow admins to update and delete user profiles
-- This migration addresses the issue where admins cannot edit or delete users

-- Drop existing policies for profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile data" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create new policies for profile updates
-- Users can update their own profile (excluding role changes)
CREATE POLICY "Users can update own profile data"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND role = (SELECT role FROM public.profiles WHERE user_id = auth.uid()) -- Prevent role changes by regular users
);

-- Admins can update any profile including roles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

-- Add delete policy for admins
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (public.get_current_user_role() = 'admin');

-- Success message
SELECT 'Profiles policies fixed successfully!' as status;