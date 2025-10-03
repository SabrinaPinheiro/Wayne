-- Migration to ensure there's at least one admin user
-- This will update the first user in the profiles table to have admin role

-- First, let's check if there are any admin users
DO $$
DECLARE
    admin_count INTEGER;
    first_user_id UUID;
BEGIN
    -- Count existing admin users
    SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
    
    -- If no admin users exist, make the first user an admin
    IF admin_count = 0 THEN
        -- Get the first user ID (oldest created)
        SELECT user_id INTO first_user_id 
        FROM profiles 
        ORDER BY created_at ASC 
        LIMIT 1;
        
        -- Update the first user to be admin if a user exists
        IF first_user_id IS NOT NULL THEN
            UPDATE profiles 
            SET role = 'admin', updated_at = NOW() 
            WHERE user_id = first_user_id;
            
            RAISE NOTICE 'Updated user % to admin role', first_user_id;
        ELSE
            RAISE NOTICE 'No users found in profiles table';
        END IF;
    ELSE
        RAISE NOTICE 'Admin users already exist: %', admin_count;
    END IF;
END $$;