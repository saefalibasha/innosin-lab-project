
-- Add overview image to the Mobile Cabinet For 750mm Height Bench Series
UPDATE products 
SET series_overview_image_path = 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop'
WHERE product_series = 'Mobile Cabinet For 750mm Height Bench Series' 
AND is_series_parent = true;

-- Verify the update
SELECT id, name, product_series, series_overview_image_path 
FROM products 
WHERE product_series = 'Mobile Cabinet For 750mm Height Bench Series' 
AND is_series_parent = true;
