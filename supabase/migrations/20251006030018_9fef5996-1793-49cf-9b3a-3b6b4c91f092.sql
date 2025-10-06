-- TEMP: allow public uploads to documents bucket to unblock admin
CREATE POLICY "Public can upload to documents (temp)"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Public can update documents (temp)"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');