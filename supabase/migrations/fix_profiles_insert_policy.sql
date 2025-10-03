-- Fix profiles INSERT policy to allow admins to create user profiles
-- This migration addresses the issue where admins cannot create new users

-- Add INSERT policy for admins to create profiles
CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (public.get_current_user_role() = 'admin');

-- Success message
SELECT 'Profiles INSERT policy added successfully!' as status;