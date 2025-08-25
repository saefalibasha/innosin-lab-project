-- First, let's check what policies exist for the documents bucket
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%document%';

-- Drop ALL existing policies that might conflict with documents bucket
DROP POLICY IF EXISTS "Authenticated users can manage documents storage" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage documents storage" ON storage.objects;
DROP POLICY IF EXISTS "Documents bucket access policy" ON storage.objects;
DROP POLICY IF EXISTS "Public can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;

-- Create ONE comprehensive policy that handles everything properly
CREATE POLICY "Documents bucket access policy" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'documents' AND (
    -- Allow public read access since bucket is public
    true
  )
)
WITH CHECK (
  bucket_id = 'documents' AND (
    -- Only authenticated users can upload/modify
    auth.uid() IS NOT NULL
  )
);