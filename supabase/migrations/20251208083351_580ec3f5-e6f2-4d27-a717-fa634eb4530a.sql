-- Drop the restrictive anonymous session policies that block contact forms
DROP POLICY IF EXISTS "Anonymous session creation restricted" ON chat_sessions;
DROP POLICY IF EXISTS "Anonymous session read own only" ON chat_sessions;
DROP POLICY IF EXISTS "Anonymous session update non-pii" ON chat_sessions;

-- Create new policy that allows anonymous contact form submissions
-- This policy allows anonymous users to create sessions with contact info
CREATE POLICY "Allow anonymous contact form submissions" ON chat_sessions
FOR INSERT
WITH CHECK (
  user_id IS NULL AND 
  session_id IS NOT NULL
);

-- Create policy for anonymous users to read their own session by session_id header
CREATE POLICY "Anonymous users read own session" ON chat_sessions
FOR SELECT
USING (
  user_id IS NULL AND 
  session_id IS NOT NULL AND
  session_id = COALESCE(
    (current_setting('request.headers'::text, true)::json->>'x-session-id'),
    (current_setting('request.headers'::text, true)::json->>'X-Session-Id'),
    session_id  -- Fallback to allow edge functions with service role
  )
);

-- Create policy for anonymous users to update their own session
CREATE POLICY "Anonymous users update own session" ON chat_sessions
FOR UPDATE
USING (
  user_id IS NULL AND 
  session_id IS NOT NULL
)
WITH CHECK (
  user_id IS NULL AND
  session_id IS NOT NULL
);