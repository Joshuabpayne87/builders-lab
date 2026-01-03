-- =====================================================
-- SUPABASE STORAGE BUCKETS SETUP
-- =====================================================
-- Run this in your Supabase SQL Editor to create storage buckets
-- for user uploads (images, videos, documents)

-- Create Storage Buckets
-- =====================================================

-- 1. User Images Bucket (photos, graphics, screenshots)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-images',
  'user-images',
  false, -- Private by default
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- 2. User Videos Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-videos',
  'user-videos',
  false,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

-- 3. User Documents Bucket (PDFs, docs, etc)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-documents',
  'user-documents',
  false,
  20971520, -- 20MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv']
)
ON CONFLICT (id) DO NOTHING;

-- 4. User Avatars Bucket (profile pictures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true, -- Public for easy display
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies (Row Level Security)
-- =====================================================

-- USER IMAGES POLICIES
-- Users can upload their own images
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own images
CREATE POLICY "Users can view their own images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- USER VIDEOS POLICIES
CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- USER DOCUMENTS POLICIES
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- USER AVATARS POLICIES (Public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- ADMIN POLICIES (View all files)
-- =====================================================

CREATE POLICY "Admins can view all images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-images' AND
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

CREATE POLICY "Admins can view all videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-videos' AND
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-documents' AND
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Storage buckets created successfully!';
  RAISE NOTICE 'Buckets: user-images, user-videos, user-documents, user-avatars';
  RAISE NOTICE 'RLS policies applied for user isolation';
END $$;
