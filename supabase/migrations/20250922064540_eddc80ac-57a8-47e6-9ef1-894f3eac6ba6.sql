-- Remove public read access on chat_sessions (anonymous select)
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Secure anonymous session access" ON public.chat_sessions;

-- Rely on existing policies:
--  - "Authenticated users manage own sessions" (ALL with USING auth.uid() = user_id)
--  - Admin policies for broader access

-- Log the security hardening action
SELECT public.log_security_event(
  'remove_anonymous_chat_sessions_select',
  'chat_sessions',
  NULL,
  jsonb_build_object(
    'policy_removed', 'Secure anonymous session access',
    'reason', 'Prevent public access to sensitive customer contact information',
    'timestamp', now()::text
  )
);