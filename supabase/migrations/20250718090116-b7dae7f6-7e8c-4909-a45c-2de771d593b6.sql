
-- First, let's update the is_admin function to ensure it has proper security definer privileges
CREATE OR REPLACE FUNCTION public.is_admin(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE admin_roles.user_email = $1 
    AND is_active = true
  );
$function$;

-- Create a helper function to get current user email safely
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $function$
  SELECT email FROM auth.users WHERE id = auth.uid();
$function$;

-- Update the products table RLS policies to avoid direct auth.users access
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Public can read active products" ON public.products;

-- Create new policies using the security definer functions
CREATE POLICY "Admins can manage products" ON public.products
FOR ALL USING (
  public.is_admin(public.get_current_user_email())
);

CREATE POLICY "Public can read active products" ON public.products
FOR SELECT USING (is_active = true);

-- Also update other tables that might have similar issues
-- Update admin_roles policies
DROP POLICY IF EXISTS "Users can read admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Super admins can manage admin roles" ON public.admin_roles;

CREATE POLICY "Users can read admin roles" ON public.admin_roles
FOR SELECT USING (
  user_email = public.get_current_user_email()
  OR public.is_admin(public.get_current_user_email())
);

CREATE POLICY "Super admins can manage admin roles" ON public.admin_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles admin_roles_1
    WHERE admin_roles_1.user_email = public.get_current_user_email()
    AND admin_roles_1.role = 'super_admin'
    AND admin_roles_1.is_active = true
  )
  -- Prevent self-escalation: cannot modify own role
  AND user_email != public.get_current_user_email()
);

-- Update other tables with similar issues
-- Chat sessions
DROP POLICY IF EXISTS "Authenticated users can view chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.chat_sessions;

CREATE POLICY "Authenticated users can view chat sessions" ON public.chat_sessions
FOR SELECT USING (
  (auth.uid() IS NOT NULL) AND (
    (auth.uid()::text = user_id::text) OR 
    (user_id IS NULL) OR 
    public.is_admin(public.get_current_user_email())
  )
);

CREATE POLICY "Users can update their own chat sessions" ON public.chat_sessions
FOR UPDATE USING (
  (auth.uid() IS NOT NULL) AND (
    (auth.uid()::text = user_id::text) OR 
    (user_id IS NULL) OR 
    public.is_admin(public.get_current_user_email())
  )
);

-- Chat messages
DROP POLICY IF EXISTS "Users can view messages from accessible sessions" ON public.chat_messages;

CREATE POLICY "Users can view messages from accessible sessions" ON public.chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_sessions cs
    WHERE cs.id = chat_messages.session_id AND (
      (auth.uid()::text = cs.user_id::text) OR 
      (cs.user_id IS NULL) OR 
      public.is_admin(public.get_current_user_email())
    )
  )
);

-- Update bulk upload sessions
DROP POLICY IF EXISTS "Users can view their upload sessions" ON public.bulk_upload_sessions;
DROP POLICY IF EXISTS "Users can update their upload sessions" ON public.bulk_upload_sessions;

CREATE POLICY "Users can view their upload sessions" ON public.bulk_upload_sessions
FOR SELECT USING (
  (auth.uid() = user_id) OR public.is_admin(public.get_current_user_email())
);

CREATE POLICY "Users can update their upload sessions" ON public.bulk_upload_sessions
FOR UPDATE USING (
  (auth.uid() = user_id) OR public.is_admin(public.get_current_user_email())
);

-- Update admin audit and rate limit tables
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.admin_role_audit;
CREATE POLICY "Admins can read audit logs" ON public.admin_role_audit
FOR SELECT USING (
  public.is_admin(public.get_current_user_email())
);

DROP POLICY IF EXISTS "Admins can read rate limit logs" ON public.rate_limit_log;
CREATE POLICY "Admins can read rate limit logs" ON public.rate_limit_log
FOR SELECT USING (
  public.is_admin(public.get_current_user_email())
);

-- Update HubSpot logs
DROP POLICY IF EXISTS "Admins can access hubspot logs" ON public.hubspot_integration_logs;
CREATE POLICY "Admins can access hubspot logs" ON public.hubspot_integration_logs
FOR ALL USING (
  public.is_admin(public.get_current_user_email())
);

-- Update all document-related tables
DROP POLICY IF EXISTS "Admins can manage pdf documents" ON public.pdf_documents;
CREATE POLICY "Admins can manage pdf documents" ON public.pdf_documents
FOR ALL USING (
  public.is_admin(public.get_current_user_email())
);

DROP POLICY IF EXISTS "Admins can manage pdf content" ON public.pdf_content;
CREATE POLICY "Admins can manage pdf content" ON public.pdf_content
FOR ALL USING (
  public.is_admin(public.get_current_user_email())
);

DROP POLICY IF EXISTS "Admins can manage knowledge base entries" ON public.knowledge_base_entries;
CREATE POLICY "Admins can manage knowledge base entries" ON public.knowledge_base_entries
FOR ALL USING (
  public.is_admin(public.get_current_user_email())
);

DROP POLICY IF EXISTS "Admins can manage product specifications" ON public.product_specifications;
CREATE POLICY "Admins can manage product specifications" ON public.product_specifications
FOR ALL USING (
  public.is_admin(public.get_current_user_email())
);

DROP POLICY IF EXISTS "Admins can manage training data" ON public.chatbot_training_data;
CREATE POLICY "Admins can manage training data" ON public.chatbot_training_data
FOR ALL USING (
  public.is_admin(public.get_current_user_email())
);
