-- Create storage bucket for shop the look images
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-look-images', 'shop-look-images', true);

-- Create RLS policies for shop look images bucket
CREATE POLICY "Admins can upload shop look images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'shop-look-images' AND (
  EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
    AND is_active = true
  )
));

CREATE POLICY "Admins can update shop look images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'shop-look-images' AND (
  EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
    AND is_active = true
  )
));

CREATE POLICY "Admins can delete shop look images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'shop-look-images' AND (
  EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
    AND is_active = true
  )
));

CREATE POLICY "Public can view shop look images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'shop-look-images');