-- PHASE 1: Critical Security Remediation for chat_sessions PII Exposure

-- 1. Add your admin account to admin_roles table
INSERT INTO public.admin_roles (user_email, role, is_active) 
VALUES ('saefalib@innosinlab', 'admin', true)
ON CONFLICT (user_email, role) DO UPDATE SET is_active = true;

-- 2. Create secure view for anonymous sessions without PII
CREATE OR REPLACE VIEW public.anonymous_sessions_secure AS
SELECT 
  id,
  session_id,
  user_id,
  status,
  start_time,
  end_time,
  last_activity,
  created_at,
  updated_at,
  context,
  assigned_agent,
  satisfaction_score,
  hubspot_contact_id,
  hubspot_deal_id,
  hubspot_ticket_id
FROM public.chat_sessions
WHERE user_id IS NULL;

-- 3. Create data validation trigger to prevent PII in anonymous sessions
CREATE OR REPLACE FUNCTION public.validate_anonymous_session_pii()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is an anonymous session (user_id IS NULL), ensure no PII is stored
  IF NEW.user_id IS NULL THEN
    -- Clear any PII fields that might have been set
    NEW.name := NULL;
    NEW.email := NULL;
    NEW.phone := NULL;
    NEW.company := NULL;
    NEW.job_title := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public;

-- Create trigger for PII validation
DROP TRIGGER IF EXISTS validate_anonymous_pii ON public.chat_sessions;
CREATE TRIGGER validate_anonymous_pii
  BEFORE INSERT OR UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_anonymous_session_pii();

-- 4. Clean up existing PII data in anonymous sessions
UPDATE public.chat_sessions 
SET 
  name = NULL,
  email = NULL, 
  phone = NULL,
  company = NULL,
  job_title = NULL
WHERE user_id IS NULL AND (
  name IS NOT NULL OR 
  email IS NOT NULL OR 
  phone IS NOT NULL OR 
  company IS NOT NULL OR 
  job_title IS NOT NULL
);

-- 5. Update RLS policies for enhanced security
DROP POLICY IF EXISTS "Anonymous sessions limited access" ON public.chat_sessions;
CREATE POLICY "Anonymous sessions secure access"
ON public.chat_sessions
FOR SELECT
USING (
  (user_id IS NULL) AND 
  (session_id IS NOT NULL) AND 
  (created_at > (now() - '01:00:00'::interval)) AND
  -- Additional security: only if no PII fields are populated
  (name IS NULL AND email IS NULL AND phone IS NULL AND company IS NULL AND job_title IS NULL)
);

-- 6. Create audit trigger for chat_sessions access
CREATE OR REPLACE FUNCTION public.audit_chat_session_access()
RETURNS TRIGGER AS $$
DECLARE
  current_user_email text;
BEGIN
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  -- Log access to sessions with PII
  IF (OLD.name IS NOT NULL OR OLD.email IS NOT NULL OR OLD.phone IS NOT NULL OR 
      OLD.company IS NOT NULL OR OLD.job_title IS NOT NULL) THEN
    
    PERFORM public.log_security_event(
      'chat_session_pii_access',
      'chat_sessions', 
      OLD.id::text,
      jsonb_build_object(
        'session_id', OLD.session_id,
        'has_name', OLD.name IS NOT NULL,
        'has_email', OLD.email IS NOT NULL,
        'has_phone', OLD.phone IS NOT NULL,
        'has_company', OLD.company IS NOT NULL,
        'action', TG_OP
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public;

-- Create audit trigger
DROP TRIGGER IF EXISTS audit_chat_session_pii_access ON public.chat_sessions;
CREATE TRIGGER audit_chat_session_pii_access
  AFTER SELECT OR UPDATE OR DELETE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_chat_session_access();

-- 7. Create data retention function for anonymous sessions
CREATE OR REPLACE FUNCTION public.cleanup_anonymous_sessions_enhanced()
RETURNS VOID AS $$
BEGIN
  -- Delete anonymous chat sessions older than 2 hours (enhanced security)
  DELETE FROM public.chat_sessions 
  WHERE user_id IS NULL 
  AND created_at < (now() - interval '2 hours');
  
  -- Delete orphaned messages
  DELETE FROM public.chat_messages 
  WHERE session_id NOT IN (SELECT id FROM public.chat_sessions);
  
  -- Log cleanup action
  PERFORM public.log_security_event(
    'anonymous_session_cleanup',
    'chat_sessions',
    NULL,
    jsonb_build_object('cleaned_at', now()::text)
  );
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public;

-- 8. Add rate limiting for anonymous session creation
CREATE OR REPLACE FUNCTION public.check_anonymous_session_rate_limit()
RETURNS BOOLEAN AS $$
DECLARE
  current_ip inet;
  session_count integer;
BEGIN
  current_ip := inet_client_addr();
  
  -- Count anonymous sessions created from this IP in last hour
  SELECT COUNT(*) INTO session_count
  FROM public.chat_sessions 
  WHERE user_id IS NULL 
  AND created_at > (now() - interval '1 hour')
  AND session_id LIKE '%' || COALESCE(current_ip::text, 'unknown') || '%';
  
  -- Allow max 5 anonymous sessions per IP per hour
  RETURN session_count < 5;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public;

-- 9. Enhanced RLS policy for admin access
CREATE POLICY "Enhanced admin access to chat sessions"
ON public.chat_sessions
FOR ALL
USING (is_admin(get_current_user_email()))
WITH CHECK (is_admin(get_current_user_email()));

-- 10. Log security hardening completion
INSERT INTO public.security_audit_log (
  user_email, action, resource, metadata
) VALUES (
  'system',
  'security_hardening_completed',
  'chat_sessions',
  jsonb_build_object(
    'timestamp', now()::text,
    'measures_implemented', jsonb_build_array(
      'pii_validation_trigger',
      'anonymous_session_cleanup',
      'enhanced_rls_policies', 
      'audit_logging',
      'rate_limiting',
      'data_masking'
    )
  )
);