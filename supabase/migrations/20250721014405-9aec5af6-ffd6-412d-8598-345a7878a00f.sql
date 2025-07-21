
-- Add series metadata and enhance product relationships
ALTER TABLE products ADD COLUMN IF NOT EXISTS series_slug text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS series_order integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS parent_series_id uuid REFERENCES products(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_series_parent boolean DEFAULT false;

-- Add series-level asset management
ALTER TABLE products ADD COLUMN IF NOT EXISTS series_thumbnail_path text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS series_overview_image_path text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS series_model_path text;

-- Add variant-specific metadata
ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_type text DEFAULT 'standard';
ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_order integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS inherits_series_assets boolean DEFAULT true;

-- Add activity logging table
CREATE TABLE IF NOT EXISTS product_activity_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES products(id),
    action text NOT NULL,
    changed_by text,
    old_data jsonb,
    new_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Add asset upload tracking
CREATE TABLE IF NOT EXISTS asset_uploads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES products(id),
    file_path text NOT NULL,
    file_type text NOT NULL,
    file_size integer,
    uploaded_by text,
    upload_status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE product_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_uploads ENABLE ROW LEVEL SECURITY;

-- Add policies for new tables
CREATE POLICY "Admins can manage product activity log" ON product_activity_log FOR ALL USING (is_admin(get_current_user_email()));
CREATE POLICY "Admins can manage asset uploads" ON asset_uploads FOR ALL USING (is_admin(get_current_user_email()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_series_slug ON products(series_slug);
CREATE INDEX IF NOT EXISTS idx_products_parent_series ON products(parent_series_id);
CREATE INDEX IF NOT EXISTS idx_products_series_parent ON products(is_series_parent);
CREATE INDEX IF NOT EXISTS idx_product_activity_log_product_id ON product_activity_log(product_id);
CREATE INDEX IF NOT EXISTS idx_asset_uploads_product_id ON asset_uploads(product_id);

-- Update existing products to have proper series structure
UPDATE products 
SET is_series_parent = true, 
    series_slug = LOWER(REPLACE(REPLACE(product_series, ' ', '-'), '&', 'and'))
WHERE product_series IS NOT NULL 
AND product_series != '' 
AND is_series_parent IS NOT TRUE;

-- Create series parents where they don't exist
INSERT INTO products (
    name, 
    product_code, 
    category, 
    product_series, 
    is_series_parent, 
    series_slug,
    description,
    full_description,
    is_active
)
SELECT DISTINCT
    product_series || ' Series' as name,
    UPPER(REPLACE(REPLACE(product_series, ' ', '_'), '&', 'AND')) as product_code,
    category,
    product_series,
    true as is_series_parent,
    LOWER(REPLACE(REPLACE(product_series, ' ', '-'), '&', 'and')) as series_slug,
    'Product series for ' || product_series as description,
    'Complete product series offering various configurations and options for ' || product_series as full_description,
    true as is_active
FROM products 
WHERE product_series IS NOT NULL 
AND product_series != ''
AND NOT EXISTS (
    SELECT 1 FROM products p2 
    WHERE p2.product_series = products.product_series 
    AND p2.is_series_parent = true
);

-- Link existing products to their series parents
UPDATE products 
SET parent_series_id = (
    SELECT id FROM products p2 
    WHERE p2.product_series = products.product_series 
    AND p2.is_series_parent = true
    LIMIT 1
)
WHERE product_series IS NOT NULL 
AND product_series != ''
AND is_series_parent IS NOT TRUE
AND parent_series_id IS NULL;
