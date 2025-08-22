-- Update Safe Aire II Fume Hood mounting types to be properly capitalized
UPDATE products 
SET mounting_type = 'Floor-Mounted' 
WHERE mounting_type = 'floor-mounted' 
AND product_series LIKE '%Safe Aire II%';

UPDATE products 
SET mounting_type = 'Bench-Mounted' 
WHERE mounting_type = 'bench-mounted' 
AND product_series LIKE '%Safe Aire II%';

-- Update Broen-Lab Emergency Shower combinations to unified type
UPDATE products 
SET emergency_shower_type = 'Combination Shower' 
WHERE emergency_shower_type IN ('Combination', 'Combination Shower') 
AND product_series LIKE '%Broen-Lab Emergency Shower%';