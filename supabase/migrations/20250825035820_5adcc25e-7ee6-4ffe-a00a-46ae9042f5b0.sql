-- Drop the problematic policy causing RLS violations
DROP POLICY IF EXISTS "Complete documents bucket policy" ON storage.objects;

-- Create new admin-focused policy that uses the working admin role system
CREATE POLICY "Documents bucket admin access" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'documents' -- Allow public read access
)
WITH CHECK (
  bucket_id = 'documents' AND is_admin(get_current_user_email()) -- Only admins can upload
);