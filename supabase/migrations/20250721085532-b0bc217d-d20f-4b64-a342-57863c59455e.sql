
-- Fix the overview image for the Mobile Cabinet series
UPDATE products 
SET series_overview_image_path = 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop'
WHERE id = '98535774-921b-4003-a048-f878da72d06c';

-- Update variants with missing drawer counts based on their product codes
UPDATE products 
SET drawer_count = 3
WHERE parent_series_id = '98535774-921b-4003-a048-f878da72d06c' 
AND product_code LIKE '%DWR3%' 
AND drawer_count IS NULL;

UPDATE products 
SET drawer_count = 4
WHERE parent_series_id = '98535774-921b-4003-a048-f878da72d06c' 
AND product_code LIKE '%DWR4%' 
AND drawer_count IS NULL;

UPDATE products 
SET drawer_count = 6
WHERE parent_series_id = '98535774-921b-4003-a048-f878da72d06c' 
AND product_code LIKE '%DWR6%' 
AND drawer_count IS NULL;

UPDATE products 
SET drawer_count = 8
WHERE parent_series_id = '98535774-921b-4003-a048-f878da72d06c' 
AND product_code LIKE '%DWR8%' 
AND drawer_count IS NULL;

UPDATE products 
SET drawer_count = 2
WHERE parent_series_id = '98535774-921b-4003-a048-f878da72d06c' 
AND product_code LIKE '%DWR2%' 
AND drawer_count IS NULL;

-- Normalize orientation values
UPDATE products 
SET orientation = 'LH'
WHERE parent_series_id = '98535774-921b-4003-a048-f878da72d06c' 
AND (orientation = 'Left-Handed' OR orientation LIKE '%Left%');

UPDATE products 
SET orientation = 'RH'
WHERE parent_series_id = '98535774-921b-4003-a048-f878da72d06c' 
AND (orientation = 'Right-Handed' OR orientation LIKE '%Right%');

-- Set default drawer count of 1 for variants without drawers mentioned
UPDATE products 
SET drawer_count = 1
WHERE parent_series_id = '98535774-921b-4003-a048-f878da72d06c' 
AND drawer_count IS NULL 
AND product_code NOT LIKE '%DWR%';
