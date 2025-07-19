
-- Add company_tags field to products table
ALTER TABLE public.products 
ADD COLUMN company_tags TEXT[] DEFAULT '{}';

-- Add index for better performance on company_tags queries
CREATE INDEX idx_products_company_tags ON public.products USING GIN(company_tags);
