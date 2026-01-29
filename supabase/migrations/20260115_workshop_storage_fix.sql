-- =====================================================
-- WORKSHOP STORAGE FIX
-- =====================================================
-- Run this in Supabase SQL Editor to enable workshop image uploads

-- Option 1: Make user-images bucket public (simplest)
UPDATE storage.buckets
SET public = true
WHERE id = 'user-images';

-- Option 2: Add policy for anyone to view workshop images
-- (Use this if you want to keep the bucket private for other images)
--
-- CREATE POLICY "Anyone can view workshop images"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (
--   bucket_id = 'user-images' AND
--   (storage.foldername(name))[2] = 'workshops'
-- );

-- Also ensure admins can upload to any folder (not just their own user ID folder)
DO $$
BEGIN
  -- Drop existing policy if it exists and recreate with admin support
  DROP POLICY IF EXISTS "Admins can upload images anywhere" ON storage.objects;

  CREATE POLICY "Admins can upload images anywhere"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-images' AND
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

  RAISE NOTICE 'Storage policies updated for workshops!';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Policy already exists, skipping...';
END $$;

-- Grant update permission for admins too
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can update images anywhere" ON storage.objects;

  CREATE POLICY "Admins can update images anywhere"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'user-images' AND
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Update policy already exists, skipping...';
END $$;
