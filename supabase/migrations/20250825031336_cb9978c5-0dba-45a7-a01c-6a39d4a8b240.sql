-- Clean up conflicting storage policies and create proper admin policies
-- First drop the conflicting policies
DROP POLICY IF EXISTS "Admin users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can view all files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;

-- Create clean admin policies for documents bucket
CREATE POLICY "Admins can insert files in documents bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'documents' AND 
  is_admin(get_current_user_email())
);

CREATE POLICY "Admins can select files in documents bucket"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'documents' AND 
  is_admin(get_current_user_email())
);

CREATE POLICY "Admins can update files in documents bucket"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'documents' AND 
  is_admin(get_current_user_email())
);

CREATE POLICY "Admins can delete files in documents bucket"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'documents' AND 
  is_admin(get_current_user_email())
);

-- Also ensure public can read documents for public access
CREATE POLICY "Public can view documents bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'documents');