
-- Update saefalib@innosinlab.com to super_admin role
UPDATE admin_roles 
SET role = 'super_admin' 
WHERE user_email = 'saefalib@innosinlab.com';
