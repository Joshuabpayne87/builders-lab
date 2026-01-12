-- Function to safely increment submission count
CREATE OR REPLACE FUNCTION increment_funnel_submissions(funnel_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE bl_funnels_projects
  SET
    submission_count = COALESCE(submission_count, 0) + 1,
    updated_at = NOW()
  WHERE id = funnel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
