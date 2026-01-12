-- Allow public read access to published funnels
CREATE POLICY "Allow public read access to published funnels"
ON bl_funnels_projects
FOR SELECT
USING (status = 'published');
