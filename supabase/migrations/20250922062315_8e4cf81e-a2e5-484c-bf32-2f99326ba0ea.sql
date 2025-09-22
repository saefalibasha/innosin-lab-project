-- Comprehensive security fix: Remove public access from sensitive tables

-- Fix chat_sessions table - ensure it's properly secured
-- This should already be done but let's make sure
DROP POLICY IF EXISTS "Public can read active projects" ON public.chat_sessions;
DROP POLICY IF EXISTS "Public can read published blog posts" ON public.chat_sessions;

-- Fix hubspot_integration_logs - should only be accessible by admins
DROP POLICY IF EXISTS "Public can read hubspot logs" ON public.hubspot_integration_logs;
ALTER TABLE public.hubspot_integration_logs ENABLE ROW LEVEL SECURITY;

-- Create admin-only policy for hubspot_integration_logs
CREATE POLICY "Admin only access to hubspot logs" 
ON public.hubspot_integration_logs 
FOR ALL 
USING (is_admin(get_current_user_email()))
WITH CHECK (is_admin(get_current_user_email()));

-- Fix admin_role_audit - should only be accessible by admins
DROP POLICY IF EXISTS "Public can read admin audit" ON public.admin_role_audit;
ALTER TABLE public.admin_role_audit ENABLE ROW LEVEL SECURITY;

-- The existing policy should already be correct, but let's ensure it exists
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.admin_role_audit;
CREATE POLICY "Admins can read audit logs" 
ON public.admin_role_audit 
FOR SELECT 
USING (is_admin(get_current_user_email()));

-- Fix security_audit_log - should only be accessible by admins  
DROP POLICY IF EXISTS "Public can read security logs" ON public.security_audit_log;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- The existing policy should already be correct, but let's ensure it exists
DROP POLICY IF EXISTS "Admins can read security audit logs" ON public.security_audit_log;
CREATE POLICY "Admins can read security audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (is_admin(get_current_user_email()));

-- Ensure no other tables have unintended public access
-- Check if any other audit/logging tables need protection
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read rate limits" ON public.rate_limit_log;

-- Verify all sensitive tables have proper RLS
-- Chat messages should only be accessible through chat sessions
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read chat messages" ON public.chat_messages;

-- Product activity logs should be admin only
ALTER TABLE public.product_activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read product activity" ON public.product_activity_log;

-- Knowledge base history should be admin only
ALTER TABLE public.knowledge_base_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read knowledge history" ON public.knowledge_base_history;

-- Training data should be admin only for sensitive entries
ALTER TABLE public.training_data_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read training data" ON public.training_data_entries;

-- Asset uploads should be admin only
ALTER TABLE public.asset_uploads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read asset uploads" ON public.asset_uploads;

-- Bulk upload sessions should be user/admin only
ALTER TABLE public.bulk_upload_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read upload sessions" ON public.bulk_upload_sessions;

-- Log this comprehensive security fix
SELECT public.log_security_event(
  'comprehensive_security_hardening',
  'multiple_tables',
  NULL,
  jsonb_build_object(
    'action', 'removed_public_access_from_sensitive_tables',
    'tables_secured', ARRAY[
      'hubspot_integration_logs',
      'admin_role_audit', 
      'security_audit_log',
      'rate_limit_log',
      'chat_messages',
      'product_activity_log',
      'knowledge_base_history',
      'training_data_entries',
      'asset_uploads',
      'bulk_upload_sessions'
    ],
    'timestamp', now()::text
  )
);