-- Drop temporary public upload policies
DROP POLICY IF EXISTS "Public can upload to documents (temp)" ON storage.objects;
DROP POLICY IF EXISTS "Public can update documents (temp)" ON storage.objects;

-- Admin policies for products/** path
CREATE POLICY "Admins can insert product assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'products'
  AND public.is_admin(public.get_current_user_email())
);

CREATE POLICY "Admins can update product assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'products'
  AND public.is_admin(public.get_current_user_email())
)
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'products'
  AND public.is_admin(public.get_current_user_email())
);

CREATE POLICY "Admins can delete product assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'products'
  AND public.is_admin(public.get_current_user_email())
);

CREATE POLICY "Admins can select product assets"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'products'
  AND public.is_admin(public.get_current_user_email())
);

-- Optional: Authenticated user policies for uploads/{auth.uid()}/** path
CREATE POLICY "Users can insert their own uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'uploads'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can update their own uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'uploads'
  AND (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'uploads'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can delete their own uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'uploads'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can select their own uploads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'uploads'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Public can read product assets
CREATE POLICY "Public can view product assets"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'products'
);