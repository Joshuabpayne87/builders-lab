-- Migration: Fix user powerups RLS (handles already-applied policies)
-- Date: 2026-01-10
-- Purpose: Clean version that works even if partially applied

-- ============================================================================
-- Drop ALL existing policies on bl_ai_powerups (regardless of name)
-- ============================================================================

DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'bl_ai_powerups' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON bl_ai_powerups', pol.policyname);
    END LOOP;
END $$;

-- ============================================================================
-- Create new policies for user-owned powerups
-- ============================================================================

-- SELECT: Users can view active global powerups OR their own powerups (active or inactive)
CREATE POLICY "Users can view global active or own powerups" ON bl_ai_powerups
  FOR SELECT
  TO authenticated
  USING (
    is_active = true OR
    created_by = auth.uid()
  );

-- INSERT: Users can create their own powerups, admins can create global powerups
CREATE POLICY "Users can create own powerups" ON bl_ai_powerups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- UPDATE: Users can update their own powerups, admins can update any
CREATE POLICY "Users can update own powerups" ON bl_ai_powerups
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- DELETE: Users can delete their own powerups, admins can delete any
CREATE POLICY "Users can delete own powerups" ON bl_ai_powerups
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- ============================================================================
-- Add vector search function (drop if exists first)
-- ============================================================================

DROP FUNCTION IF EXISTS match_powerups(vector(768), float, int, text, uuid);

CREATE FUNCTION match_powerups(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10,
  filter_conditions text DEFAULT 'is_active = true',
  user_id_filter uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  powerup_type text,
  name text,
  description text,
  icon text,
  category text,
  content jsonb,
  embedding vector(768),
  tags text[],
  is_active boolean,
  usage_count integer,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  EXECUTE format('
    SELECT
      p.id,
      p.powerup_type,
      p.name,
      p.description,
      p.icon,
      p.category,
      p.content,
      p.embedding,
      p.tags,
      p.is_active,
      p.usage_count,
      p.created_by,
      p.created_at,
      p.updated_at,
      1 - (p.embedding <=> $1) as similarity
    FROM bl_ai_powerups p
    WHERE
      (%s) AND
      (1 - (p.embedding <=> $1)) > $2 AND
      ($3 IS NULL OR p.created_by = $3 OR p.is_active = true)
    ORDER BY p.embedding <=> $1
    LIMIT $4
  ', filter_conditions)
  USING query_embedding, match_threshold, user_id_filter, match_count;
END;
$$;

-- ============================================================================
-- Add function to increment powerup usage (drop if exists first)
-- ============================================================================

DROP FUNCTION IF EXISTS increment_powerup_usage(uuid);

CREATE FUNCTION increment_powerup_usage(powerup_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE bl_ai_powerups
  SET usage_count = usage_count + 1
  WHERE id = powerup_id;
END;
$$;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON FUNCTION match_powerups IS 'Vector similarity search for powerups with optional user scoping. Returns global active powerups and user-specific powerups.';
COMMENT ON FUNCTION increment_powerup_usage IS 'Atomically increment usage count for a powerup';
