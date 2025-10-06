-- 1. Backfill NULL product IDs with proper UUIDs
UPDATE products 
SET id = gen_random_uuid() 
WHERE id IS NULL;

-- 2. Set default gen_random_uuid() for future inserts
ALTER TABLE products 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Relink orphan variants to their parent series by matching product_series name
UPDATE products AS variants
SET parent_series_id = (
  SELECT id 
  FROM products AS parents 
  WHERE parents.product_series = variants.product_series 
    AND parents.is_series_parent = true
  LIMIT 1
)
WHERE variants.is_series_parent = false 
  AND variants.parent_series_id IS NULL 
  AND variants.product_series IS NOT NULL;