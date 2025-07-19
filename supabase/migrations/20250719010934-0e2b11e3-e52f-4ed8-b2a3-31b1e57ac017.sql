
-- Update KS series products to standardize naming and specifications
-- First, update the existing KS products to use consistent product codes and dimensions

UPDATE products 
SET 
  product_code = 'KS700',
  product_series = 'Laboratory Bench Knee Space Series',
  dimensions = '700×550×880 mm',
  name = 'Laboratory Bench Knee Space KS700',
  editable_title = 'Laboratory Bench Knee Space KS700'
WHERE product_code IN ('KS-SS-700', 'KS700-PC', 'KS700-SS');

UPDATE products 
SET 
  product_code = 'KS750',
  product_series = 'Laboratory Bench Knee Space Series',
  dimensions = '750×550×880 mm',
  name = 'Laboratory Bench Knee Space KS750',
  editable_title = 'Laboratory Bench Knee Space KS750'
WHERE product_code IN ('KS-SS-750', 'KS750-PC', 'KS750-SS');

UPDATE products 
SET 
  product_code = 'KS800',
  product_series = 'Laboratory Bench Knee Space Series',
  dimensions = '800×550×880 mm',
  name = 'Laboratory Bench Knee Space KS800',
  editable_title = 'Laboratory Bench Knee Space KS800'
WHERE product_code IN ('KS-SS-800', 'KS800-PC', 'KS800-SS');

UPDATE products 
SET 
  product_code = 'KS850',
  product_series = 'Laboratory Bench Knee Space Series',
  dimensions = '850×550×880 mm',
  name = 'Laboratory Bench Knee Space KS850',
  editable_title = 'Laboratory Bench Knee Space KS850'
WHERE product_code IN ('KS-SS-850', 'KS850-PC', 'KS850-SS');

UPDATE products 
SET 
  product_code = 'KS900',
  product_series = 'Laboratory Bench Knee Space Series',
  dimensions = '900×550×880 mm',
  name = 'Laboratory Bench Knee Space KS900',
  editable_title = 'Laboratory Bench Knee Space KS900'
WHERE product_code IN ('KS-SS-900', 'KS900-PC', 'KS900-SS');

UPDATE products 
SET 
  product_code = 'KS1000',
  product_series = 'Laboratory Bench Knee Space Series',
  dimensions = '1000×550×880 mm',
  name = 'Laboratory Bench Knee Space KS1000',
  editable_title = 'Laboratory Bench Knee Space KS1000'
WHERE product_code IN ('KS-SS-1000', 'KS1000-PC', 'KS1000-SS');

UPDATE products 
SET 
  product_code = 'KS1200',
  product_series = 'Laboratory Bench Knee Space Series',
  dimensions = '1200×550×880 mm',
  name = 'Laboratory Bench Knee Space KS1200',
  editable_title = 'Laboratory Bench Knee Space KS1200'
WHERE product_code IN ('KS-SS-1200', 'KS1200-PC', 'KS1200-SS');

-- Insert any missing KS products (in case some sizes don't exist)
INSERT INTO products (product_code, name, category, product_series, dimensions, finish_type, orientation, editable_title, editable_description, is_active)
SELECT 'KS700', 'Laboratory Bench Knee Space KS700', 'Innosin Lab', 'Laboratory Bench Knee Space Series', '700×550×880 mm', 'PC', 'None', 'Laboratory Bench Knee Space KS700', 'Ergonomic knee space unit providing comfortable leg room for laboratory workstations - 700mm width', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'KS700');

INSERT INTO products (product_code, name, category, product_series, dimensions, finish_type, orientation, editable_title, editable_description, is_active)
SELECT 'KS750', 'Laboratory Bench Knee Space KS750', 'Innosin Lab', 'Laboratory Bench Knee Space Series', '750×550×880 mm', 'PC', 'None', 'Laboratory Bench Knee Space KS750', 'Ergonomic knee space unit providing comfortable leg room for laboratory workstations - 750mm width', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'KS750');

INSERT INTO products (product_code, name, category, product_series, dimensions, finish_type, orientation, editable_title, editable_description, is_active)
SELECT 'KS800', 'Laboratory Bench Knee Space KS800', 'Innosin Lab', 'Laboratory Bench Knee Space Series', '800×550×880 mm', 'PC', 'None', 'Laboratory Bench Knee Space KS800', 'Ergonomic knee space unit providing comfortable leg room for laboratory workstations - 800mm width', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'KS800');

INSERT INTO products (product_code, name, category, product_series, dimensions, finish_type, orientation, editable_title, editable_description, is_active)
SELECT 'KS850', 'Laboratory Bench Knee Space KS850', 'Innosin Lab', 'Laboratory Bench Knee Space Series', '850×550×880 mm', 'PC', 'None', 'Laboratory Bench Knee Space KS850', 'Ergonomic knee space unit providing comfortable leg room for laboratory workstations - 850mm width', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'KS850');

INSERT INTO products (product_code, name, category, product_series, dimensions, finish_type, orientation, editable_title, editable_description, is_active)
SELECT 'KS900', 'Laboratory Bench Knee Space KS900', 'Innosin Lab', 'Laboratory Bench Knee Space Series', '900×550×880 mm', 'PC', 'None', 'Laboratory Bench Knee Space KS900', 'Ergonomic knee space unit providing comfortable leg room for laboratory workstations - 900mm width', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'KS900');

INSERT INTO products (product_code, name, category, product_series, dimensions, finish_type, orientation, editable_title, editable_description, is_active)
SELECT 'KS1000', 'Laboratory Bench Knee Space KS1000', 'Innosin Lab', 'Laboratory Bench Knee Space Series', '1000×550×880 mm', 'PC', 'None', 'Laboratory Bench Knee Space KS1000', 'Ergonomic knee space unit providing comfortable leg room for laboratory workstations - 1000mm width', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'KS1000');

INSERT INTO products (product_code, name, category, product_series, dimensions, finish_type, orientation, editable_title, editable_description, is_active)
SELECT 'KS1200', 'Laboratory Bench Knee Space KS1200', 'Innosin Lab', 'Laboratory Bench Knee Space Series', '1200×550×880 mm', 'PC', 'None', 'Laboratory Bench Knee Space KS1200', 'Ergonomic knee space unit providing comfortable leg room for laboratory workstations - 1200mm width', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'KS1200');

-- Remove any duplicate entries that might exist
DELETE FROM products 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM products 
  WHERE product_code IN ('KS700', 'KS750', 'KS800', 'KS850', 'KS900', 'KS1000', 'KS1200')
  GROUP BY product_code
);
