
-- Create the shop_look_content table for storing Shop The Look section content
CREATE TABLE IF NOT EXISTS public.shop_look_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Shop',
  title_highlight text NOT NULL DEFAULT 'The Look',
  description text NOT NULL DEFAULT 'Explore our featured laboratory setup.',
  background_image text NOT NULL DEFAULT '/placeholder.svg',
  background_alt text NOT NULL DEFAULT 'Modern Laboratory Setup',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shop_look_content ENABLE ROW LEVEL SECURITY;

-- RLS policies for shop_look_content
CREATE POLICY "shop_look_content_select_public"
ON public.shop_look_content
FOR SELECT
TO public
USING (true);

CREATE POLICY "shop_look_content_admin_all"
ON public.shop_look_content
FOR ALL
TO authenticated
USING (is_admin(get_current_user_email()))
WITH CHECK (is_admin(get_current_user_email()));

-- Fix shop_look_images id column type to be consistent
ALTER TABLE public.shop_look_images ALTER COLUMN id TYPE uuid USING gen_random_uuid();
ALTER TABLE public.shop_look_images ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Insert default content if none exists
INSERT INTO public.shop_look_content (title, title_highlight, description, background_image, background_alt, is_active)
VALUES ('Shop', 'The Look', 'Explore our featured laboratory setup.', '/placeholder.svg', 'Modern Laboratory Setup', true)
ON CONFLICT DO NOTHING;
