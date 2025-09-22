-- Enable realtime for hubspot_integration_logs table to support dashboard real-time updates
-- This allows the admin dashboard to receive real-time updates when HubSpot integration activity occurs

-- Enable replica identity for hubspot_integration_logs to capture complete row data
ALTER TABLE public.hubspot_integration_logs REPLICA IDENTITY FULL;

-- Add hubspot_integration_logs table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.hubspot_integration_logs;