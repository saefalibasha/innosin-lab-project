-- Check current storage policies for documents bucket
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- Fix storage policies for admin uploads
CREATE POLICY "Admin users can upload files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' AND 
  is_admin(get_current_user_email())
);

CREATE POLICY "Admin users can view all files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' AND 
  (public OR is_admin(get_current_user_email()))
);

CREATE POLICY "Admin users can update files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'documents' AND 
  is_admin(get_current_user_email())
);

CREATE POLICY "Admin users can delete files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'documents' AND 
  is_admin(get_current_user_email())
);