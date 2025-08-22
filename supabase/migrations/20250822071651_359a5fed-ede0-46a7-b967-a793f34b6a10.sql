-- Insert admin role for saefalib@innosinlab.com using correct column name
INSERT INTO public.admin_roles (user_email, role, is_active) 
VALUES ('saefalib@innosinlab.com', 'admin', true)
ON CONFLICT (user_email) DO UPDATE SET
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;