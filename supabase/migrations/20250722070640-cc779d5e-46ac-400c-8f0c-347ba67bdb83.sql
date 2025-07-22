
-- Delete the Tall Cabinet Glass Door Series and all associated products
-- First, delete any child variants that reference the series parent
DELETE FROM products 
WHERE parent_series_id IN (
  SELECT id FROM products 
  WHERE product_series = 'Tall Cabinet Glass Door Series' 
  AND is_series_parent = true
);

-- Then delete the series parent itself
DELETE FROM products 
WHERE product_series = 'Tall Cabinet Glass Door Series' 
AND is_series_parent = true;

-- Also delete any standalone products in this series (not part of parent-child structure)
DELETE FROM products 
WHERE product_series = 'Tall Cabinet Glass Door Series' 
AND is_series_parent = false 
AND parent_series_id IS NULL;

-- Log the deletion activity
INSERT INTO product_activity_log (action, changed_by, old_data)
VALUES (
  'series_deleted',
  'admin',
  jsonb_build_object(
    'series_name', 'Tall Cabinet Glass Door Series',
    'deleted_at', now()
  )
);
