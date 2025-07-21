
-- First, let's see what series currently exist and clean them up
-- Delete any series that don't match the 9 approved series names
DELETE FROM products 
WHERE is_series_parent = true 
AND product_series NOT IN (
  'KNEE SPACE',
  'MOBILE CABINET FOR 750mm H BENCH',
  'MOBILE CABINET FOR 900mm H BENCH',
  'MODULAR CABINET',
  'OPEN RACK',
  'SINK CABINET',
  'TALL CABINET GLASS DOOR',
  'TALL CABINET SOLID DOOR',
  'WALL CABINET'
);

-- Update any existing incorrect series names to match the approved ones
UPDATE products 
SET product_series = 'KNEE SPACE'
WHERE product_series = 'Laboratory Bench Knee Space Series';

UPDATE products 
SET product_series = 'WALL CABINET'
WHERE product_series IN ('Wall Cabinet Glass', 'Wall Cabinet Solid');

-- Clean up any orphaned variants that reference non-existent series
DELETE FROM products 
WHERE is_series_parent = false 
AND parent_series_id NOT IN (
  SELECT id FROM products WHERE is_series_parent = true
);

-- Ensure all products use only the approved series names
UPDATE products 
SET product_series = CASE 
  WHEN product_series ILIKE '%knee%space%' THEN 'KNEE SPACE'
  WHEN product_series ILIKE '%mobile%cabinet%750%' THEN 'MOBILE CABINET FOR 750mm H BENCH'
  WHEN product_series ILIKE '%mobile%cabinet%900%' THEN 'MOBILE CABINET FOR 900mm H BENCH'
  WHEN product_series ILIKE '%modular%cabinet%' THEN 'MODULAR CABINET'
  WHEN product_series ILIKE '%open%rack%' THEN 'OPEN RACK'
  WHEN product_series ILIKE '%sink%cabinet%' THEN 'SINK CABINET'
  WHEN product_series ILIKE '%tall%cabinet%glass%' THEN 'TALL CABINET GLASS DOOR'
  WHEN product_series ILIKE '%tall%cabinet%solid%' THEN 'TALL CABINET SOLID DOOR'
  WHEN product_series ILIKE '%wall%cabinet%' THEN 'WALL CABINET'
  ELSE product_series
END
WHERE product_series NOT IN (
  'KNEE SPACE',
  'MOBILE CABINET FOR 750mm H BENCH',
  'MOBILE CABINET FOR 900mm H BENCH',
  'MODULAR CABINET',
  'OPEN RACK',
  'SINK CABINET',
  'TALL CABINET GLASS DOOR',
  'TALL CABINET SOLID DOOR',
  'WALL CABINET'
);

-- Create the 9 approved series if they don't exist
INSERT INTO products (
  name, 
  product_code, 
  product_series, 
  category, 
  description, 
  series_slug, 
  is_series_parent, 
  is_active
) 
SELECT 
  series_name,
  REPLACE(UPPER(series_name), ' ', '-') || '-SERIES',
  series_name,
  'Innosin Lab',
  'Standard ' || series_name || ' series for laboratory environments',
  LOWER(REPLACE(series_name, ' ', '-')),
  true,
  true
FROM (
  VALUES 
    ('KNEE SPACE'),
    ('MOBILE CABINET FOR 750mm H BENCH'),
    ('MOBILE CABINET FOR 900mm H BENCH'),
    ('MODULAR CABINET'),
    ('OPEN RACK'),
    ('SINK CABINET'),
    ('TALL CABINET GLASS DOOR'),
    ('TALL CABINET SOLID DOOR'),
    ('WALL CABINET')
) AS series_data(series_name)
WHERE series_name NOT IN (
  SELECT product_series FROM products WHERE is_series_parent = true
);

-- Add a constraint to prevent unauthorized series creation
ALTER TABLE products ADD CONSTRAINT valid_product_series 
CHECK (
  product_series IN (
    'KNEE SPACE',
    'MOBILE CABINET FOR 750mm H BENCH',
    'MOBILE CABINET FOR 900mm H BENCH',
    'MODULAR CABINET',
    'OPEN RACK',
    'SINK CABINET',
    'TALL CABINET GLASS DOOR',
    'TALL CABINET SOLID DOOR',
    'WALL CABINET'
  )
);
