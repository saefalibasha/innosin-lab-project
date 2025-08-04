-- Optional database fix to set proper is_series_parent values
-- Run this ONLY if you want to fix the root cause and have products properly marked as series parents

-- IMPORTANT: This is optional since our code fixes handle the issue with fallback queries

BEGIN;

-- First, let's analyze current state
SELECT 
  'BEFORE: Current State Analysis' as status,
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE is_active = true) as active_products,
  COUNT(*) FILTER (WHERE is_series_parent = true) as series_parent_products,
  COUNT(*) FILTER (WHERE is_active = true AND is_series_parent = true) as active_series_parents
FROM products;

-- Option 1: CONSERVATIVE APPROACH - Set one product per series as series parent
-- This maintains the original intended structure
UPDATE products 
SET is_series_parent = true,
    updated_at = now()
WHERE id IN (
  SELECT DISTINCT ON (product_series) id 
  FROM products 
  WHERE product_series IS NOT NULL 
    AND is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM products p2 
      WHERE p2.product_series = products.product_series 
      AND p2.is_series_parent = true
    )
  ORDER BY product_series, series_order ASC NULLS LAST, created_at ASC
);

-- Log the changes made
INSERT INTO product_activity_log (action, changed_by, new_data)
VALUES (
  'bulk_update_series_parents',
  'system_fix',
  jsonb_build_object(
    'description', 'Set is_series_parent=true for one product per series to enable catalog display',
    'timestamp', now(),
    'affected_products', (
      SELECT COUNT(*) FROM products WHERE is_series_parent = true
    )
  )
);

-- Verify the fix
SELECT 
  'AFTER: Post-Fix Analysis' as status,
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE is_active = true) as active_products,
  COUNT(*) FILTER (WHERE is_series_parent = true) as series_parent_products,
  COUNT(*) FILTER (WHERE is_active = true AND is_series_parent = true) as active_series_parents
FROM products;

-- Show which products are now series parents (for verification)
SELECT 
  'Series Parents Created:' as info,
  product_series,
  name,
  product_code,
  is_active,
  is_series_parent
FROM products 
WHERE is_series_parent = true 
ORDER BY product_series;

COMMIT;

-- Alternative Option 2 (commented out): SIMPLE APPROACH - Make all active products series parents
-- Uncomment if you want all active products to show up as series parents
/*
UPDATE products 
SET is_series_parent = true,
    updated_at = now()
WHERE is_active = true;
*/