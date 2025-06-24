
-- Create tables for chat sessions and HubSpot integration
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users,
  email TEXT,
  name TEXT,
  company TEXT,
  job_title TEXT,
  phone TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'waiting', 'closed', 'transferred')),
  assigned_agent TEXT,
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  hubspot_contact_id TEXT,
  hubspot_deal_id TEXT,
  hubspot_ticket_id TEXT,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for chat messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot', 'agent')),
  confidence DECIMAL(3,2),
  is_typing BOOLEAN DEFAULT false,
  hubspot_synced BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for HubSpot integration logs
CREATE TABLE public.hubspot_integration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id),
  action TEXT NOT NULL,
  hubspot_object_type TEXT,
  hubspot_object_id TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  request_data JSONB,
  response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for chatbot training data
CREATE TABLE public.chatbot_training_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  intent TEXT NOT NULL,
  example_input TEXT NOT NULL,
  expected_response TEXT NOT NULL,
  category TEXT,
  confidence_threshold DECIMAL(3,2) DEFAULT 0.8,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for chat_sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat sessions" 
  ON public.chat_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create chat sessions" 
  ON public.chat_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own chat sessions" 
  ON public.chat_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Add RLS policies for chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their sessions" 
  ON public.chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND (chat_sessions.user_id = auth.uid() OR chat_sessions.user_id IS NULL)
    )
  );

CREATE POLICY "Users can create messages in their sessions" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND (chat_sessions.user_id = auth.uid() OR chat_sessions.user_id IS NULL)
    )
  );

-- Add RLS policies for hubspot_integration_logs (admin only for now)
ALTER TABLE public.hubspot_integration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to hubspot logs" 
  ON public.hubspot_integration_logs 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow insert access to hubspot logs" 
  ON public.hubspot_integration_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Add RLS policies for chatbot_training_data (admin only for now)
ALTER TABLE public.chatbot_training_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to training data" 
  ON public.chatbot_training_data 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow full access to training data" 
  ON public.chatbot_training_data 
  FOR ALL 
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_chat_sessions_session_id ON public.chat_sessions(session_id);
CREATE INDEX idx_chat_sessions_status ON public.chat_sessions(status);
CREATE INDEX idx_chat_sessions_start_time ON public.chat_sessions(start_time);
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_hubspot_logs_session_id ON public.hubspot_integration_logs(session_id);
CREATE INDEX idx_training_data_intent ON public.chatbot_training_data(intent);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_chat_sessions_updated_at 
    BEFORE UPDATE ON public.chat_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_data_updated_at 
    BEFORE UPDATE ON public.chatbot_training_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
