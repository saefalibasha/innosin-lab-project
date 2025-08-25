-- Fix storage policy for documents bucket to allow all operations for authenticated users
DROP POLICY IF EXISTS "Allow authenticated uploads to documents bucket" ON storage.objects;

-- Create comprehensive policy for authenticated users to manage documents
CREATE POLICY "Authenticated users can manage documents" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL)
WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);