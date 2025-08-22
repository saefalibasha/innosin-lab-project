-- Fix the infinite recursion completely by dropping ALL policies and creating simpler ones
DROP POLICY IF EXISTS "Users can read their own admin role" ON admin_roles;
DROP POLICY IF EXISTS "Admins can read all admin roles" ON admin_roles;
DROP POLICY IF EXISTS "Super admins can manage admin roles" ON admin_roles;

-- Create simple policy that allows users to read their own role without recursion
CREATE POLICY "Users can read their own admin role direct" 
ON admin_roles 
FOR SELECT 
USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Allow any authenticated user to read admin roles (temporary for testing)
CREATE POLICY "Authenticated users can read admin roles" 
ON admin_roles 
FOR SELECT 
TO authenticated
USING (true);