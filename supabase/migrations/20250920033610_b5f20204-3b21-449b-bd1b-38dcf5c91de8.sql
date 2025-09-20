-- Fix remaining security issues

-- 1. Fix any remaining functions with mutable search paths
CREATE OR REPLACE FUNCTION public.log_security_event(p_action text, p_resource text DEFAULT NULL::text, p_resource_id text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS VOID AS $$
DECLARE
  current_user_email text;
BEGIN
  SELECT email INTO current_user_email 
  FROM auth.users 
  WHERE id = auth.uid();
  
  INSERT INTO public.security_audit_log (
    user_email, action, resource, resource_id, metadata
  ) VALUES (
    COALESCE(current_user_email, 'anonymous'), 
    p_action, 
    p_resource, 
    p_resource_id, 
    p_metadata
  );
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.process_uploaded_asset(p_product_id uuid, p_file_path text, p_file_type text, p_public_url text)
RETURNS VOID AS $$
BEGIN
  -- Update product with appropriate asset paths based on file type
  IF p_file_type LIKE 'image/%' THEN
    -- Set as thumbnail and overview image if they don't exist
    UPDATE products 
    SET 
      thumbnail_path = COALESCE(thumbnail_path, p_public_url),
      overview_image_path = COALESCE(overview_image_path, p_public_url),
      updated_at = now()
    WHERE id = p_product_id;
  ELSIF p_file_type = 'model/gltf-binary' OR p_file_path LIKE '%.glb' THEN
    -- Set as 3D model
    UPDATE products 
    SET 
      model_path = p_public_url,
      updated_at = now()
    WHERE id = p_product_id;
  END IF;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public;