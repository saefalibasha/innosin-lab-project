
-- Drop the current failing policy
DROP POLICY IF EXISTS "Documents bucket admin access" ON storage.objects;

-- Create a new working policy that directly checks admin roles
CREATE POLICY "Documents bucket simple admin access" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'documents' -- Allow public read access for all documents
)
WITH CHECK (
  bucket_id = 'documents' AND (
    -- Only allow admins to upload/modify files by directly checking admin_roles
    EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND is_active = true
    )
  )
);
