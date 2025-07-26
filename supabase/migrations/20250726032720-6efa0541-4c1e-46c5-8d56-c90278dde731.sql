
-- Add new variant fields to products table for specific product types
ALTER TABLE products 
ADD COLUMN mounting_type TEXT,
ADD COLUMN mixing_type TEXT,
ADD COLUMN handle_type TEXT;

-- Update existing Safe Aire II products with mounting type information
UPDATE products 
SET mounting_type = CASE 
  WHEN name ILIKE '%bench%' OR dimensions ILIKE '%bench%' THEN 'bench-mounted'
  WHEN name ILIKE '%floor%' OR dimensions ILIKE '%floor%' THEN 'floor-mounted'
  ELSE 'bench-mounted'
END
WHERE product_series ILIKE '%Safe Aire%' OR name ILIKE '%Safe Aire%';

-- Update existing UNIFLEX products with mixing and handle type information
UPDATE products 
SET mixing_type = CASE 
  WHEN name ILIKE '%mix%' AND name NOT ILIKE '%non%' THEN 'mix'
  ELSE 'non-mix'
END,
handle_type = CASE 
  WHEN name ILIKE '%wrist%' OR name ILIKE '%lever%' THEN 'wrist-action'
  ELSE 'polypropylene'
END
WHERE product_series ILIKE '%UNIFLEX%' OR name ILIKE '%UNIFLEX%';

-- Ensure company_tags are properly populated for the specified series
UPDATE products 
SET company_tags = ARRAY['Hamilton Laboratory Solutions']
WHERE (product_series ILIKE '%Safe Aire%' OR name ILIKE '%Safe Aire%') 
AND (company_tags IS NULL OR array_length(company_tags, 1) IS NULL);

UPDATE products 
SET company_tags = ARRAY['Oriental Giken Inc.']
WHERE (product_series ILIKE '%TANGERINE%' OR product_series ILIKE '%NOCE%' 
       OR name ILIKE '%TANGERINE%' OR name ILIKE '%NOCE%') 
AND (company_tags IS NULL OR array_length(company_tags, 1) IS NULL);

UPDATE products 
SET company_tags = ARRAY['Broen-Lab']
WHERE (product_series ILIKE '%UNIFLEX%' OR name ILIKE '%UNIFLEX%') 
AND (company_tags IS NULL OR array_length(company_tags, 1) IS NULL);
