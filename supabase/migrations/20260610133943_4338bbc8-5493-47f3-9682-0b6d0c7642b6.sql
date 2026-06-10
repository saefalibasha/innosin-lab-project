
-- 1. Enable RLS + admin-only policies on unprotected internal tables
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'agent_health_log','agent_memory','api_usage','approval_log',
    'inno_gmail_log','inno_gdrive_log','projects','quotes','task_queue'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins manage %I" ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY "Admins manage %I" ON public.%I FOR ALL TO authenticated USING (public.is_admin(public.get_current_user_email())) WITH CHECK (public.is_admin(public.get_current_user_email()))',
      t, t
    );
  END LOOP;
END $$;

-- 2. Remove insecure anonymous SELECT/UPDATE on chat_sessions
DROP POLICY IF EXISTS "Anonymous users read own session" ON public.chat_sessions;
DROP POLICY IF EXISTS "Anonymous users update own session" ON public.chat_sessions;

-- 3. Remove broad "Anyone logged in" policies on documents bucket
DROP POLICY IF EXISTS "Anyone logged in can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone logged in can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone logged in can delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone logged in can upload to documents" ON storage.objects;

-- 4. Lock down SECURITY DEFINER helper functions: only service_role may EXECUTE directly.
--    RLS policies that reference them still work because policies run as the policy owner.
DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'public.is_super_admin(text)',
    'public.is_admin(text)',
    'public.get_current_user_role()',
    'public.get_current_user_email()',
    'public.check_rate_limit(text,integer,integer)',
    'public.create_session_token(jsonb,uuid)',
    'public.get_session_data(text)',
    'public.encrypt_pii(text)',
    'public.process_uploaded_asset(uuid,text,text,text)',
    'public.log_security_event(text,text,text,jsonb)',
    'public.cleanup_expired_tokens()',
    'public.cleanup_old_anonymous_sessions()',
    'public.cleanup_anonymous_sessions_enhanced()',
    'public.check_anonymous_session_rate_limit()'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn);
  END LOOP;
END $$;

-- 5. Add fixed search_path to legacy trigger functions
CREATE OR REPLACE FUNCTION public.set_projects_retention_date()
 RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $function$
BEGIN
  NEW.data_retention_date := (NEW.created_at AT TIME ZONE 'UTC')::date + interval '7 years';
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_quotes_retention_date()
 RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $function$
BEGIN
  NEW.data_retention_date := (NEW.created_at AT TIME ZONE 'UTC')::date + interval '7 years';
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
