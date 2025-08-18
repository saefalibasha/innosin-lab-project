
-- Phase 1: Critical Data Protection Fixes

-- 1. Secure chat_sessions table - remove overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can create chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Authenticated users can view chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.chat_sessions;

-- Create secure policies for chat_sessions
CREATE POLICY "Users can create their own chat sessions" 
ON public.chat_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own chat sessions" 
ON public.chat_sessions 
FOR SELECT 
USING (auth.uid() = user_id OR is_admin(get_current_user_email()));

CREATE POLICY "Users can update their own chat sessions" 
ON public.chat_sessions 
FOR UPDATE 
USING (auth.uid() = user_id OR is_admin(get_current_user_email()));

-- 2. Secure chat_messages table
DROP POLICY IF EXISTS "Users can create messages in accessible sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view messages from accessible sessions" ON public.chat_messages;

CREATE POLICY "Users can create messages in their sessions" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_sessions cs 
    WHERE cs.id = chat_messages.session_id 
    AND cs.user_id = auth.uid()
  ) OR is_admin(get_current_user_email())
);

CREATE POLICY "Users can view messages from their sessions" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM chat_sessions cs 
    WHERE cs.id = chat_messages.session_id 
    AND (cs.user_id = auth.uid() OR is_admin(get_current_user_email()))
  )
);

-- 3. Remove overly permissive policies from knowledge base and PDF tables
DROP POLICY IF EXISTS "Allow admin access to knowledge base" ON public.knowledge_base_entries;
DROP POLICY IF EXISTS "Allow read access to knowledge base" ON public.knowledge_base_entries;
DROP POLICY IF EXISTS "Allow admin access to PDF content" ON public.pdf_content;
DROP POLICY IF EXISTS "Allow read access to PDF content" ON public.pdf_content;
DROP POLICY IF EXISTS "Allow admin access to PDF documents" ON public.pdf_documents;
DROP POLICY IF EXISTS "Allow read access to PDF documents" ON public.pdf_documents;

-- 4. Secure rate_limit_log table - only admins should access
DROP POLICY IF EXISTS "Admins can read rate limit logs" ON public.rate_limit_log;

CREATE POLICY "Admins can manage rate limit logs" 
ON public.rate_limit_log 
FOR ALL 
USING (is_admin(get_current_user_email()));

-- Allow system to insert rate limit logs
CREATE POLICY "System can insert rate limit logs" 
ON public.rate_limit_log 
FOR INSERT 
WITH CHECK (true);

-- 5. Enhanced security function for better role checking
CREATE OR REPLACE FUNCTION public.is_super_admin(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE admin_roles.user_email = $1 
    AND role = 'super_admin'
    AND is_active = true
  );
$function$;

-- 6. Create trigger for admin_role_changes if not exists
DROP TRIGGER IF EXISTS admin_role_audit_trigger ON public.admin_roles;
CREATE TRIGGER admin_role_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_admin_role_changes();
