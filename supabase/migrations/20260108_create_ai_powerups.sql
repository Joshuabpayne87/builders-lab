-- AI Powerup Marketplace Migration
-- Creates tables for global powerup library, user loadouts, session overrides, and analytics

-- Enable pgvector extension if not already enabled (for embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- Table 1: bl_ai_powerups - Global Powerup Library
-- ============================================================================
CREATE TABLE IF NOT EXISTS bl_ai_powerups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  powerup_type TEXT NOT NULL CHECK (powerup_type IN ('SKILL', 'PERSONA', 'KNOWLEDGE')),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Icon name or emoji (e.g., '🔍', 'SearchIcon')
  category TEXT, -- 'marketing', 'development', 'research', 'copywriting', 'analysis', 'custom'

  -- Content (JSONB for flexibility based on powerup type)
  content JSONB NOT NULL,
  -- For SKILL: { instructions: "...", examples: ["...", "..."], use_cases: ["..."] }
  -- For PERSONA: { role: "...", tone: "...", expertise: ["..."], system_prompt: "..." }
  -- For KNOWLEDGE: { file_url: "...", file_type: "pdf", file_size: 12345, processed_text: "...", chunks: [...] }

  -- Optional semantic search (768-dimensional vector from Gemini text-embedding-004)
  embedding vector(768),

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0, -- Track popularity

  -- Admin tracking
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for bl_ai_powerups
CREATE INDEX idx_powerups_type ON bl_ai_powerups(powerup_type);
CREATE INDEX idx_powerups_category ON bl_ai_powerups(category);
CREATE INDEX idx_powerups_active ON bl_ai_powerups(is_active);
CREATE INDEX idx_powerups_created_by ON bl_ai_powerups(created_by);
CREATE INDEX idx_powerups_embedding ON bl_ai_powerups USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- RLS Policies for bl_ai_powerups
ALTER TABLE bl_ai_powerups ENABLE ROW LEVEL SECURITY;

-- Anyone (authenticated users) can read active powerups
CREATE POLICY "Anyone can view active powerups" ON bl_ai_powerups
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Only admins can create powerups
CREATE POLICY "Admins can create powerups" ON bl_ai_powerups
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');

-- Only admins can update powerups
CREATE POLICY "Admins can update powerups" ON bl_ai_powerups
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');

-- Only admins can delete powerups
CREATE POLICY "Admins can delete powerups" ON bl_ai_powerups
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');

-- ============================================================================
-- Table 2: bl_ai_loadouts - User Saved Configurations
-- ============================================================================
CREATE TABLE IF NOT EXISTS bl_ai_loadouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default Loadout',
  is_default BOOLEAN DEFAULT false,

  -- Equipped powerups (array of UUIDs referencing bl_ai_powerups)
  equipped_powerups UUID[] DEFAULT '{}',

  -- Slot mapping for UI (which powerup in which slot)
  slot_config JSONB DEFAULT '{}',
  -- Example: { "marketing": "uuid", "copywriter": "uuid", "brain": ["uuid1", "uuid2"] }

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Constraint: Only one default loadout per user
CREATE UNIQUE INDEX idx_loadouts_user_default ON bl_ai_loadouts(user_id) WHERE is_default = true;

-- Other indexes for bl_ai_loadouts
CREATE INDEX idx_loadouts_user ON bl_ai_loadouts(user_id);
CREATE INDEX idx_loadouts_default ON bl_ai_loadouts(user_id, is_default);

-- RLS Policies for bl_ai_loadouts
ALTER TABLE bl_ai_loadouts ENABLE ROW LEVEL SECURITY;

-- Users can view their own loadouts
CREATE POLICY "Users can view own loadouts" ON bl_ai_loadouts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own loadouts
CREATE POLICY "Users can create own loadouts" ON bl_ai_loadouts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own loadouts
CREATE POLICY "Users can update own loadouts" ON bl_ai_loadouts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own loadouts
CREATE POLICY "Users can delete own loadouts" ON bl_ai_loadouts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- Table 3: bl_ai_session_overrides - Temporary Session State
-- ============================================================================
CREATE TABLE IF NOT EXISTS bl_ai_session_overrides (
  session_id UUID PRIMARY KEY, -- Generated client-side, stored in sessionStorage
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Equipped powerups for this session (temporary)
  equipped_powerups UUID[] DEFAULT '{}',

  -- Slot mapping for this session
  slot_config JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);

-- Indexes for bl_ai_session_overrides
CREATE INDEX idx_session_overrides_user ON bl_ai_session_overrides(user_id);
CREATE INDEX idx_session_overrides_expires ON bl_ai_session_overrides(expires_at);

-- RLS Policies for bl_ai_session_overrides
ALTER TABLE bl_ai_session_overrides ENABLE ROW LEVEL SECURITY;

-- Users can view their own session overrides
CREATE POLICY "Users can view own session overrides" ON bl_ai_session_overrides
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own session overrides
CREATE POLICY "Users can create own session overrides" ON bl_ai_session_overrides
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own session overrides
CREATE POLICY "Users can update own session overrides" ON bl_ai_session_overrides
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own session overrides
CREATE POLICY "Users can delete own session overrides" ON bl_ai_session_overrides
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- Table 4: bl_ai_powerup_analytics - Usage Tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS bl_ai_powerup_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  powerup_id UUID REFERENCES bl_ai_powerups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('equipped', 'unequipped', 'used_in_chat')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for bl_ai_powerup_analytics
CREATE INDEX idx_analytics_powerup ON bl_ai_powerup_analytics(powerup_id);
CREATE INDEX idx_analytics_user ON bl_ai_powerup_analytics(user_id);
CREATE INDEX idx_analytics_created_at ON bl_ai_powerup_analytics(created_at DESC);

-- RLS Policies for bl_ai_powerup_analytics
ALTER TABLE bl_ai_powerup_analytics ENABLE ROW LEVEL SECURITY;

-- Users can view their own analytics
CREATE POLICY "Users can view own analytics" ON bl_ai_powerup_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Anyone can insert analytics (system tracks usage)
CREATE POLICY "Anyone can insert analytics" ON bl_ai_powerup_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all analytics
CREATE POLICY "Admins can view all analytics" ON bl_ai_powerup_analytics
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to cleanup expired session overrides (to be run via cron or manually)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM bl_ai_session_overrides WHERE expires_at < NOW();
END;
$$;

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers to auto-update updated_at column
CREATE TRIGGER update_powerups_updated_at
  BEFORE UPDATE ON bl_ai_powerups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loadouts_updated_at
  BEFORE UPDATE ON bl_ai_loadouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Storage Bucket for Knowledge Files
-- ============================================================================

-- Create storage bucket for powerup knowledge files (admin uploads only)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-powerup-files', 'ai-powerup-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ai-powerup-files bucket
-- Only admins can upload
CREATE POLICY "Admins can upload powerup files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ai-powerup-files' AND
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- Anyone (authenticated) can read powerup files
CREATE POLICY "Anyone can read powerup files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'ai-powerup-files');

-- Only admins can update powerup files
CREATE POLICY "Admins can update powerup files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'ai-powerup-files' AND
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- Only admins can delete powerup files
CREATE POLICY "Admins can delete powerup files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'ai-powerup-files' AND
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE bl_ai_powerups IS 'Global powerup library containing skills, personas, and knowledge files managed by admins';
COMMENT ON TABLE bl_ai_loadouts IS 'User-saved powerup configurations (presets)';
COMMENT ON TABLE bl_ai_session_overrides IS 'Temporary session-specific powerup configurations (24hr expiry)';
COMMENT ON TABLE bl_ai_powerup_analytics IS 'Usage tracking for powerups (equip events, chat usage)';

COMMENT ON COLUMN bl_ai_powerups.powerup_type IS 'Type of powerup: SKILL (instructions), PERSONA (role/tone), KNOWLEDGE (file)';
COMMENT ON COLUMN bl_ai_powerups.content IS 'Flexible JSONB content structure specific to powerup_type';
COMMENT ON COLUMN bl_ai_powerups.embedding IS '768-dimensional vector for semantic search (Gemini text-embedding-004)';
COMMENT ON COLUMN bl_ai_loadouts.is_default IS 'Whether this is the user default loadout (only one per user)';
COMMENT ON COLUMN bl_ai_loadouts.slot_config IS 'UI slot mapping: {"marketing": "uuid", "brain": ["uuid1", "uuid2"]}';
COMMENT ON COLUMN bl_ai_session_overrides.session_id IS 'Client-generated UUID stored in sessionStorage';
COMMENT ON COLUMN bl_ai_session_overrides.expires_at IS 'Auto-set to 24 hours from creation';
