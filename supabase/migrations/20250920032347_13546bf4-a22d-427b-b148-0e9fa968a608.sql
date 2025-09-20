-- Fix critical RLS security issues

-- 1. Drop problematic policies for chat_sessions
DROP POLICY IF EXISTS "Anonymous users can create chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Anonymous users can update chat sessions by session_id" ON public.chat_sessions;
DROP POLICY IF EXISTS "Anonymous users can view chat sessions by session_id" ON public.chat_sessions;

-- 2. Create secure chat session policies
-- Only allow authenticated users to access their own sessions
CREATE POLICY "Users can access their own chat sessions"
ON public.chat_sessions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow system operations for chat sessions without user_id (for initial creation)
CREATE POLICY "System can create anonymous chat sessions"
ON public.chat_sessions
FOR INSERT
WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

-- Allow updating anonymous sessions only by session_id for a limited time (1 hour)
CREATE POLICY "Anonymous sessions can be updated briefly"
ON public.chat_sessions
FOR UPDATE
USING (
  user_id IS NULL 
  AND session_id IS NOT NULL 
  AND created_at > (now() - interval '1 hour')
);

-- Allow reading anonymous sessions only by session_id for a limited time (1 hour)
CREATE POLICY "Anonymous sessions can be read briefly"
ON public.chat_sessions
FOR SELECT
USING (
  user_id IS NULL 
  AND session_id IS NOT NULL 
  AND created_at > (now() - interval '1 hour')
);

-- 3. Fix admin_roles policies - remove public read access
DROP POLICY IF EXISTS "Authenticated users can read admin roles" ON public.admin_roles;

-- Only allow users to see their own admin status
CREATE POLICY "Users can see their own admin status"
ON public.admin_roles
FOR SELECT
USING (user_email = get_current_user_email());

-- Only super admins can manage admin roles
CREATE POLICY "Super admins can manage admin roles"
ON public.admin_roles
FOR ALL
USING (is_super_admin(get_current_user_email()))
WITH CHECK (is_super_admin(get_current_user_email()));

-- 4. Fix function search paths for security
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.admin_roles 
  WHERE user_email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ) AND is_active = true
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_email()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT email FROM auth.users WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_email text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE admin_roles.user_email = $1 
    AND role = 'super_admin'
    AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(user_email text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE admin_roles.user_email = $1 
    AND is_active = true
  );
$function$;

-- 5. Add data retention policy for chat sessions
CREATE OR REPLACE FUNCTION public.cleanup_old_anonymous_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Delete anonymous chat sessions older than 24 hours
  DELETE FROM public.chat_sessions 
  WHERE user_id IS NULL 
  AND created_at < (now() - interval '24 hours');
  
  -- Delete related messages
  DELETE FROM public.chat_messages 
  WHERE session_id NOT IN (SELECT id FROM public.chat_sessions);
END;
$function$;

-- 6. Add audit logging for admin actions
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  action text NOT NULL,
  resource text,
  resource_id text,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read security audit logs"
ON public.security_audit_log
FOR SELECT
USING (is_admin(get_current_user_email()));

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action text,
  p_resource text DEFAULT NULL,
  p_resource_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;