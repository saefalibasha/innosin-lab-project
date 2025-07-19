
-- Fix training_sessions table to include progress and completed_at columns
ALTER TABLE training_sessions 
ADD COLUMN progress integer DEFAULT 0,
ADD COLUMN completed_at timestamp with time zone;

-- Create product_variants table
CREATE TABLE product_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  variant_name text NOT NULL,
  variant_code text NOT NULL,
  variant_type text DEFAULT 'standard',
  finish_type text,
  color text,
  size_dimensions text,
  additional_specs jsonb DEFAULT '{}',
  thumbnail_path text,
  model_path text,
  additional_images text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(product_id, variant_code)
);

-- Create product_series table for better series management
CREATE TABLE product_series (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  series_name text NOT NULL UNIQUE,
  series_code text NOT NULL UNIQUE,
  description text,
  brand text DEFAULT 'Innosin',
  category text,
  overview_image_path text,
  branding_assets text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies for product_variants
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage product variants" 
ON product_variants FOR ALL 
USING (is_admin(get_current_user_email()));

CREATE POLICY "Public can read active product variants" 
ON product_variants FOR SELECT 
USING (is_active = true);

-- Add RLS policies for product_series
ALTER TABLE product_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage product series" 
ON product_series FOR ALL 
USING (is_admin(get_current_user_email()));

CREATE POLICY "Public can read active product series" 
ON product_series FOR SELECT 
USING (is_active = true);

-- Add triggers for updated_at
CREATE TRIGGER update_product_variants_updated_at 
BEFORE UPDATE ON product_variants 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_series_updated_at 
BEFORE UPDATE ON product_series 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default series data
INSERT INTO product_series (series_name, series_code, description, category) VALUES
('Mobile Cabinet Series', 'MC', 'Mobile laboratory cabinets for flexible storage solutions', 'Mobile Cabinet'),
('Mobile Combination Cabinet Series', 'MCC', 'Mobile combination cabinets with mixed storage options', 'Mobile Cabinet'),
('Wall Cabinet Glass Series', 'WCG', 'Wall-mounted cabinets with glass doors', 'Storage'),
('Tall Cabinet Glass Series', 'TCG', 'Tall storage cabinets with glass doors', 'Storage'),
('Open Rack Series', 'OR', 'Open rack storage systems for laboratory environments', 'Storage');
