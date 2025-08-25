
-- Step 1: Clean up all existing conflicting storage policies
DROP POLICY IF EXISTS "Documents bucket simple admin access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Admin full access to documents" ON storage.objects;

-- Create simple, non-conflicting storage policies
CREATE POLICY "Authenticated users can upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can view files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

-- Update asset_uploads table to allow all authenticated users to log uploads
ALTER TABLE asset_uploads ALTER COLUMN uploaded_by DROP NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_asset_uploads_product_id ON asset_uploads(product_id);
CREATE INDEX IF NOT EXISTS idx_asset_uploads_file_path ON asset_uploads(file_path);

-- Create function to automatically process uploaded assets
CREATE OR REPLACE FUNCTION public.process_uploaded_asset(
  p_product_id uuid,
  p_file_path text,
  p_file_type text,
  p_public_url text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update product with appropriate asset paths based on file type
  IF p_file_type LIKE 'image/%' THEN
    -- Set as thumbnail and overview image if they don't exist
    UPDATE products 
    SET 
      thumbnail_path = COALESCE(thumbnail_path, p_public_url),
      overview_image_path = COALESCE(overview_image_path, p_public_url),
      updated_at = now()
    WHERE id = p_product_id;
  ELSIF p_file_type = 'model/gltf-binary' OR p_file_path LIKE '%.glb' THEN
    -- Set as 3D model
    UPDATE products 
    SET 
      model_path = p_public_url,
      updated_at = now()
    WHERE id = p_product_id;
  END IF;
END;
$$;
