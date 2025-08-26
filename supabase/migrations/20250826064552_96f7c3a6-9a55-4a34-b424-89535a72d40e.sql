
-- Create the shop_look_images table that's missing from the database
CREATE TABLE IF NOT EXISTS public.shop_look_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  filename text,
  alt text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);

-- Enable RLS
ALTER TABLE public.shop_look_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for shop_look_images
CREATE POLICY "shop_look_images_select_public"
ON public.shop_look_images
FOR SELECT
TO public
USING (true);

CREATE POLICY "shop_look_images_insert_auth"
ON public.shop_look_images
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "shop_look_images_update_owner"
ON public.shop_look_images
FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR is_admin(get_current_user_email()))
WITH CHECK (created_by = auth.uid() OR is_admin(get_current_user_email()));

CREATE POLICY "shop_look_images_delete_owner"
ON public.shop_look_images
FOR DELETE
TO authenticated
USING (created_by = auth.uid() OR is_admin(get_current_user_email()));

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('shop-look-images', 'shop-look-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the bucket
CREATE POLICY IF NOT EXISTS "public_read_shop_look_images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'shop-look-images');

CREATE POLICY IF NOT EXISTS "authenticated_upload_shop_look_images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'shop-look-images');

CREATE POLICY IF NOT EXISTS "authenticated_update_shop_look_images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'shop-look-images');

CREATE POLICY IF NOT EXISTS "authenticated_delete_shop_look_images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'shop-look-images');
