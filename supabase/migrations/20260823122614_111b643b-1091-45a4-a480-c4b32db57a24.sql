DROP POLICY IF EXISTS "Users can see their own admin status" ON public.admin_roles;
CREATE POLICY "Users can see their own admin status"
ON public.admin_roles
FOR SELECT
TO authenticated
USING (user_email = public.get_current_user_email());

DROP POLICY IF EXISTS "Super admins can manage admin roles" ON public.admin_roles;
CREATE POLICY "Super admins can manage admin roles"
ON public.admin_roles
FOR ALL
TO authenticated
USING (public.is_super_admin(public.get_current_user_email()))
WITH CHECK (public.is_super_admin(public.get_current_user_email()));

DROP POLICY IF EXISTS "Admins can manage asset uploads" ON public.asset_uploads;
CREATE POLICY "Admins can manage asset uploads"
ON public.asset_uploads
FOR ALL
TO authenticated
USING (public.is_admin(public.get_current_user_email()))
WITH CHECK (public.is_admin(public.get_current_user_email()));

DROP POLICY IF EXISTS "Block anonymous reads of asset uploads" ON public.asset_uploads;
CREATE POLICY "Block anonymous reads of asset uploads"
ON public.asset_uploads
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

DROP POLICY IF EXISTS "Users can create messages in their sessions" ON public.chat_messages;

CREATE POLICY "Authenticated users create messages in own sessions"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(public.get_current_user_email())
  OR EXISTS (
    SELECT 1 FROM public.chat_sessions cs
    WHERE cs.id = chat_messages.session_id
      AND cs.user_id = auth.uid()
  )
);

CREATE POLICY "Guests create messages in recent guest sessions"
ON public.chat_messages
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_sessions cs
    WHERE cs.id = chat_messages.session_id
      AND cs.user_id IS NULL
      AND COALESCE(cs.last_activity, cs.created_at, cs.start_time) > now() - interval '24 hours'
  )
);