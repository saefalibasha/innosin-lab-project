-- Enable realtime for chat_sessions and chat_messages tables
-- This allows the admin dashboard to receive real-time updates

-- Enable replica identity for chat_sessions to capture complete row data
ALTER TABLE public.chat_sessions REPLICA IDENTITY FULL;

-- Enable replica identity for chat_messages to capture complete row data  
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;