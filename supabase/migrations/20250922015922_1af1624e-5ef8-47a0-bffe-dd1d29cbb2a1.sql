-- Enable realtime for products table to support dashboard real-time updates
-- This allows the admin dashboard to receive real-time updates when products are modified

-- Enable replica identity for products to capture complete row data
ALTER TABLE public.products REPLICA IDENTITY FULL;

-- Add products table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;