
-- Update Safe Aire II products to have "Hamilton Laboratory Solutions" company tag
UPDATE products 
SET company_tags = ARRAY['Hamilton Laboratory Solutions']
WHERE product_series ILIKE '%Safe Aire II%' OR name ILIKE '%Safe Aire II%';

-- Update Emergency Shower products to have "Broen-Lab" company tag  
UPDATE products 
SET company_tags = ARRAY['Broen-Lab']
WHERE product_series ILIKE '%Emergency Shower%' OR name ILIKE '%Emergency Shower%';

-- Update UNIFLEX products to have "Broen-Lab" company tag
UPDATE products 
SET company_tags = ARRAY['Broen-Lab']
WHERE product_series ILIKE '%UNIFLEX%' OR name ILIKE '%UNIFLEX%';
