
-- Add missing variant combinations for Mobile Cabinet series
-- First, let's add the missing 750x500x650mm variants with different drawer counts

-- MC-PC-DWR2 (505065) - 2 Drawers, 750mm bench
INSERT INTO products (
  product_code, name, category, dimensions, description, full_description,
  thumbnail_path, model_path, additional_images, finish_type, orientation,
  door_type, variant_type, drawer_count, parent_series_id, is_series_parent,
  variant_order, is_active, product_series
) VALUES (
  'MC-PC-DWR2 (505065)', 
  'Mobile Cabinet Series for 750mm Bench (2 Drawers)',
  'Innosin Lab',
  '500×500×650 mm',
  'Mobile laboratory cabinet with 2 drawers designed for 750mm height benches.',
  'The MC-PC-DWR2 mobile cabinet offers organized drawer storage for laboratory environments. This configuration features 2 drawers optimized for small to medium laboratory equipment and supplies. Mobile design with heavy-duty casters allows flexible laboratory layouts.',
  '/products/innosin-mc-pc-dwr2-505065/MC-PC-DWR2 (505065).jpg',
  '/products/innosin-mc-pc-dwr2-505065/MC-PC-DWR2 (505065).glb',
  ARRAY['/products/innosin-mc-pc-dwr2-505065/MC-PC-DWR2 (505065).jpg'],
  'PC', 'None', NULL, 'standard', 2,
  '98535774-921b-4003-a048-f878da72d06c', false, 25, true, 'Mobile Cabinet'
);

-- MC-PC-DWR6 (505065) - 6 Drawers, 750mm bench
INSERT INTO products (
  product_code, name, category, dimensions, description, full_description,
  thumbnail_path, model_path, additional_images, finish_type, orientation,
  door_type, variant_type, drawer_count, parent_series_id, is_series_parent,
  variant_order, is_active, product_series
) VALUES (
  'MC-PC-DWR6 (505065)', 
  'Mobile Cabinet Series for 750mm Bench (6 Drawers)',
  'Innosin Lab',
  '500×500×650 mm',
  'Mobile laboratory cabinet with 6 drawers designed for 750mm height benches.',
  'The MC-PC-DWR6 mobile cabinet offers maximum organized storage with 6 drawer configuration for laboratory environments. This configuration features varied drawer sizes optimized for comprehensive laboratory equipment organization. Mobile design with heavy-duty casters allows flexible laboratory layouts.',
  '/products/innosin-mc-pc-dwr6-505065/MC-PC-DWR6 (505065).jpg',
  '/products/innosin-mc-pc-dwr6-505065/MC-PC-DWR6 (505065).glb',
  ARRAY['/products/innosin-mc-pc-dwr6-505065/MC-PC-DWR6 (505065).jpg'],
  'PC', 'None', NULL, 'standard', 6,
  '98535774-921b-4003-a048-f878da72d06c', false, 26, true, 'Mobile Cabinet'
);

-- Add missing orientation variants for 900x500x650mm dimension
-- MC-PC-LH (905065) - Left Hand, 900mm width, 750mm bench
INSERT INTO products (
  product_code, name, category, dimensions, description, full_description,
  thumbnail_path, model_path, additional_images, finish_type, orientation,
  door_type, variant_type, drawer_count, parent_series_id, is_series_parent,
  variant_order, is_active, product_series
) VALUES (
  'MC-PC-LH (905065)', 
  'Mobile Cabinet Series for 750mm Bench (Left Hand - Wide)',
  'Innosin Lab',
  '900×500×650 mm',
  'Mobile laboratory cabinet with left hand configuration designed for 750mm height benches - Wide format.',
  'The MC-PC-LH (905065) mobile cabinet offers specialized left-hand storage for laboratory environments requiring wider format. This configuration features storage compartments optimized for left-side placement with enhanced horizontal space. Mobile design with heavy-duty casters allows flexible laboratory layouts.',
  '/products/innosin-mc-pc-lh-905065/MC-PC-LH (905065).jpg',
  '/products/innosin-mc-pc-lh-905065/MC-PC-LH (905065).glb',
  ARRAY['/products/innosin-mc-pc-lh-905065/MC-PC-LH (905065).jpg'],
  'PC', 'LH', NULL, 'standard', 1,
  '98535774-921b-4003-a048-f878da72d06c', false, 27, true, 'Mobile Cabinet'
);

-- MC-PC-RH (905065) - Right Hand, 900mm width, 750mm bench
INSERT INTO products (
  product_code, name, category, dimensions, description, full_description,
  thumbnail_path, model_path, additional_images, finish_type, orientation,
  door_type, variant_type, drawer_count, parent_series_id, is_series_parent,
  variant_order, is_active, product_series
) VALUES (
  'MC-PC-RH (905065)', 
  'Mobile Cabinet Series for 750mm Bench (Right Hand - Wide)',
  'Innosin Lab',
  '900×500×650 mm',
  'Mobile laboratory cabinet with right hand configuration designed for 750mm height benches - Wide format.',
  'The MC-PC-RH (905065) mobile cabinet offers specialized right-hand storage for laboratory environments requiring wider format. This configuration features storage compartments optimized for right-side placement with enhanced horizontal space. Mobile design with heavy-duty casters allows flexible laboratory layouts.',
  '/products/innosin-mc-pc-rh-905065/MC-PC-RH (905065).jpg',
  '/products/innosin-mc-pc-rh-905065/MC-PC-RH (905065).glb',
  ARRAY['/products/innosin-mc-pc-rh-905065/MC-PC-RH (905065).jpg'],
  'PC', 'RH', NULL, 'standard', 1,
  '98535774-921b-4003-a048-f878da72d06c', false, 28, true, 'Mobile Cabinet'
);

-- Fix existing variants that have empty or inconsistent orientation values
UPDATE products 
SET orientation = 'None'
WHERE parent_series_id = '98535774-921b-4003-a048-f878da72d06c' 
AND (orientation IS NULL OR orientation = '' OR orientation = 'Standard')
AND product_code NOT LIKE '%LH%' 
AND product_code NOT LIKE '%RH%';

-- Ensure all drawer counts are properly set for combination variants
UPDATE products 
SET drawer_count = 1
WHERE parent_series_id = '98535774-921b-4003-a048-f878da72d06c' 
AND product_code LIKE '%MCC%'
AND drawer_count IS NULL;
