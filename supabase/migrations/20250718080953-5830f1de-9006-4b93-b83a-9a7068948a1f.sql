
-- Create a products table to store editable product information
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_code text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Uncategorized',
  dimensions text,
  description text,
  full_description text,
  specifications jsonb DEFAULT '[]'::jsonb,
  keywords text[] DEFAULT '{}',
  thumbnail_path text,
  model_path text,
  additional_images text[] DEFAULT '{}',
  overview_image_path text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create RLS policies for the products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active products
CREATE POLICY "Public can read active products" 
  ON public.products 
  FOR SELECT 
  USING (is_active = true);

-- Allow admins to manage all products
CREATE POLICY "Admins can manage products" 
  ON public.products 
  FOR ALL 
  USING (is_admin((SELECT email FROM auth.users WHERE id = auth.uid())::text));

-- Create a bulk upload sessions table to track upload progress
CREATE TABLE public.bulk_upload_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  session_name text NOT NULL,
  total_files integer DEFAULT 0,
  processed_files integer DEFAULT 0,
  successful_uploads integer DEFAULT 0,
  failed_uploads integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_log jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on bulk upload sessions
ALTER TABLE public.bulk_upload_sessions ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own upload sessions
CREATE POLICY "Users can view their upload sessions" 
  ON public.bulk_upload_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id OR is_admin((SELECT email FROM auth.users WHERE id = auth.uid())::text));

-- Allow authenticated users to create upload sessions
CREATE POLICY "Authenticated users can create upload sessions" 
  ON public.bulk_upload_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own sessions
CREATE POLICY "Users can update their upload sessions" 
  ON public.bulk_upload_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id OR is_admin((SELECT email FROM auth.users WHERE id = auth.uid())::text));

-- Create trigger to update the updated_at column
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bulk_upload_sessions_updated_at
  BEFORE UPDATE ON public.bulk_upload_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_products_product_code ON public.products(product_code);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_bulk_upload_sessions_user_id ON public.bulk_upload_sessions(user_id);
CREATE INDEX idx_bulk_upload_sessions_status ON public.bulk_upload_sessions(status);
