-- Drop the current documents policy that's failing
DROP POLICY IF EXISTS "Authenticated users can manage documents" ON storage.objects;

-- Create a more robust policy that checks both authentication and admin status
CREATE POLICY "Admins can manage documents storage" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'documents' AND (
    -- Allow if user is authenticated
    auth.uid() IS NOT NULL OR
    -- Or if user is an active admin
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE admin_roles.user_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      ) 
      AND admin_roles.is_active = true
    )
  )
)
WITH CHECK (
  bucket_id = 'documents' AND (
    -- Allow if user is authenticated
    auth.uid() IS NOT NULL OR
    -- Or if user is an active admin
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE admin_roles.user_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      ) 
      AND admin_roles.is_active = true
    )
  )
);