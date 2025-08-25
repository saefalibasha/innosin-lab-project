-- Fix GLB upload issue: Add permissive INSERT policy for documents bucket
-- Since documents bucket is public and we have application-level admin checks,
-- allow authenticated users to upload (admin verification happens in React app)

CREATE POLICY "Allow authenticated uploads to documents bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');