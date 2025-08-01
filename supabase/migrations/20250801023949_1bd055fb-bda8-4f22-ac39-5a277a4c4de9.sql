
-- Check what product series names exist in the database
SELECT DISTINCT product_series, COUNT(*) as product_count 
FROM products 
WHERE is_active = true 
GROUP BY product_series 
ORDER BY product_series;

-- Check specific products for Emergency Shower series
SELECT id, name, product_series, category, emergency_shower_type, mounting_type, dimensions, finish_type
FROM products 
WHERE is_active = true 
AND (product_series ILIKE '%emergency%' OR name ILIKE '%emergency%' OR category ILIKE '%emergency%')
ORDER BY name;

-- Check specific products for UNIFLEX series
SELECT id, name, product_series, category, mixing_type, handle_type, dimensions, finish_type
FROM products 
WHERE is_active = true 
AND (product_series ILIKE '%uniflex%' OR name ILIKE '%uniflex%' OR category ILIKE '%uniflex%')
ORDER BY name;

-- Check specific products for Safe Aire series
SELECT id, name, product_series, category, mounting_type, dimensions, finish_type
FROM products 
WHERE is_active = true 
AND (product_series ILIKE '%safe aire%' OR name ILIKE '%safe aire%' OR category ILIKE '%safe aire%')
ORDER BY name;

-- Check the specific product the user is viewing
SELECT id, name, product_series, category, emergency_shower_type, mounting_type, mixing_type, handle_type, dimensions, finish_type, cabinet_class
FROM products 
WHERE id = '45d4f541-9cf1-483f-abe4-aa94a325a49f';
