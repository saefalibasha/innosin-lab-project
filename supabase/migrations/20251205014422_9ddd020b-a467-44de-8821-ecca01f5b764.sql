-- Fix Security Definer View issue by recreating with SECURITY INVOKER
-- Drop the existing view
DROP VIEW IF EXISTS public.chat_sessions_public;

-- Recreate with explicit SECURITY INVOKER (safer - uses querying user's permissions)
CREATE VIEW public.chat_sessions_public 
WITH (security_invoker = true)
AS
SELECT 
    id,
    session_id,
    start_time,
    last_activity,
    status,
    context
FROM chat_sessions
WHERE 
    user_id IS NULL 
    AND (name IS NULL OR name = '')
    AND (email IS NULL OR email = '')
    AND (phone IS NULL OR phone = '')
    AND (company IS NULL OR company = '')
    AND (job_title IS NULL OR job_title = '')
    AND hubspot_contact_id IS NULL
    AND hubspot_deal_id IS NULL
    AND hubspot_ticket_id IS NULL;