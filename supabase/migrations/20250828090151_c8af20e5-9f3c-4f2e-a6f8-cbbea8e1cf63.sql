
-- Create shop_look_content table to store main content settings
CREATE TABLE public.shop_look_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT 'Shop The Look',
  title_highlight text NOT NULL DEFAULT 'Premium Laboratory Solutions',
  description text NOT NULL DEFAULT 'Discover our complete range of laboratory equipment and furniture designed for modern research facilities.',
  background_image text,
  background_alt text DEFAULT 'Modern laboratory setup with premium equipment',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for shop_look_content
ALTER TABLE public.shop_look_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage shop look content" 
  ON public.shop_look_content 
  FOR ALL 
  USING (is_admin(get_current_user_email()));

CREATE POLICY "Public can read active shop look content" 
  ON public.shop_look_content 
  FOR SELECT 
  USING (is_active = true);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_shop_look_content_updated_at
  BEFORE UPDATE ON public.shop_look_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content
INSERT INTO public.shop_look_content (title, title_highlight, description, background_image, background_alt)
VALUES (
  'Shop The Look',
  'Premium Laboratory Solutions',
  'Discover our complete range of laboratory equipment and furniture designed for modern research facilities. Click on the interactive points to explore each product in detail.',
  '/api/placeholder/1200/800',
  'Modern laboratory setup with premium equipment'
);
