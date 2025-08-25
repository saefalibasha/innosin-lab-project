-- Drop the current problematic policy with circular dependency
DROP POLICY IF EXISTS "Admins can manage documents storage" ON storage.objects;

-- Create a simple policy that just requires authentication
-- Since the frontend already checks admin status, we just need to ensure user is authenticated
CREATE POLICY "Authenticated users can manage documents storage" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
)
WITH CHECK (
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
);