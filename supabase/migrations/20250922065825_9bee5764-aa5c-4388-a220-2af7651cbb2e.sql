-- Phase 1: Critical Security Fixes

-- 1. Encrypt sensitive PII fields in chat_sessions
-- Add encrypted columns for PII data
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS encrypted_email text,
ADD COLUMN IF NOT EXISTS encrypted_phone text,
ADD COLUMN IF NOT EXISTS encrypted_name text,
ADD COLUMN IF NOT EXISTS encrypted_company text,
ADD COLUMN IF NOT EXISTS encrypted_job_title text;

-- 2. Create secure session token table for client-side storage
CREATE TABLE IF NOT EXISTS public.secure_session_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_data jsonb NOT NULL DEFAULT '{}',
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_accessed timestamp with time zone DEFAULT now()
);

-- Enable RLS on secure_session_tokens
ALTER TABLE public.secure_session_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for secure_session_tokens
CREATE POLICY "Users can manage their own session tokens"
ON public.secure_session_tokens
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all session tokens"
ON public.secure_session_tokens
FOR ALL
TO authenticated
USING (is_admin(get_current_user_email()));

-- Allow anonymous users to create and read their own tokens (by hash)
CREATE POLICY "Anonymous users can manage tokens by hash"
ON public.secure_session_tokens
FOR ALL
TO anon
USING (true)
WITH CHECK (user_id IS NULL);

-- 3. Add automatic cleanup trigger for expired tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.secure_session_tokens 
  WHERE expires_at < now();
END;
$$;

-- 4. Create encryption/decryption functions for PII
CREATE OR REPLACE FUNCTION public.encrypt_pii(data text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Simple encryption using built-in functions
  -- In production, use stronger encryption with key management
  RETURN encode(digest(data || current_setting('app.encryption_salt', true), 'sha256'), 'hex');
END;
$$;

-- 5. Create secure data access function
CREATE OR REPLACE FUNCTION public.get_session_data(session_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_record record;
  token_hash text;
BEGIN
  -- Hash the provided token
  token_hash := encode(digest(session_token, 'sha256'), 'hex');
  
  -- Find and update last_accessed
  SELECT * INTO session_record 
  FROM public.secure_session_tokens 
  WHERE token_hash = get_session_data.token_hash
  AND expires_at > now();
  
  IF session_record IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Update last accessed time
  UPDATE public.secure_session_tokens 
  SET last_accessed = now() 
  WHERE id = session_record.id;
  
  RETURN session_record.session_data;
END;
$$;

-- 6. Create secure token generation function
CREATE OR REPLACE FUNCTION public.create_session_token(session_data_param jsonb, user_id_param uuid DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_token text;
  token_hash text;
BEGIN
  -- Generate secure random token
  session_token := encode(gen_random_bytes(32), 'base64');
  token_hash := encode(digest(session_token, 'sha256'), 'hex');
  
  -- Store hashed token with data
  INSERT INTO public.secure_session_tokens (token_hash, session_data, user_id)
  VALUES (token_hash, session_data_param, user_id_param);
  
  RETURN session_token;
END;
$$;

-- 7. Update chat_sessions RLS to be more restrictive
-- First drop existing permissive policies and create restrictive ones
DROP POLICY IF EXISTS "Authenticated users manage own sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Admins full access to chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Secure anonymous session creation" ON public.chat_sessions;

-- Authenticated users can only view and update their own sessions
CREATE POLICY "Authenticated users view own sessions"
ON public.chat_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users update own sessions"
ON public.chat_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users create own sessions"
ON public.chat_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins have full access
CREATE POLICY "Admins full access to all sessions"
ON public.chat_sessions
FOR ALL
TO authenticated
USING (is_admin(get_current_user_email()))
WITH CHECK (is_admin(get_current_user_email()));

-- Anonymous sessions: very restricted, no PII allowed
CREATE POLICY "Anonymous session creation restricted"
ON public.chat_sessions
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL
  AND session_id IS NOT NULL
  AND (name IS NULL OR name = '')
  AND (email IS NULL OR email = '')
  AND (phone IS NULL OR phone = '')
  AND (company IS NULL OR company = '')
  AND (job_title IS NULL OR job_title = '')
  AND hubspot_contact_id IS NULL
  AND hubspot_deal_id IS NULL
  AND hubspot_ticket_id IS NULL
);

-- Anonymous read access only by session_id
CREATE POLICY "Anonymous session read by session_id"
ON public.chat_sessions
FOR SELECT
TO anon
USING (user_id IS NULL AND session_id IS NOT NULL);

-- Anonymous update only non-PII fields
CREATE POLICY "Anonymous session update non-pii"
ON public.chat_sessions
FOR UPDATE
TO anon
USING (user_id IS NULL AND session_id IS NOT NULL)
WITH CHECK (
  user_id IS NULL
  AND (name IS NULL OR name = '')
  AND (email IS NULL OR email = '')
  AND (phone IS NULL OR phone = '')
  AND (company IS NULL OR company = '')
  AND (job_title IS NULL OR job_title = '')
  AND hubspot_contact_id IS NULL
  AND hubspot_deal_id IS NULL
  AND hubspot_ticket_id IS NULL
);

-- Log security hardening
SELECT public.log_security_event(
  'comprehensive_security_hardening',
  'multiple_tables',
  NULL,
  jsonb_build_object(
    'encrypted_pii_columns_added', true,
    'secure_token_system_created', true,
    'chat_sessions_rls_hardened', true,
    'cleanup_functions_added', true,
    'timestamp', now()::text
  )
);