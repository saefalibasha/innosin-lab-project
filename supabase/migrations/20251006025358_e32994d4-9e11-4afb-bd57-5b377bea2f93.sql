-- Drop all existing policies on documents bucket
DROP POLICY IF EXISTS "Authenticated users can upload to documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;

-- Create broader policies for public role with auth.uid() check
CREATE POLICY "Anyone logged in can upload to documents"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone logged in can view documents"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone logged in can update documents"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
)
WITH CHECK (
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone logged in can delete documents"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
);