-- Harden chat_sessions RLS and add PII protection trigger
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing broad policies if present
DROP POLICY IF EXISTS "Admins can delete chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Admins can view all chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Authenticated users manage own sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Enhanced admin access to chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Secure anonymous session creation" ON public.chat_sessions;
DROP POLICY IF EXISTS "Secure anonymous session access" ON public.chat_sessions;

-- Authenticated users can fully manage their own sessions
CREATE POLICY "Authenticated users manage own sessions"
ON public.chat_sessions
AS PERMISSIVE
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins have full access to all sessions
CREATE POLICY "Admins full access to chat sessions"
ON public.chat_sessions
AS PERMISSIVE
FOR ALL
TO authenticated
USING (is_admin(get_current_user_email()))
WITH CHECK (is_admin(get_current_user_email()));

-- Allow secure anonymous session creation only (no PII)
CREATE POLICY "Secure anonymous session creation"
ON public.chat_sessions
AS PERMISSIVE
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL
  AND session_id IS NOT NULL
  AND name IS NULL AND email IS NULL AND phone IS NULL AND company IS NULL AND job_title IS NULL
  AND hubspot_contact_id IS NULL AND hubspot_deal_id IS NULL AND hubspot_ticket_id IS NULL
);

-- Add PII sanitization trigger for anonymous sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'chat_sessions_validate_pii'
  ) THEN
    CREATE TRIGGER chat_sessions_validate_pii
    BEFORE INSERT OR UPDATE ON public.chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_anonymous_session_pii();
  END IF;
END $$;

-- Log action
SELECT public.log_security_event(
  'chat_sessions_rls_hardening',
  'chat_sessions',
  NULL,
  jsonb_build_object(
    'public_select_removed', true,
    'policies', ARRAY['Authenticated users manage own sessions (to authenticated)','Admins full access to chat sessions (to authenticated)','Secure anonymous session creation (to anon)'],
    'pii_trigger_added', true,
    'timestamp', now()::text
  )
);