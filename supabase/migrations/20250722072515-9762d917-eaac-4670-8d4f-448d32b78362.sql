
-- Create database function to sync series name changes across all related records
CREATE OR REPLACE FUNCTION sync_series_name_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- If the name field changed, update product_series to match
  IF OLD.name IS DISTINCT FROM NEW.name AND NEW.is_series_parent = true THEN
    -- Update the series parent's product_series field
    NEW.product_series = NEW.name;
    
    -- Update all child variants to use the new series name
    UPDATE products 
    SET product_series = NEW.name,
        updated_at = now()
    WHERE parent_series_id = NEW.id;
    
    -- Log the series rename activity
    INSERT INTO product_activity_log (action, changed_by, old_data, new_data)
    VALUES (
      'series_renamed',
      'admin',
      jsonb_build_object('old_name', OLD.name, 'old_product_series', OLD.product_series),
      jsonb_build_object('new_name', NEW.name, 'new_product_series', NEW.name)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically sync series name changes
DROP TRIGGER IF EXISTS sync_series_names ON products;
CREATE TRIGGER sync_series_names
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION sync_series_name_changes();

-- Create function to ensure data consistency
CREATE OR REPLACE FUNCTION ensure_series_consistency()
RETURNS void AS $$
BEGIN
  -- Update any series parents where name and product_series don't match
  UPDATE products 
  SET product_series = name,
      updated_at = now()
  WHERE is_series_parent = true 
    AND name IS DISTINCT FROM product_series;
    
  -- Update child variants to match their parent series name
  UPDATE products AS child
  SET product_series = parent.name,
      updated_at = now()
  FROM products AS parent
  WHERE child.parent_series_id = parent.id
    AND parent.is_series_parent = true
    AND child.product_series IS DISTINCT FROM parent.name;
END;
$$ LANGUAGE plpgsql;

-- Run the consistency check once
SELECT ensure_series_consistency();

-- Enable realtime for products table if not already enabled
ALTER TABLE products REPLICA IDENTITY FULL;
DO $$ 
BEGIN
  -- Add products table to realtime publication
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE products;
  EXCEPTION 
    WHEN duplicate_object THEN 
      -- Table is already in publication, continue
      NULL;
  END;
END $$;
