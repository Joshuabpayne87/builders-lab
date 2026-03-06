-- Add email notification preference to user settings
ALTER TABLE bl_users_settings ADD COLUMN IF NOT EXISTS funnel_lead_email_notifications BOOLEAN DEFAULT true;

-- Create index on the new column for faster queries
CREATE INDEX IF NOT EXISTS idx_users_settings_funnel_email_notifications
ON bl_users_settings(user_id)
WHERE funnel_lead_email_notifications = true;
