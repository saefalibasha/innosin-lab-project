-- Fix 1: Remove overly permissive anonymous read policy and restrict access to non-PII view
-- Drop the policy that exposes PII to anonymous users
DROP POLICY IF EXISTS "Anonymous users read own session" ON chat_sessions;

-- Create a more restrictive policy that only allows anonymous users to see their own session
-- but through a more secure mechanism (checking session_id match without exposing PII)
CREATE POLICY "Anonymous users read own session limited"
ON chat_sessions
FOR SELECT
USING (
  user_id IS NULL 
  AND session_id IS NOT NULL 
  AND session_id = COALESCE(
    (current_setting('request.headers', true)::json->>'x-session-id'),
    (current_setting('request.headers', true)::json->>'X-Session-Id'),
    ''
  )
);

-- Note: The existing chat_sessions_public view already filters out PII fields
-- Grant SELECT on the public view to anon role
GRANT SELECT ON chat_sessions_public TO anon;

-- Fix 2: Protect admin audit logs from tampering
-- Make audit logs immutable - no manual inserts allowed (trigger function uses SECURITY DEFINER)
CREATE POLICY "Audit logs insert blocked for users"
ON admin_role_audit
FOR INSERT
WITH CHECK (false);

-- Make audit logs immutable - no updates allowed
CREATE POLICY "Audit logs are immutable"
ON admin_role_audit
FOR UPDATE
USING (false);

-- Make audit logs permanent - no deletes allowed  
CREATE POLICY "Audit logs are permanent"
ON admin_role_audit
FOR DELETE
USING (false);

-- Fix 3: Tighten secure_session_tokens anonymous policy
-- Current policy is too permissive (USING true)
DROP POLICY IF EXISTS "Anonymous users can manage tokens by hash" ON secure_session_tokens;

-- Create more restrictive policy - anonymous users can only insert new tokens (no read/update/delete)
CREATE POLICY "Anonymous users can create tokens only"
ON secure_session_tokens
FOR INSERT
WITH CHECK (user_id IS NULL);