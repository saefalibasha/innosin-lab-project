-- Restore Data API access on every public table (project is missing default grants project-wide).
DO $$
DECLARE
    tbl record;
    has_priv boolean;
BEGIN
    FOR tbl IN
        SELECT c.relname AS table_name
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE c.relkind = 'r' AND n.nspname = 'public'
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.role_table_grants
             WHERE grantee = 'authenticated' AND table_schema = 'public' AND table_name = tbl.table_name
               AND privilege_type IN ('SELECT','INSERT','UPDATE','DELETE')
        ) INTO has_priv;
        IF NOT has_priv THEN
            EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', tbl.table_name);
        END IF;

        SELECT EXISTS (
            SELECT 1 FROM information_schema.role_table_grants
             WHERE grantee = 'service_role' AND table_schema = 'public' AND table_name = tbl.table_name
               AND privilege_type IN ('SELECT','INSERT','UPDATE','DELETE')
        ) INTO has_priv;
        IF NOT has_priv THEN
            EXECUTE format('GRANT ALL ON public.%I TO service_role', tbl.table_name);
        END IF;
    END LOOP;
END;
$$;

-- Public-readable catalog/marketing content shown to anonymous visitors
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.shop_look_content TO anon;
GRANT SELECT ON public.shop_look_hotspots TO anon;
GRANT SELECT ON public.chatbot_training_data TO anon;
GRANT SELECT ON public.conversation_flows TO anon;
GRANT SELECT ON public.knowledge_base_entries TO anon;

-- Anonymous contact / chat submissions need INSERT (RLS policies still gate the rows)
GRANT INSERT ON public.chat_sessions TO anon;
GRANT INSERT ON public.chat_messages TO anon;
GRANT INSERT ON public.rate_limit_log TO anon;
GRANT INSERT ON public.security_audit_log TO anon;