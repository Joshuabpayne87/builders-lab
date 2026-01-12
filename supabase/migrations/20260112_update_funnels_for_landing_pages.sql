-- Add fields needed for simple landing page funnels
ALTER TABLE bl_funnels_projects
ADD COLUMN IF NOT EXISTS html_code TEXT,
ADD COLUMN IF NOT EXISTS strategy_doc TEXT,
ADD COLUMN IF NOT EXISTS submission_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft';

-- Update domain_slug to be NOT NULL for published funnels
-- Add check constraint for published funnels requiring slug
ALTER TABLE bl_funnels_projects
ADD CONSTRAINT require_slug_when_published
CHECK (status != 'published' OR domain_slug IS NOT NULL);

-- Add index for slug lookups
CREATE INDEX IF NOT EXISTS idx_funnels_domain_slug ON bl_funnels_projects(domain_slug);

-- Add index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_funnels_user_id ON bl_funnels_projects(user_id);

-- Add index for status
CREATE INDEX IF NOT EXISTS idx_funnels_status ON bl_funnels_projects(status);
