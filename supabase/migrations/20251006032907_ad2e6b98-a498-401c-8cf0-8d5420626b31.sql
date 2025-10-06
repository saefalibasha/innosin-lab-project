-- Add RLS policy to allow users to read their own admin role via JWT
-- This ensures Storage RLS policies can verify admin status
CREATE POLICY "User reads own role via JWT"
ON public.admin_roles
FOR SELECT
TO authenticated
USING (
  lower(user_email) = lower((current_setting('request.jwt.claims', true)::jsonb ->> 'email'))
);