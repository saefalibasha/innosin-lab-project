-- Replace admin policies to use JWT email (no auth.users dependency) and be case-insensitive
DROP POLICY IF EXISTS "Admins can insert product assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can select product assets" ON storage.objects;

CREATE POLICY "Admins can insert product assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'products'
  AND EXISTS (
    SELECT 1 FROM public.admin_roles ar
    WHERE lower(ar.user_email) = lower((current_setting('request.jwt.claims', true)::jsonb ->> 'email'))
      AND ar.is_active = true
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
    SELECT 1 FROM public.admin_roles ar
    WHERE lower(ar.user_email) = lower((current_setting('request.jwt.claims', true)::jsonb ->> 'email'))
      AND ar.is_active = true
  )
)
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'products'
  AND EXISTS (
    SELECT 1 FROM public.admin_roles ar
    WHERE lower(ar.user_email) = lower((current_setting('request.jwt.claims', true)::jsonb ->> 'email'))
      AND ar.is_active = true
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
    SELECT 1 FROM public.admin_roles ar
    WHERE lower(ar.user_email) = lower((current_setting('request.jwt.claims', true)::jsonb ->> 'email'))
      AND ar.is_active = true
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
    SELECT 1 FROM public.admin_roles ar
    WHERE lower(ar.user_email) = lower((current_setting('request.jwt.claims', true)::jsonb ->> 'email'))
      AND ar.is_active = true
  )
);