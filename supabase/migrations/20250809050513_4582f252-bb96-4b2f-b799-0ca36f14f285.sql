
-- Add RLS policies to allow reading products data
-- Since this appears to be product catalog data that should be publicly accessible

-- Allow public read access to products (for catalog viewing)
CREATE POLICY "Allow public read access to products" 
ON public.products 
FOR SELECT 
USING (true);

-- Allow admin write access to products
CREATE POLICY "Allow admin write access to products" 
ON public.products 
FOR ALL 
USING (is_admin(get_current_user_email()));
