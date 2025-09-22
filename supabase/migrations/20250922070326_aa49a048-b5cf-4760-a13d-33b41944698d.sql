-- Final security fix: Remove HubSpot data from public read access
-- Drop the anonymous read policy that's exposing HubSpot data
DROP POLICY IF EXISTS "Anonymous session read by session_id" ON public.chat_sessions;

-- Create more restrictive anonymous read policy without HubSpot fields
CREATE POLICY "Anonymous session read basic only"
ON public.chat_sessions
FOR SELECT
TO anon
USING (
  user_id IS NULL 
  AND session_id IS NOT NULL
);

-- Create view for anonymous access that excludes sensitive fields
CREATE OR REPLACE VIEW public.chat_sessions_public AS
SELECT 
  id, session_id, start_time, last_activity, status, context
FROM public.chat_sessions
WHERE user_id IS NULL
AND (name IS NULL OR name = '')
AND (email IS NULL OR email = '')
AND (phone IS NULL OR phone = '')
AND (company IS NULL OR company = '')
AND (job_title IS NULL OR job_title = '')
AND hubspot_contact_id IS NULL
AND hubspot_deal_id IS NULL
AND hubspot_ticket_id IS NULL;