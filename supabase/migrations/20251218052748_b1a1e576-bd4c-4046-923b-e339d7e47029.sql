-- Fix: Update chat_messages INSERT policy to allow anonymous users
-- The previous policy failed because NULL = NULL returns FALSE in SQL

DROP POLICY IF EXISTS "Users can create messages in their sessions" ON chat_messages;

CREATE POLICY "Users can create messages in their sessions"
ON chat_messages
FOR INSERT
WITH CHECK (
  -- Authenticated users can insert into their own sessions
  (EXISTS (
    SELECT 1 FROM chat_sessions cs
    WHERE cs.id = chat_messages.session_id 
    AND cs.user_id = auth.uid()
    AND auth.uid() IS NOT NULL
  ))
  OR
  -- Anonymous users can insert into anonymous sessions
  (EXISTS (
    SELECT 1 FROM chat_sessions cs
    WHERE cs.id = chat_messages.session_id 
    AND cs.user_id IS NULL
    AND auth.uid() IS NULL
  ))
  OR
  -- Admins can insert into any session
  is_admin(get_current_user_email())
);