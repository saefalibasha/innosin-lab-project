
-- 1. Fix security definer view: add security_invoker
ALTER VIEW public.inno_project_state SET (security_invoker = true);

-- 2. Revoke EXECUTE on remaining SECURITY DEFINER trigger functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.audit_admin_role_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_anonymous_session_pii() FROM PUBLIC, anon, authenticated;

-- 3. Tighten always-true RLS policy on rate_limit_log
DROP POLICY IF EXISTS "System can insert rate limit logs" ON public.rate_limit_log;
CREATE POLICY "Users can insert own rate limit logs"
  ON public.rate_limit_log FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- 4. Add admin-only RLS policies on tables with RLS enabled but no policies
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['inno_vault_notes','inno_vault_daily','inno_vault_tasks','security_log','inno_message_log','inno_alert_log','inno_email_intel','inno_email_tasks','inno_reminders']
  LOOP
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('CREATE POLICY "Admins manage %I" ON public.%I FOR ALL TO authenticated USING (public.is_admin(public.get_current_user_email())) WITH CHECK (public.is_admin(public.get_current_user_email()))', t, t);
  END LOOP;
END$$;

-- 5. Remove sensitive tables from realtime publication (admin dashboards can refetch on demand)
ALTER PUBLICATION supabase_realtime DROP TABLE public.chat_sessions;
ALTER PUBLICATION supabase_realtime DROP TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime DROP TABLE public.hubspot_integration_logs;

-- 6. Remove broad SELECT (listing) policies on public storage buckets.
-- Files remain accessible via direct public URLs because the buckets are public; only LIST is removed.
DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view shop look images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product assets" ON storage.objects;
