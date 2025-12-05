-- Fix anonymous session cross-reading vulnerability
-- Drop the overly permissive policy that allows reading ALL anonymous sessions
DROP POLICY IF EXISTS "Anonymous session read basic only" ON public.chat_sessions;

-- Create a more restrictive policy that requires session_id to be passed
-- Anonymous users can only read sessions where they provide the matching session_id
CREATE POLICY "Anonymous session read own only" ON public.chat_sessions
  FOR SELECT
  USING (
    user_id IS NULL AND 
    session_id IS NOT NULL AND
    session_id = COALESCE(
      current_setting('request.headers', true)::json->>'x-session-id',
      current_setting('request.headers', true)::json->>'X-Session-Id'
    )
  );