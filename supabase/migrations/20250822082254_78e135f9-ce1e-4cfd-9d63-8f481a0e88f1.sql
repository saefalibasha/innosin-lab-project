-- Set replica identity for products table to enable updates
ALTER TABLE products REPLICA IDENTITY FULL;

-- Update mobile cabinet products to have proper drawer count values
-- Based on product names that contain drawer information

UPDATE products 
SET number_of_drawers = 2 
WHERE name LIKE '%DWR2%' OR name LIKE '%DRW2%' OR name LIKE '%DD-DWR2%'
AND number_of_drawers IS NULL;

UPDATE products 
SET number_of_drawers = 3 
WHERE (name LIKE '%DWR3%' OR name LIKE '%DRW3%') 
AND name NOT LIKE '%DRW3-1%' 
AND name NOT LIKE '%DRW3-2%'
AND number_of_drawers IS NULL;

UPDATE products 
SET number_of_drawers = 4 
WHERE name LIKE '%DWR4%' 
AND number_of_drawers IS NULL;

UPDATE products 
SET number_of_drawers = 6 
WHERE (name LIKE '%DWR6%' OR name LIKE '%DRW6%') 
AND name NOT LIKE '%DWR6-1%' 
AND name NOT LIKE '%DWR6-2%'
AND number_of_drawers IS NULL;

UPDATE products 
SET number_of_drawers = 8 
WHERE name LIKE '%DWR8%' 
AND number_of_drawers IS NULL;

-- For drawer variants like DRW3-1, DRW3-2, etc., set appropriate counts
UPDATE products 
SET number_of_drawers = 3 
WHERE (name LIKE '%DRW3-1%' OR name LIKE '%DRW3-2%')
AND number_of_drawers IS NULL;

UPDATE products 
SET number_of_drawers = 6 
WHERE (name LIKE '%DWR6-1%' OR name LIKE '%DWR6-2%')
AND number_of_drawers IS NULL;

-- Set default drawer count for mobile cabinets without specific drawer indicators
UPDATE products 
SET number_of_drawers = 0 
WHERE (category LIKE '%Mobile%' OR name LIKE '%MC-%' OR name LIKE '%MCC-%')
AND number_of_drawers IS NULL;