
-- Add target_variant_count field to products table for planning
ALTER TABLE public.products 
ADD COLUMN target_variant_count INTEGER DEFAULT 0;

-- Add comments for clarity
COMMENT ON COLUMN public.products.target_variant_count IS 'Expected number of variants for this product series';

-- Update existing series parents to have reasonable default targets
UPDATE public.products 
SET target_variant_count = 
  CASE 
    WHEN product_series LIKE '%MC-PC%' THEN 8  -- Mobile cabinets typically have many variants
    WHEN product_series LIKE '%MCC-PC%' THEN 6 -- Mobile combination cabinets
    WHEN product_series LIKE '%TCG-PC%' THEN 2 -- Tall cabinets
    WHEN product_series LIKE '%WCG-PC%' THEN 2 -- Wall cabinets
    WHEN product_series LIKE '%OR-PC%' THEN 1  -- Open racks
    ELSE 4 -- Default for other series
  END
WHERE is_series_parent = true;
