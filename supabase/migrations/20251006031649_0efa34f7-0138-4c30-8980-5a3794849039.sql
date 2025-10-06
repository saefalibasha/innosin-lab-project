-- Drop the policies that aren't working
DROP POLICY IF EXISTS "Admins can insert product assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can select product assets" ON storage.objects;

-- Create simplified admin policies that directly check admin_roles
CREATE POLICY "Admins can insert product assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'products'
  AND EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  )
);

CREATE POLICY "Admins can update product assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'products'
  AND EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  )
)
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'products'
  AND EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  )
);

CREATE POLICY "Admins can delete product assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'products'
  AND EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  )
);

CREATE POLICY "Admins can select product assets"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'products'
  AND EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  )
);