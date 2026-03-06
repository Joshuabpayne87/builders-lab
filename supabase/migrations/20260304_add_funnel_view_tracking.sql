-- Add view tracking to funnels
ALTER TABLE bl_funnels_projects ADD COLUMN view_count INTEGER DEFAULT 0;
ALTER TABLE bl_funnels_projects ADD COLUMN last_viewed_at TIMESTAMP WITH TIME ZONE;

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_funnel_views(funnel_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE bl_funnels_projects
  SET view_count = view_count + 1,
      last_viewed_at = now()
  WHERE id = funnel_id;
END;
$$ LANGUAGE plpgsql;

-- Create index for efficient queries
CREATE INDEX idx_bl_funnels_projects_view_count ON bl_funnels_projects(view_count DESC);
CREATE INDEX idx_bl_funnels_projects_last_viewed_at ON bl_funnels_projects(last_viewed_at DESC);
