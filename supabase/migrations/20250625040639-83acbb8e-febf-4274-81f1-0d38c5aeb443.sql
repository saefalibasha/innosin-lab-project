
-- Add your email to the admin roles table
INSERT INTO admin_roles (user_email, role) 
VALUES ('saefalib@innosinlab.com', 'admin')
ON CONFLICT (user_email) DO NOTHING;
