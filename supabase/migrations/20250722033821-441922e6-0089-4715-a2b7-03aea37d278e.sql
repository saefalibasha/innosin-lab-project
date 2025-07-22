
-- Update the 750mm Mobile Cabinet series to use the uploaded series thumbnail as the series_overview_image_path
UPDATE products 
SET series_overview_image_path = 'https://wfdbqfbodppniqzoxnyf.supabase.co/storage/v1/object/public/documents/series-thumbnails/1737528278623.jpg'
WHERE product_series = 'Mobile Cabinet For 750mm Height Bench Series' 
AND is_series_parent = true;

-- Update the 900mm Mobile Cabinet series to use the same uploaded image for consistency
UPDATE products 
SET series_overview_image_path = 'https://wfdbqfbodppniqzoxnyf.supabase.co/storage/v1/object/public/documents/series-thumbnails/1737528278623.jpg',
    series_thumbnail_path = 'https://wfdbqfbodppniqzoxnyf.supabase.co/storage/v1/object/public/documents/series-thumbnails/1737528278623.jpg'
WHERE product_series = 'Mobile Cabinet For 900mm Height Bench Series' 
AND is_series_parent = true;
