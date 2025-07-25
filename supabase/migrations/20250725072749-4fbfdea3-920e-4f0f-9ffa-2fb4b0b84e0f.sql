
-- First, let's see what the current constraint looks like
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'valid_product_series';

-- Drop the existing constraint if it exists
ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_product_series;

-- We'll remove this constraint entirely to allow dynamic product series creation
-- The application logic will handle validation instead
