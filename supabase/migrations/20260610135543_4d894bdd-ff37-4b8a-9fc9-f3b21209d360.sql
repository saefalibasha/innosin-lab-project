
-- Explicit restrictive policies blocking anonymous SELECT on PII tables
CREATE POLICY "Block anonymous reads of chat sessions"
  ON public.chat_sessions AS RESTRICTIVE
  FOR SELECT TO anon
  USING (false);

CREATE POLICY "Block anonymous reads of chat messages"
  ON public.chat_messages AS RESTRICTIVE
  FOR SELECT TO anon
  USING (false);
