-- Fix orientation values to be consistent
UPDATE products 
SET orientation = CASE 
  WHEN orientation IN ('LH', 'Left-Handed', 'left-handed') THEN 'LH'
  WHEN orientation IN ('RH', 'Right-Handed', 'right-handed') THEN 'RH' 
  WHEN orientation IN ('None', 'none', 'N/A', '') THEN 'None'
  ELSE orientation
END
WHERE orientation IS NOT NULL;

-- Fix null number_of_drawers based on product names/codes
UPDATE products 
SET number_of_drawers = CASE
  WHEN UPPER(name) LIKE '%DWR2%' OR UPPER(product_code) LIKE '%DWR2%' THEN 2
  WHEN UPPER(name) LIKE '%DWR3%' OR UPPER(product_code) LIKE '%DWR3%' THEN 3
  WHEN UPPER(name) LIKE '%DWR4%' OR UPPER(product_code) LIKE '%DWR4%' THEN 4
  WHEN UPPER(name) LIKE '%DWR6%' OR UPPER(product_code) LIKE '%DWR6%' THEN 6
  WHEN UPPER(name) LIKE '%DWR8%' OR UPPER(product_code) LIKE '%DWR8%' THEN 8
  WHEN category = 'Mobile Cabinets' AND door_type = 'Door' THEN 0
  ELSE number_of_drawers
END
WHERE number_of_drawers IS NULL;

-- Standardize dimension formats to use × separator
UPDATE products 
SET dimensions = REPLACE(dimensions, ' x ', '×')
WHERE dimensions LIKE '% x %';

UPDATE products 
SET dimensions = REPLACE(dimensions, 'x', '×') 
WHERE dimensions LIKE '%x%' AND dimensions NOT LIKE '%×%';