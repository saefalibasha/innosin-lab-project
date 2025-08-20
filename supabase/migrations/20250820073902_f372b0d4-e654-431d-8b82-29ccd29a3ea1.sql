-- Add DELETE policy for chat_sessions table to allow admins to delete sessions
CREATE POLICY "Admins can delete chat sessions"
ON public.chat_sessions
FOR DELETE
USING (is_admin(get_current_user_email()));

-- Add DELETE policy for chat_messages table to allow admins to delete messages
CREATE POLICY "Admins can delete chat messages"
ON public.chat_messages
FOR DELETE
USING (is_admin(get_current_user_email()));