-- Remove theme and language columns from user_settings table
-- These columns are no longer needed as we will only support dark theme and Portuguese language

ALTER TABLE user_settings 
DROP COLUMN IF EXISTS theme,
DROP COLUMN IF EXISTS language;

-- Add comment to document the change
COMMENT ON TABLE user_settings IS 'User settings table - theme and language columns removed as we only support dark theme and Portuguese language';