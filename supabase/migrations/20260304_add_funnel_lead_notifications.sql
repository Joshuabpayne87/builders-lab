-- Create trigger to notify on funnel lead capture

-- First, ensure the FUNNEL_LEAD_CAPTURED notification type exists
-- We'll modify the type constraint to include it if needed

ALTER TABLE bl_crm_notifications
DROP CONSTRAINT IF EXISTS bl_crm_notifications_type_check;

ALTER TABLE bl_crm_notifications
ADD CONSTRAINT bl_crm_notifications_type_check
CHECK (type IN ('REMINDER', 'OVERDUE_TASK', 'STALE_CONTACT', 'DEAL_UPDATE', 'WORKFLOW_ACTION', 'INSIGHT', 'FUNNEL_LEAD_CAPTURED'));

-- Create the notification trigger function
CREATE OR REPLACE FUNCTION notify_funnel_lead_capture()
RETURNS TRIGGER AS $$
DECLARE
  funnel_name TEXT;
  contact_name TEXT;
  contact_email TEXT;
  user_id UUID;
BEGIN
  -- Get funnel name and user_id
  SELECT name, user_id INTO funnel_name, user_id
  FROM bl_funnels_projects
  WHERE id = NEW.funnel_id;

  -- Get contact details
  SELECT name, email INTO contact_name, contact_email
  FROM bl_crm_contacts
  WHERE id = NEW.contact_id;

  -- Insert notification if we have valid data
  IF user_id IS NOT NULL THEN
    INSERT INTO bl_crm_notifications (
      user_id,
      type,
      title,
      message,
      priority,
      contact_id,
      action_data
    ) VALUES (
      user_id,
      'FUNNEL_LEAD_CAPTURED',
      'New Lead Captured! 🎉',
      'New lead from ' || COALESCE(funnel_name, 'Funnel') || ': ' || COALESCE(contact_name, 'Unknown') || ' (' || COALESCE(contact_email, 'no email') || ')',
      'high',
      NEW.contact_id,
      jsonb_build_object(
        'funnel_id', NEW.funnel_id,
        'funnel_name', COALESCE(funnel_name, 'Funnel'),
        'contact_name', COALESCE(contact_name, 'Unknown'),
        'contact_email', COALESCE(contact_email, ''),
        'url', '/apps/crm?contact=' || NEW.contact_id::text
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS funnel_lead_notification ON bl_funnels_leads;

-- Create the trigger
CREATE TRIGGER funnel_lead_notification
AFTER INSERT ON bl_funnels_leads
FOR EACH ROW EXECUTE FUNCTION notify_funnel_lead_capture();
