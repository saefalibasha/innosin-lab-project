
-- Standardize KS Series products in the database
-- Step 1: Update all KS products to use "KS Series" as the product_series
UPDATE products 
SET product_series = 'KS Series'
WHERE product_code LIKE 'KS%' OR product_series LIKE '%Knee Space%';

-- Step 2: Standardize product codes and fix dimensions
UPDATE products 
SET 
  product_code = 'KS700',
  name = 'KS Series - 700mm',
  dimensions = '700×550×880 mm',
  editable_title = 'KS Series - 700mm',
  editable_description = 'Ergonomic knee space unit - 700mm width'
WHERE product_code LIKE 'KS700%' OR product_code LIKE 'KS-SS-700%';

UPDATE products 
SET 
  product_code = 'KS750',
  name = 'KS Series - 750mm',
  dimensions = '750×550×880 mm',
  editable_title = 'KS Series - 750mm',
  editable_description = 'Ergonomic knee space unit - 750mm width'
WHERE product_code LIKE 'KS750%' OR product_code LIKE 'KS-SS-750%';

UPDATE products 
SET 
  product_code = 'KS800',
  name = 'KS Series - 800mm',
  dimensions = '800×550×880 mm',
  editable_title = 'KS Series - 800mm',
  editable_description = 'Ergonomic knee space unit - 800mm width'
WHERE product_code LIKE 'KS800%' OR product_code LIKE 'KS-SS-800%';

UPDATE products 
SET 
  product_code = 'KS850',
  name = 'KS Series - 850mm',
  dimensions = '850×550×880 mm',
  editable_title = 'KS Series - 850mm',
  editable_description = 'Ergonomic knee space unit - 850mm width'
WHERE product_code LIKE 'KS850%' OR product_code LIKE 'KS-SS-850%';

UPDATE products 
SET 
  product_code = 'KS900',
  name = 'KS Series - 900mm',
  dimensions = '900×550×880 mm',
  editable_title = 'KS Series - 900mm',
  editable_description = 'Ergonomic knee space unit - 900mm width'
WHERE product_code LIKE 'KS900%' OR product_code LIKE 'KS-SS-900%';

UPDATE products 
SET 
  product_code = 'KS1000',
  name = 'KS Series - 1000mm',
  dimensions = '1000×550×880 mm',
  editable_title = 'KS Series - 1000mm',
  editable_description = 'Ergonomic knee space unit - 1000mm width'
WHERE product_code LIKE 'KS1000%' OR product_code LIKE 'KS-SS-1000%';

UPDATE products 
SET 
  product_code = 'KS1200',
  name = 'KS Series - 1200mm',
  dimensions = '1200×550×880 mm',
  editable_title = 'KS Series - 1200mm',
  editable_description = 'Ergonomic knee space unit - 1200mm width'
WHERE product_code LIKE 'KS1200%' OR product_code LIKE 'KS-SS-1200%';

-- Step 3: Remove duplicate entries, keeping only one per size
DELETE FROM products 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM products 
  WHERE product_code IN ('KS700', 'KS750', 'KS800', 'KS850', 'KS900', 'KS1000', 'KS1200')
  GROUP BY product_code
);

-- Step 4: Ensure all required KS sizes exist
INSERT INTO products (product_code, name, category, product_series, dimensions, finish_type, orientation, editable_title, editable_description, is_active)
SELECT 'KS700', 'KS Series - 700mm', 'Innosin Lab', 'KS Series', '700×550×880 mm', 'PC', 'None', 'KS Series - 700mm', 'Ergonomic knee space unit - 700mm width', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'KS700');

INSERT INTO products (product_code, name, category, product_series, dimensions, finish_type, orientation, editable_title, editable_description, is_active)
SELECT 'KS750', 'KS Series - 750mm', 'Innosin Lab', 'KS Series', '750×550×880 mm', 'PC', 'None', 'KS Series - 750mm', 'Ergonomic knee space unit - 750mm width', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'KS750');

INSERT INTO products (product_code, name, category, product_series, dimensions, finish_type, orientation, editable_title, editable_description, is_active)
SELECT 'KS800', 'KS Series - 800mm', 'Innosin Lab', 'KS Series', '800×550×880 mm', 'PC', 'None', 'KS Series - 800mm', 'Ergonomic knee space unit - 800mm width', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'KS800');

INSERT INTO products (product_code, name, category, product_series, dimensions, finish_type, orientation, editable_title, editable_description, is_active)
SELECT 'KS850', 'KS Series - 850mm', 'Innosin Lab', 'KS Series', '850×550×880 mm', 'PC', 'None', 'KS Series - 850mm', 'Ergonomic knee space unit - 850mm width', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'KS850');

INSERT INTO products (product_code, name, category, product_series, dimensions, finish_type, orientation, editable_title, editable_description, is_active)
SELECT 'KS900', 'KS Series - 900mm', 'Innosin Lab', 'KS Series', '900×550×880 mm', 'PC', 'None', 'KS Series - 900mm', 'Ergonomic knee space unit - 900mm width', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'KS900');

INSERT INTO products (product_code, name, category, product_series, dimensions, finish_type, orientation, editable_title, editable_description, is_active)
SELECT 'KS1000', 'KS Series - 1000mm', 'Innosin Lab', 'KS Series', '1000×550×880 mm', 'PC', 'None', 'KS Series - 1000mm', 'Ergonomic knee space unit - 1000mm width', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'KS1000');

INSERT INTO products (product_code, name, category, product_series, dimensions, finish_type, orientation, editable_title, editable_description, is_active)
SELECT 'KS1200', 'KS Series - 1200mm', 'Innosin Lab', 'KS Series', '1200×550×880 mm', 'PC', 'None', 'KS Series - 1200mm', 'Ergonomic knee space unit - 1200mm width', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'KS1200');
