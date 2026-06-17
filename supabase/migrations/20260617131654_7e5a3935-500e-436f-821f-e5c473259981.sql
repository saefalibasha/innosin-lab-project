
-- chat_messages: tighten SELECT to exclude null-owner sessions for non-admins
DROP POLICY IF EXISTS "Users can view messages from their sessions" ON public.chat_messages;
CREATE POLICY "Users can view messages from their sessions"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = chat_messages.session_id
        AND (
          (cs.user_id IS NOT NULL AND cs.user_id = auth.uid())
          OR public.is_admin(public.get_current_user_email())
        )
    )
  );

-- chatbot_training_data: remove public read
DROP POLICY IF EXISTS "Public can read training data" ON public.chatbot_training_data;

-- knowledge_base_entries: remove public read
DROP POLICY IF EXISTS "Public can read knowledge base entries" ON public.knowledge_base_entries;

-- pdf_documents / pdf_content: remove public read
DROP POLICY IF EXISTS "Public can read pdf documents" ON public.pdf_documents;
DROP POLICY IF EXISTS "Public can read pdf content" ON public.pdf_content;

-- projects: explicit anon deny
CREATE POLICY "Block anonymous reads of projects"
  ON public.projects AS RESTRICTIVE FOR SELECT TO anon
  USING (false);

-- quotes: explicit anon deny
CREATE POLICY "Block anonymous reads of quotes"
  ON public.quotes AS RESTRICTIVE FOR SELECT TO anon
  USING (false);
