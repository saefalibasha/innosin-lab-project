-- Fix admin access and RLS error for admin_roles

-- 1) Ensure your admin email is present and active
INSERT INTO public.admin_roles (user_email, role, is_active)
VALUES ('saefalib@innosinlab.com', 'admin', true)
ON CONFLICT DO NOTHING;

UPDATE public.admin_roles
SET is_active = true
WHERE user_email = 'saefalib@innosinlab.com' AND role = 'admin';

-- 2) Remove problematic RLS policy that directly referenced auth.users
DROP POLICY IF EXISTS "Users can read their own admin role direct" ON public.admin_roles;

-- Keep the safe function-based policy "Users can see their own admin status"
-- (already exists and uses get_current_user_email() SECURITY DEFINER)

-- 3) Log change
INSERT INTO public.security_audit_log (user_email, action, resource, metadata)
VALUES (
  'system',
  'rls_fix_applied',
  'admin_roles',
  jsonb_build_object('dropped_policy', 'Users can read their own admin role direct', 'admin_email', 'saefalib@innosinlab.com')
);