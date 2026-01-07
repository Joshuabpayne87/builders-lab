-- Create the unified sessions table for all Builder's Lab apps
-- This table stores user sessions with flexible JSONB data structure
-- Created: 2026-01-07

CREATE TABLE bl_app_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- App identification
  app_name TEXT NOT NULL CHECK (app_name IN (
    'banana-blitz',
    'unravel',
    'insightlens',
    'promptstash',
    'component-studio',
    'serendipity'
  )),

  -- Session metadata
  session_type TEXT NOT NULL, -- 'campaign', 'article', 'transformation', 'prompt', 'component', 'workflow'
  title TEXT NOT NULL, -- User-friendly title for the session

  -- Flexible data storage (JSONB for app-specific data)
  data JSONB NOT NULL, -- All app-specific data goes here

  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Tags, scores, etc.

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE bl_app_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own sessions
CREATE POLICY "Users can view own sessions" ON bl_app_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON bl_app_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON bl_app_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON bl_app_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX bl_app_sessions_user_id_idx ON bl_app_sessions(user_id);
CREATE INDEX bl_app_sessions_app_name_idx ON bl_app_sessions(app_name);
CREATE INDEX bl_app_sessions_created_at_idx ON bl_app_sessions(created_at DESC);
CREATE INDEX bl_app_sessions_user_app_idx ON bl_app_sessions(user_id, app_name, created_at DESC);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bl_app_sessions_updated_at_trigger
  BEFORE UPDATE ON bl_app_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comment
COMMENT ON TABLE bl_app_sessions IS 'Unified session storage for all Builder''s Lab apps. Uses JSONB for flexible app-specific data storage.';
