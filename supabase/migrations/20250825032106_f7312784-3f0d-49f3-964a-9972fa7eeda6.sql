-- Fix storage policies - replace problematic function calls with direct auth checks
-- Drop the current policies that use get_current_user_email() which doesn't work in storage context
DROP POLICY IF EXISTS "Admins can insert files in documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can select files in documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update files in documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete files in documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public can view documents bucket" ON storage.objects;

-- Create working storage policies using direct auth checks
-- Admin insert policy using direct lookup
CREATE POLICY "Admin can upload to documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND 
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  )
);

-- Admin select policy 
CREATE POLICY "Admin can view documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND 
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  )
);

-- Admin update policy
CREATE POLICY "Admin can update documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND 
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  )
);

-- Admin delete policy
CREATE POLICY "Admin can delete documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND 
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  )
);

-- Public read access for documents bucket
CREATE POLICY "Public read access to documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'documents');