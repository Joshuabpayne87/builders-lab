-- Migration: Add user agent themes customization
-- Date: 2026-01-11
-- Purpose: Allow users to customize their AI agent interface

-- ============================================================================
-- Create user_agent_themes table
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_agent_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  theme_name TEXT NOT NULL,

  -- Visual properties stored as JSONB for flexibility
  colors JSONB NOT NULL DEFAULT '{
    "primary": "#8B5CF6",
    "secondary": "#EC4899",
    "background": "#0F172A",
    "userMessage": "#8B5CF6",
    "aiMessage": "#1E293B",
    "text": "#F1F5F9",
    "accent": "#EC4899"
  }'::jsonb,

  typography JSONB NOT NULL DEFAULT '{
    "fontFamily": "Inter, system-ui, sans-serif",
    "fontSize": "16px",
    "lineHeight": "1.5"
  }'::jsonb,

  layout JSONB NOT NULL DEFAULT '{
    "type": "sidebar",
    "messageStyle": "bubbles",
    "avatarStyle": "circular",
    "spacing": "comfortable"
  }'::jsonb,

  effects JSONB NOT NULL DEFAULT '{
    "animations": true,
    "glassEffect": false,
    "shadows": true,
    "gradients": true
  }'::jsonb,

  custom_css TEXT,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_agent_themes_user_id
  ON user_agent_themes(user_id);

CREATE INDEX IF NOT EXISTS idx_user_agent_themes_active
  ON user_agent_themes(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_user_agent_themes_created
  ON user_agent_themes(created_at DESC);

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE user_agent_themes ENABLE ROW LEVEL SECURITY;

-- Users can view their own themes
CREATE POLICY "Users can view own themes" ON user_agent_themes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own themes
CREATE POLICY "Users can create own themes" ON user_agent_themes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own themes
CREATE POLICY "Users can update own themes" ON user_agent_themes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own themes
CREATE POLICY "Users can delete own themes" ON user_agent_themes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- Function to ensure only one active theme per user
-- ============================================================================

CREATE OR REPLACE FUNCTION ensure_single_active_theme()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    -- Deactivate all other themes for this user
    UPDATE user_agent_themes
    SET is_active = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_active = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_ensure_single_active_theme ON user_agent_themes;
CREATE TRIGGER trigger_ensure_single_active_theme
  AFTER INSERT OR UPDATE ON user_agent_themes
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION ensure_single_active_theme();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE user_agent_themes IS 'Stores user-customized AI agent interface themes';
COMMENT ON COLUMN user_agent_themes.colors IS 'Color palette for the interface';
COMMENT ON COLUMN user_agent_themes.typography IS 'Font and text styling settings';
COMMENT ON COLUMN user_agent_themes.layout IS 'Layout and structural preferences';
COMMENT ON COLUMN user_agent_themes.effects IS 'Visual effects and animations';
COMMENT ON COLUMN user_agent_themes.custom_css IS 'Advanced: custom CSS overrides';
COMMENT ON COLUMN user_agent_themes.is_active IS 'Only one theme can be active per user';
