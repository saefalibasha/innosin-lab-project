-- Fix GLB upload issue: Update storage policy to use correct authentication check
-- Replace auth.role() with auth.uid() IS NOT NULL for proper storage authentication

DROP POLICY IF EXISTS "Allow authenticated uploads to documents bucket" ON storage.objects;

CREATE POLICY "Allow authenticated uploads to documents bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);