-- Fix storage policies for admin uploads
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder wfdbqfbodppniqzoxnyf" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 1pd47rne_wfdbqfbodppniqzoxnyf" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder nqlh02vk_wfdbqfbodppniqzoxnyf" ON storage.objects;

-- Create comprehensive storage policies for documents bucket
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
  (bucket_id = 'documents' OR is_admin(get_current_user_email()))
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

-- Allow public read access to documents for product display
CREATE POLICY "Public can view documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents');