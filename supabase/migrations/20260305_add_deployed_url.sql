-- Add deployed_url column to bl_funnels_projects
BEGIN;

ALTER TABLE bl_funnels_projects
ADD COLUMN IF NOT EXISTS deployed_url TEXT;

-- Add index for deployed_url lookups
CREATE INDEX IF NOT EXISTS idx_funnels_deployed_url ON bl_funnels_projects(deployed_url);

COMMIT;
