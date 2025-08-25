
-- Remove restrictive RLS policy on asset_uploads table and create a permissive one for uploads
DROP POLICY IF EXISTS "Admins can manage asset uploads" ON public.asset_uploads;

-- Create a new policy that allows anyone to insert asset upload records
CREATE POLICY "Allow public asset upload logging" ON public.asset_uploads
  FOR INSERT 
  WITH CHECK (true);

-- Keep the admin read policy separate
CREATE POLICY "Admins can read asset uploads" ON public.asset_uploads
  FOR SELECT 
  USING (is_admin(get_current_user_email()));

-- Create a policy for the documents storage bucket that allows public uploads
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
  'allow-public-uploads',
  'documents',
  'Allow public file uploads',
  'true',
  'true',
  'INSERT'
) ON CONFLICT (id) DO UPDATE SET
  definition = 'true',
  check_definition = 'true';

-- Allow public access to read files from documents bucket (if not already exists)
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
  'allow-public-read',
  'documents', 
  'Allow public file access',
  'true',
  'true',
  'SELECT'
) ON CONFLICT (id) DO UPDATE SET
  definition = 'true',
  check_definition = 'true';
