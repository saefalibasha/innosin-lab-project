
-- Update the series_overview_image_path to use the uploaded series thumbnail for Mobile Cabinet series
UPDATE products 
SET series_overview_image_path = series_thumbnail_path,
    updated_at = now()
WHERE is_series_parent = true 
AND product_series LIKE '%Mobile Cabinet%'
AND series_thumbnail_path IS NOT NULL 
AND series_thumbnail_path != ''
AND series_thumbnail_path != series_overview_image_path;
