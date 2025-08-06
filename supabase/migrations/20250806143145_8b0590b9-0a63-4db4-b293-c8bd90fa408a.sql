
-- Add missing fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS drawer_count INTEGER,
ADD COLUMN IF NOT EXISTS cabinet_class TEXT,
ADD COLUMN IF NOT EXISTS editable_title TEXT,
ADD COLUMN IF NOT EXISTS editable_description TEXT;

-- Update existing records to have default values
UPDATE public.products 
SET 
  drawer_count = 0 WHERE drawer_count IS NULL,
  cabinet_class = 'standard' WHERE cabinet_class IS NULL,
  editable_title = name WHERE editable_title IS NULL,
  editable_description = description WHERE editable_description IS NULL;
