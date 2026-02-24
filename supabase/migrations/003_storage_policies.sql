-- ============================================
-- Setup Supabase Storage bucket for image uploads
-- ============================================
-- Creates a public bucket for business logos, covers, and product images.
-- Policies allow authenticated users to upload and manage their own files.

-- Create the public bucket (if not exists, run this in Supabase Dashboard > Storage)
-- Note: Bucket creation is typically done via the Supabase Dashboard or CLI,
-- not via SQL migrations. The policies below assume the bucket 'public' exists.

-- Allow anyone to read files (public bucket)
CREATE POLICY "public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'public');

-- Allow authenticated users to upload files
CREATE POLICY "auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'public'
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own uploaded files
CREATE POLICY "owner_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'public'
    AND auth.uid() = owner
  );

-- Allow users to delete their own uploaded files
CREATE POLICY "owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'public'
    AND auth.uid() = owner
  );
