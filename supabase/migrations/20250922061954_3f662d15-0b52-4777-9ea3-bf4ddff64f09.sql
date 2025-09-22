-- Fix chat_sessions security vulnerability by tightening RLS policies

-- Drop the potentially vulnerable anonymous sessions policy
DROP POLICY IF EXISTS "Anonymous sessions secure access" ON public.chat_sessions;

-- Create a more secure policy for anonymous session access that strictly limits data exposure
CREATE POLICY "Secure anonymous session access" 
ON public.chat_sessions 
FOR SELECT 
USING (
  -- Only allow access to anonymous sessions with strict PII protection
  user_id IS NULL 
  AND session_id IS NOT NULL 
  AND created_at > (now() - '01:00:00'::interval)
  -- Ensure NO personal information is accessible in anonymous sessions
  AND name IS NULL 
  AND email IS NULL 
  AND phone IS NULL 
  AND company IS NULL 
  AND job_title IS NULL
  AND hubspot_contact_id IS NULL
  AND hubspot_deal_id IS NULL
  AND hubspot_ticket_id IS NULL
);

-- Ensure the PII validation trigger is working properly
-- This trigger should already exist but let's make sure it's active
CREATE OR REPLACE FUNCTION public.validate_anonymous_session_pii()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is an anonymous session (user_id IS NULL), ensure no PII is stored
  IF NEW.user_id IS NULL THEN
    -- Clear any PII fields that might have been set
    NEW.name := NULL;
    NEW.email := NULL;
    NEW.phone := NULL;
    NEW.company := NULL;
    NEW.job_title := NULL;
    -- Also clear HubSpot IDs for anonymous sessions
    NEW.hubspot_contact_id := NULL;
    NEW.hubspot_deal_id := NULL;
    NEW.hubspot_ticket_id := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS validate_anonymous_pii ON public.chat_sessions;
CREATE TRIGGER validate_anonymous_pii
  BEFORE INSERT OR UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_anonymous_session_pii();

-- Add an additional policy to ensure authenticated users can only see their own sessions
-- This should already exist but let's make it more explicit
DROP POLICY IF EXISTS "Users can manage their own chat sessions" ON public.chat_sessions;
CREATE POLICY "Authenticated users manage own sessions" 
ON public.chat_sessions 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Ensure system can create anonymous sessions securely
DROP POLICY IF EXISTS "System can create anonymous sessions" ON public.chat_sessions;
CREATE POLICY "Secure anonymous session creation" 
ON public.chat_sessions 
FOR INSERT 
WITH CHECK (
  user_id IS NULL 
  AND session_id IS NOT NULL
  -- Ensure no PII can be inserted in anonymous sessions
  AND name IS NULL 
  AND email IS NULL 
  AND phone IS NULL 
  AND company IS NULL 
  AND job_title IS NULL
  AND hubspot_contact_id IS NULL
  AND hubspot_deal_id IS NULL
  AND hubspot_ticket_id IS NULL
);

-- Log this security fix
SELECT public.log_security_event(
  'chat_sessions_security_fix',
  'chat_sessions',
  NULL,
  jsonb_build_object(
    'action', 'tightened_rls_policies',
    'fixed_vulnerability', 'EXPOSED_CHAT_SESSIONS',
    'timestamp', now()::text
  )
);