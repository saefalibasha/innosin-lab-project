-- Drop the trigger that clears PII for anonymous sessions since we need to allow contact forms
DROP TRIGGER IF EXISTS validate_anonymous_pii ON chat_sessions;

-- Update the function to allow PII for contact form submissions
-- Instead of clearing PII, we'll just ensure the data is valid
CREATE OR REPLACE FUNCTION public.validate_anonymous_session_pii()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- For anonymous sessions, just ensure session_id is present
  -- We now allow PII for contact form submissions
  IF NEW.user_id IS NULL AND NEW.session_id IS NULL THEN
    RAISE EXCEPTION 'Anonymous sessions must have a session_id';
  END IF;
  
  RETURN NEW;
END;
$function$;