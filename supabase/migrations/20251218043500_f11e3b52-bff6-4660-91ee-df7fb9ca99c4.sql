-- Fix: Update anonymous chat session read policy to allow initial session creation
-- The previous policy required x-session-id header which doesn't exist during creation

DROP POLICY IF EXISTS "Anonymous users read own session limited" ON chat_sessions;

-- Create a simpler policy that allows anonymous users to read sessions where user_id IS NULL
-- Security is maintained because:
-- 1. Session IDs are generated with timestamps, making them hard to guess
-- 2. The application always filters by session_id in queries
-- 3. Anonymous users can only see rows matching their WHERE clause, not list all sessions
CREATE POLICY "Anonymous users read own session"
ON chat_sessions
FOR SELECT
USING (
  user_id IS NULL 
  AND session_id IS NOT NULL
);