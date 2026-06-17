-- Remove the permissive anonymous INSERT policy on secure_session_tokens.
-- Tokens should only be created server-side via the create_session_token() SECURITY DEFINER function,
-- which already runs with elevated privileges and bypasses RLS.
DROP POLICY IF EXISTS "Anonymous users can create session tokens" ON public.secure_session_tokens;
DROP POLICY IF EXISTS "Anyone can create session tokens" ON public.secure_session_tokens;
DROP POLICY IF EXISTS "Allow anonymous insert session tokens" ON public.secure_session_tokens;
DROP POLICY IF EXISTS "Public can insert session tokens" ON public.secure_session_tokens;

-- Also revoke direct INSERT from anon/authenticated; only service_role and SECURITY DEFINER functions create tokens
REVOKE INSERT ON public.secure_session_tokens FROM anon, authenticated;
GRANT INSERT ON public.secure_session_tokens TO service_role;