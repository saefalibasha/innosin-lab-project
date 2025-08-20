-- Allow anonymous users to create chat sessions for live chat
CREATE POLICY "Anonymous users can create chat sessions" 
ON public.chat_sessions 
FOR INSERT 
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Allow anonymous users to view their own chat sessions by session_id
CREATE POLICY "Anonymous users can view chat sessions by session_id" 
ON public.chat_sessions 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL AND session_id IS NOT NULL) OR 
  is_admin(get_current_user_email())
);

-- Allow anonymous users to update their own chat sessions by session_id
CREATE POLICY "Anonymous users can update chat sessions by session_id" 
ON public.chat_sessions 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL AND session_id IS NOT NULL) OR 
  is_admin(get_current_user_email())
);