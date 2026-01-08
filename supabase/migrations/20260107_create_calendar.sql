-- Content Calendar and Task Management
-- Enables users to plan content, track tasks, and get AI-powered reminders

CREATE TYPE task_status AS ENUM ('draft', 'in_progress', 'scheduled', 'completed', 'cancelled');
CREATE TYPE content_platform AS ENUM ('linkedin', 'instagram', 'twitter', 'facebook', 'youtube', 'tiktok', 'blog', 'email', 'other');
CREATE TYPE content_type AS ENUM ('image', 'carousel', 'video', 'blog_post', 'social_post', 'podcast', 'infographic', 'story', 'reel', 'other');

CREATE TABLE bl_content_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Core fields
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status task_status DEFAULT 'draft' NOT NULL,

  -- Content details
  platform content_platform,
  content_type content_type,

  -- Linking to existing work
  linked_session_id UUID REFERENCES bl_app_sessions(id) ON DELETE SET NULL,
  app_needed TEXT CHECK (app_needed IN (
    'banana-blitz', 'unravel', 'insightlens',
    'promptstash', 'component-studio', 'serendipity', null
  )),

  -- Reminders
  reminder_sent BOOLEAN DEFAULT false,
  reminder_date TIMESTAMP WITH TIME ZONE,

  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE bl_content_calendar ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users only access their own tasks)
CREATE POLICY "Users can view own calendar tasks" ON bl_content_calendar
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar tasks" ON bl_content_calendar
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar tasks" ON bl_content_calendar
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar tasks" ON bl_content_calendar
  FOR DELETE USING (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX bl_content_calendar_user_id_idx ON bl_content_calendar(user_id);
CREATE INDEX bl_content_calendar_user_due_date_idx ON bl_content_calendar(user_id, due_date);
CREATE INDEX bl_content_calendar_user_status_idx ON bl_content_calendar(user_id, status);
CREATE INDEX bl_content_calendar_reminder_idx ON bl_content_calendar(user_id, reminder_date)
  WHERE reminder_sent = false AND reminder_date IS NOT NULL;

-- Auto-update updated_at timestamp
CREATE TRIGGER bl_content_calendar_updated_at_trigger
  BEFORE UPDATE ON bl_content_calendar
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get upcoming tasks (for reminders)
CREATE OR REPLACE FUNCTION get_upcoming_tasks(user_uuid UUID, hours_ahead INTEGER DEFAULT 24)
RETURNS TABLE (
  id UUID,
  title TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  status task_status,
  platform content_platform,
  content_type content_type,
  has_linked_session BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.title,
    c.due_date,
    c.status,
    c.platform,
    c.content_type,
    (c.linked_session_id IS NOT NULL) as has_linked_session
  FROM bl_content_calendar c
  WHERE c.user_id = user_uuid
    AND c.due_date BETWEEN NOW() AND (NOW() + (hours_ahead || ' hours')::INTERVAL)
    AND c.status NOT IN ('completed', 'cancelled')
  ORDER BY c.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check incomplete tasks
CREATE OR REPLACE FUNCTION get_incomplete_tasks(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  platform content_platform,
  content_type content_type,
  has_linked_session BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.title,
    c.due_date,
    c.platform,
    c.content_type,
    (c.linked_session_id IS NOT NULL) as has_linked_session
  FROM bl_content_calendar c
  WHERE c.user_id = user_uuid
    AND c.due_date <= NOW()
    AND c.status NOT IN ('completed', 'cancelled')
    AND c.linked_session_id IS NULL  -- Tasks without created content
  ORDER BY c.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
