
-- Add new tables for enhanced training and analytics
CREATE TABLE public.training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT,
  performance_metrics JSONB DEFAULT '{}'::jsonb
);

-- Enhanced training data with better structure
CREATE TABLE public.training_data_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  intent TEXT NOT NULL,
  example_inputs TEXT[] NOT NULL,
  response_template TEXT NOT NULL,
  context_requirements JSONB DEFAULT '{}'::jsonb,
  confidence_threshold NUMERIC DEFAULT 0.8,
  category TEXT,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  performance_score NUMERIC DEFAULT 0.0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Conversation flows for multi-turn interactions
CREATE TABLE public.conversation_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  flow_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Knowledge base analytics
CREATE TABLE public.knowledge_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES public.knowledge_base_entries(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Training performance tracking
CREATE TABLE public.training_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES public.training_data_entries(id) ON DELETE CASCADE,
  test_input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  actual_output TEXT,
  confidence_score NUMERIC,
  success_rate NUMERIC,
  tested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add indexes for performance
CREATE INDEX idx_knowledge_analytics_entry_id ON public.knowledge_analytics(entry_id);
CREATE INDEX idx_knowledge_analytics_metric_type ON public.knowledge_analytics(metric_type);
CREATE INDEX idx_training_performance_session_id ON public.training_performance(session_id);
CREATE INDEX idx_training_data_entries_session_id ON public.training_data_entries(session_id);
CREATE INDEX idx_training_data_entries_intent ON public.training_data_entries(intent);

-- Enable RLS
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_data_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_performance ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin access
CREATE POLICY "Admins can manage training sessions" ON public.training_sessions FOR ALL USING (is_admin(get_current_user_email()));
CREATE POLICY "Admins can manage training data entries" ON public.training_data_entries FOR ALL USING (is_admin(get_current_user_email()));
CREATE POLICY "Admins can manage conversation flows" ON public.conversation_flows FOR ALL USING (is_admin(get_current_user_email()));
CREATE POLICY "Admins can access knowledge analytics" ON public.knowledge_analytics FOR ALL USING (is_admin(get_current_user_email()));
CREATE POLICY "Admins can access training performance" ON public.training_performance FOR ALL USING (is_admin(get_current_user_email()));

-- Add updated_at trigger for new tables
CREATE TRIGGER update_training_sessions_updated_at
  BEFORE UPDATE ON public.training_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_data_entries_updated_at
  BEFORE UPDATE ON public.training_data_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversation_flows_updated_at
  BEFORE UPDATE ON public.conversation_flows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enhanced knowledge base entries with version history
ALTER TABLE public.knowledge_base_entries 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS effectiveness_score NUMERIC DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS content_hash TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Knowledge base version history
CREATE TABLE public.knowledge_base_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES public.knowledge_base_entries(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  previous_data JSONB NOT NULL,
  changed_by TEXT,
  change_type TEXT NOT NULL,
  change_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.knowledge_base_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can access knowledge history" ON public.knowledge_base_history FOR ALL USING (is_admin(get_current_user_email()));
