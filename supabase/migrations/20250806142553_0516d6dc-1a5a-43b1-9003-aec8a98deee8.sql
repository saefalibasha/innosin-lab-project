
-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products (since this appears to be a catalog)
CREATE POLICY "Anyone can view active products" 
  ON public.products 
  FOR SELECT 
  USING (is_active = true OR is_active IS NULL);

-- Allow admins to manage all products
CREATE POLICY "Admins can manage products" 
  ON public.products 
  FOR ALL 
  USING (is_admin(get_current_user_email()));

-- Set up realtime for products table
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
