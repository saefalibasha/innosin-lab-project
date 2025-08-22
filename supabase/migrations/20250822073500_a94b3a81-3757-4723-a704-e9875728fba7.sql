-- Fix infinite recursion in admin_roles RLS policies
-- Drop the problematic policy that uses is_admin function
DROP POLICY IF EXISTS "Users can read admin roles" ON admin_roles;

-- Create a simpler policy that doesn't cause recursion
CREATE POLICY "Users can read their own admin role" 
ON admin_roles 
FOR SELECT 
USING (user_email = get_current_user_email());

-- Allow admins to read all roles without recursion
CREATE POLICY "Admins can read all admin roles" 
ON admin_roles 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM admin_roles ar 
  WHERE ar.user_email = get_current_user_email() 
  AND ar.is_active = true
));