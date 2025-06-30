
-- Remove problematic foreign key constraint from chat_sessions
ALTER TABLE public.chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_user_id_fkey;

-- Drop existing RLS policies that are causing issues
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can create chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.chat_sessions;

DROP POLICY IF EXISTS "Users can view messages from their sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create messages in their sessions" ON public.chat_messages;

DROP POLICY IF EXISTS "Allow read access to hubspot logs" ON public.hubspot_integration_logs;
DROP POLICY IF EXISTS "Allow insert access to hubspot logs" ON public.hubspot_integration_logs;

DROP POLICY IF EXISTS "Allow read access to training data" ON public.chatbot_training_data;
DROP POLICY IF EXISTS "Allow full access to training data" ON public.chatbot_training_data;

DROP POLICY IF EXISTS "Public read access for admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Only admins can modify admin roles" ON public.admin_roles;

-- Create improved RLS policies with proper security
-- Chat sessions policies
CREATE POLICY "Authenticated users can view chat sessions"
  ON public.chat_sessions
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid()::text = user_id::text OR 
      user_id IS NULL OR
      is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

CREATE POLICY "Authenticated users can create chat sessions"
  ON public.chat_sessions
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      auth.uid()::text = user_id::text OR 
      user_id IS NULL
    )
  );

CREATE POLICY "Users can update their own chat sessions"
  ON public.chat_sessions
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid()::text = user_id::text OR 
      user_id IS NULL OR
      is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

-- Chat messages policies
CREATE POLICY "Users can view messages from accessible sessions"
  ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = chat_messages.session_id
      AND (
        auth.uid()::text = cs.user_id::text OR 
        cs.user_id IS NULL OR
        is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
      )
    )
  );

CREATE POLICY "Users can create messages in accessible sessions"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = chat_messages.session_id
      AND (
        auth.uid()::text = cs.user_id::text OR 
        cs.user_id IS NULL
      )
    )
  );

-- HubSpot integration logs - admin access only
CREATE POLICY "Admins can access hubspot logs"
  ON public.hubspot_integration_logs
  FOR ALL
  USING (is_admin((SELECT email FROM auth.users WHERE id = auth.uid())));

-- Training data - allow public read, admin write
CREATE POLICY "Public can read training data"
  ON public.chatbot_training_data
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage training data"
  ON public.chatbot_training_data
  FOR ALL
  USING (is_admin((SELECT email FROM auth.users WHERE id = auth.uid())));

-- Admin roles - secure access
CREATE POLICY "Admins can read admin roles"
  ON public.admin_roles
  FOR SELECT
  USING (is_admin((SELECT email FROM auth.users WHERE id = auth.uid())));

CREATE POLICY "Super admins can manage admin roles"
  ON public.admin_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'super_admin' 
      AND is_active = true
    )
  );

-- Ensure all tables have proper RLS enabled
ALTER TABLE public.pdf_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;

-- Add policies for PDF-related tables
CREATE POLICY "Public can read pdf documents"
  ON public.pdf_documents
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage pdf documents"
  ON public.pdf_documents
  FOR ALL
  USING (is_admin((SELECT email FROM auth.users WHERE id = auth.uid())));

CREATE POLICY "Public can read pdf content"
  ON public.pdf_content
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage pdf content"
  ON public.pdf_content
  FOR ALL
  USING (is_admin((SELECT email FROM auth.users WHERE id = auth.uid())));

CREATE POLICY "Public can read knowledge base entries"
  ON public.knowledge_base_entries
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage knowledge base entries"
  ON public.knowledge_base_entries
  FOR ALL
  USING (is_admin((SELECT email FROM auth.users WHERE id = auth.uid())));

CREATE POLICY "Public can read product specifications"
  ON public.product_specifications
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product specifications"
  ON public.product_specifications
  FOR ALL
  USING (is_admin((SELECT email FROM auth.users WHERE id = auth.uid())));
