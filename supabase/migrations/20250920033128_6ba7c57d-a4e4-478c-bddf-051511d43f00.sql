-- Critical Security Fixes

-- 1. Fix chat_sessions RLS policies to prevent customer data exposure
DROP POLICY IF EXISTS "Anonymous sessions can be read briefly" ON public.chat_sessions;
DROP POLICY IF EXISTS "Anonymous sessions can be updated briefly" ON public.chat_sessions;
DROP POLICY IF EXISTS "System can create anonymous chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can access their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can create their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions;

-- Create secure chat session policies
CREATE POLICY "Users can manage their own chat sessions"
ON public.chat_sessions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all chat sessions"
ON public.chat_sessions
FOR SELECT
USING (is_admin(get_current_user_email()));

CREATE POLICY "System can create anonymous sessions"
ON public.chat_sessions
FOR INSERT
WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

CREATE POLICY "Anonymous sessions limited access"
ON public.chat_sessions
FOR SELECT
USING (
  user_id IS NULL 
  AND session_id IS NOT NULL 
  AND created_at > (now() - interval '1 hour')
  AND email IS NULL 
  AND phone IS NULL 
  AND company IS NULL
);

-- 2. Fix database functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.admin_roles 
  WHERE user_email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ) AND is_active = true
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_email text)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE admin_roles.user_email = $1 
    AND role = 'super_admin'
    AND is_active = true
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin(user_email text)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE admin_roles.user_email = $1 
    AND is_active = true
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_rate_limit(operation_name text, max_attempts integer DEFAULT 5, time_window_minutes integer DEFAULT 60)
RETURNS BOOLEAN AS $$
  SELECT (
    SELECT COUNT(*) 
    FROM public.rate_limit_log 
    WHERE operation = operation_name
    AND (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    AND created_at > (now() - (time_window_minutes || ' minutes')::interval)
  ) < max_attempts;
$$ LANGUAGE SQL SECURITY DEFINER SET search_path = public;

-- 3. Add data retention policy for anonymous sessions
CREATE OR REPLACE FUNCTION public.cleanup_old_anonymous_sessions()
RETURNS VOID AS $$
BEGIN
  -- Delete anonymous chat sessions older than 24 hours
  DELETE FROM public.chat_sessions 
  WHERE user_id IS NULL 
  AND created_at < (now() - interval '24 hours');
  
  -- Delete related messages
  DELETE FROM public.chat_messages 
  WHERE session_id NOT IN (SELECT id FROM public.chat_sessions);
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public;

-- 4. Create trigger to automatically audit admin role changes
CREATE OR REPLACE FUNCTION public.audit_admin_role_changes()
RETURNS TRIGGER AS $$
DECLARE
  current_user_email text;
BEGIN
  -- Get current user email
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.admin_role_audit (
      changed_by_email, target_user_email, new_role, action
    ) VALUES (
      COALESCE(current_user_email, 'system'), NEW.user_email, NEW.role, 'created'
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log role changes
    IF OLD.role != NEW.role THEN
      INSERT INTO public.admin_role_audit (
        changed_by_email, target_user_email, old_role, new_role, action
      ) VALUES (
        COALESCE(current_user_email, 'system'), NEW.user_email, OLD.role, NEW.role, 'updated'
      );
    END IF;
    
    -- Log activation/deactivation
    IF OLD.is_active != NEW.is_active THEN
      INSERT INTO public.admin_role_audit (
        changed_by_email, target_user_email, old_role, new_role, action
      ) VALUES (
        COALESCE(current_user_email, 'system'), NEW.user_email, NEW.role, NEW.role, 
        CASE WHEN NEW.is_active THEN 'activated' ELSE 'deactivated' END
      );
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.admin_role_audit (
      changed_by_email, target_user_email, old_role, action
    ) VALUES (
      COALESCE(current_user_email, 'system'), OLD.user_email, OLD.role, 'deleted'
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public;

-- Create the trigger
DROP TRIGGER IF EXISTS admin_roles_audit_trigger ON public.admin_roles;
CREATE TRIGGER admin_roles_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_admin_role_changes();

-- 5. Enhanced security monitoring
INSERT INTO public.security_audit_log (user_email, action, resource, metadata)
VALUES ('system', 'security_hardening', 'database', '{"event": "critical_security_fixes_applied", "timestamp": "' || now() || '"}');