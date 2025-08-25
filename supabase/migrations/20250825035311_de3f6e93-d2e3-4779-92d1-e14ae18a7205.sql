-- Remove the conflicting duplicate policy that's causing the RLS violation
DROP POLICY IF EXISTS "Public read access to documents" ON storage.objects;

-- Also check if there are any other documents-related policies we missed
-- Let's also ensure our main policy covers everything properly
DROP POLICY IF EXISTS "Documents bucket access policy" ON storage.objects;

-- Recreate a single, comprehensive policy for documents bucket
CREATE POLICY "Complete documents bucket policy" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'documents'
)
WITH CHECK (
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
);