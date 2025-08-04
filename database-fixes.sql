-- Database Fix Script for Product Display Issues
-- This script addresses the core issues preventing products from appearing in the admin dashboard and catalog

-- 1. Update all products to be active by default
UPDATE public.products 
SET is_active = true 
WHERE is_active IS NULL OR is_active = false;

-- 2. Set up series parent relationships for Innosin Lab products
-- First, create series parent records for each unique product_series
INSERT INTO public.products (
    product_code, 
    name, 
    category, 
    product_series, 
    is_series_parent, 
    is_active,
    description,
    full_description,
    finish_type,
    series_order,
    series_slug
)
SELECT DISTINCT
    CONCAT(UPPER(LEFT(REPLACE(product_series, ' ', ''), 2)), '-SERIES') as product_code,
    CONCAT(product_series, ' Series') as name,
    category,
    product_series,
    true as is_series_parent,
    true as is_active,
    CONCAT('Complete ', product_series, ' product series for laboratory applications') as description,
    CONCAT('The ', product_series, ' series offers a comprehensive range of laboratory furniture and equipment designed for modern research facilities. Each product in this series maintains consistent quality standards and design principles while offering various configurations to meet specific laboratory requirements.') as full_description,
    'PC' as finish_type,
    ROW_NUMBER() OVER (ORDER BY product_series) as series_order,
    LOWER(REPLACE(REPLACE(product_series, ' ', '-'), '--', '-')) as series_slug
FROM public.products 
WHERE product_series IS NOT NULL 
    AND product_series != ''
    AND NOT EXISTS (
        SELECT 1 FROM public.products p2 
        WHERE p2.product_series = products.product_series 
        AND p2.is_series_parent = true
    )
ON CONFLICT (product_code) DO NOTHING;

-- 3. Update existing products to be variants of their series parents
UPDATE public.products 
SET 
    parent_series_id = (
        SELECT id FROM public.products p2 
        WHERE p2.product_series = products.product_series 
        AND p2.is_series_parent = true 
        LIMIT 1
    ),
    is_series_parent = false,
    variant_order = ROW_NUMBER() OVER (
        PARTITION BY product_series 
        ORDER BY dimensions, product_code
    )
WHERE product_series IS NOT NULL 
    AND product_series != ''
    AND (is_series_parent IS NULL OR is_series_parent = false);

-- 4. Add missing asset paths (placeholder paths - replace with actual asset URLs)
-- Update series parents with series-level assets
UPDATE public.products 
SET 
    series_thumbnail_path = CONCAT('/assets/series/', series_slug, '/thumbnail.jpg'),
    series_overview_image_path = CONCAT('/assets/series/', series_slug, '/overview.jpg'),
    series_model_path = CONCAT('/assets/series/', series_slug, '/model.glb'),
    overview_image_path = CONCAT('/assets/series/', series_slug, '/overview.jpg')
WHERE is_series_parent = true 
    AND series_slug IS NOT NULL
    AND (series_thumbnail_path IS NULL OR series_thumbnail_path = '');

-- Update variants with individual asset paths
UPDATE public.products 
SET 
    thumbnail_path = CONCAT('/assets/products/', product_code, '/thumbnail.jpg'),
    model_path = CONCAT('/assets/products/', product_code, '/model.glb')
WHERE is_series_parent = false 
    AND product_code IS NOT NULL
    AND (thumbnail_path IS NULL OR thumbnail_path = '');

-- 5. Update specifications to be properly formatted JSON arrays
UPDATE public.products 
SET specifications = CASE 
    WHEN specifications IS NULL THEN '["Chemical Resistant", "Durable Construction", "Laboratory Grade"]'::jsonb
    WHEN jsonb_typeof(specifications) != 'array' THEN '["Chemical Resistant", "Durable Construction", "Laboratory Grade"]'::jsonb
    ELSE specifications
END
WHERE specifications IS NULL OR jsonb_typeof(specifications) != 'array';

-- 6. Add keywords for better searchability
UPDATE public.products 
SET keywords = CASE 
    WHEN product_series LIKE '%Knee Space%' THEN '["laboratory", "bench", "knee space", "modular", "workspace"]'::jsonb
    WHEN product_series LIKE '%Mobile Cabinet%' THEN '["mobile", "cabinet", "storage", "wheels", "portable"]'::jsonb
    WHEN product_series LIKE '%Modular Cabinet%' THEN '["modular", "cabinet", "storage", "customizable", "flexible"]'::jsonb
    WHEN product_series LIKE '%Open Rack%' THEN '["open", "rack", "storage", "accessible", "shelving"]'::jsonb
    WHEN product_series LIKE '%Wall Cabinet%' THEN '["wall", "cabinet", "mounted", "space saving", "overhead"]'::jsonb
    WHEN product_series LIKE '%Tall Cabinet%' THEN '["tall", "cabinet", "vertical", "storage", "high capacity"]'::jsonb
    WHEN product_series LIKE '%Sink Cabinet%' THEN '["sink", "cabinet", "plumbing", "wet lab", "utility"]'::jsonb
    ELSE '["laboratory", "furniture", "equipment", "research", "scientific"]'::jsonb
END
WHERE keywords IS NULL;

-- 7. Set up proper variant types based on product characteristics
UPDATE public.products 
SET variant_type = CASE 
    WHEN orientation IN ('LH', 'RH') THEN 'orientation'
    WHEN finish_type = 'SS' THEN 'material'
    WHEN drawer_count > 0 THEN 'storage'
    WHEN door_type IS NOT NULL THEN 'access'
    ELSE 'standard'
END
WHERE variant_type IS NULL;

-- 8. Add company tags for proper categorization
UPDATE public.products 
SET company_tags = '["Innosin Lab", "Laboratory Furniture", "Research Equipment"]'::jsonb
WHERE company_tags IS NULL;

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_active_series_parent ON public.products(is_active, is_series_parent);
CREATE INDEX IF NOT EXISTS idx_products_parent_series_id ON public.products(parent_series_id);
CREATE INDEX IF NOT EXISTS idx_products_series_slug ON public.products(series_slug);
CREATE INDEX IF NOT EXISTS idx_products_variant_order ON public.products(variant_order);

-- 10. Update statistics and final counts
-- This query shows the results after the fix
SELECT 
    'Database Fix Results' as status,
    (SELECT COUNT(*) FROM public.products WHERE is_active = true) as total_active_products,
    (SELECT COUNT(*) FROM public.products WHERE is_series_parent = true) as series_parents,
    (SELECT COUNT(*) FROM public.products WHERE parent_series_id IS NOT NULL) as variants,
    (SELECT COUNT(DISTINCT product_series) FROM public.products WHERE product_series IS NOT NULL) as unique_series;

-- Verification queries to confirm the fix worked
SELECT 
    product_series,
    COUNT(*) as total_products,
    COUNT(CASE WHEN is_series_parent = true THEN 1 END) as series_parents,
    COUNT(CASE WHEN parent_series_id IS NOT NULL THEN 1 END) as variants,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_products
FROM public.products 
WHERE product_series IS NOT NULL
GROUP BY product_series
ORDER BY product_series;