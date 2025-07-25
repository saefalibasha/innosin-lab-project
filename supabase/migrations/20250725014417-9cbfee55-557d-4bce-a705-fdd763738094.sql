
-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'INNOSIN Team',
  publish_date TIMESTAMP WITH TIME ZONE,
  read_time INTEGER DEFAULT 5,
  category TEXT DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  featured_image TEXT,
  featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog_images table for media management
CREATE TABLE public.blog_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

-- Enable RLS on blog tables
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for blog_posts
CREATE POLICY "Public can read published blog posts" 
  ON public.blog_posts 
  FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Admins can manage blog posts" 
  ON public.blog_posts 
  FOR ALL 
  USING (is_admin(get_current_user_email()));

-- RLS policies for blog_images
CREATE POLICY "Public can read blog images" 
  ON public.blog_images 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage blog images" 
  ON public.blog_images 
  FOR ALL 
  USING (is_admin(get_current_user_email()));

-- RLS policies for blog images storage
CREATE POLICY "Public can view blog images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can manage blog images in storage" 
  ON storage.objects 
  FOR ALL 
  USING (bucket_id = 'blog-images' AND is_admin(get_current_user_email()));

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_blog_posts_updated_at 
  BEFORE UPDATE ON public.blog_posts 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
