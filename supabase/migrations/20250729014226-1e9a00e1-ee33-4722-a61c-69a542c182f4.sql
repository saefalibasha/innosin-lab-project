
-- Update TANGERINE series products to have "Oriental Giken" company tag
UPDATE products 
SET company_tags = ARRAY['Oriental Giken']
WHERE product_series ILIKE '%TANGERINE%' OR name ILIKE '%TANGERINE%';

-- Update NOCE series products to have "Oriental Giken" company tag  
UPDATE products 
SET company_tags = ARRAY['Oriental Giken']
WHERE product_series ILIKE '%NOCE%' OR name ILIKE '%NOCE%';
