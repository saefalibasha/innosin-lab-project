-- Add input validation to is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE admin_roles.user_email = lower(trim($1))
    AND is_active = true
    AND length(trim($1)) BETWEEN 3 AND 255
    AND trim($1) ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );
$$;

-- Add input validation to is_super_admin function  
CREATE OR REPLACE FUNCTION public.is_super_admin(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE admin_roles.user_email = lower(trim($1))
    AND role = 'super_admin'
    AND is_active = true
    AND length(trim($1)) BETWEEN 3 AND 255
    AND trim($1) ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );
$$;