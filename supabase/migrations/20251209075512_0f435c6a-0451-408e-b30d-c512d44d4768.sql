-- Drop the old constraint
ALTER TABLE chat_sessions 
DROP CONSTRAINT IF EXISTS chat_sessions_status_check;

-- Add new constraint with all required status values
ALTER TABLE chat_sessions 
ADD CONSTRAINT chat_sessions_status_check 
CHECK (status = ANY (ARRAY[
  'active', 
  'waiting', 
  'closed', 
  'transferred',
  'contact_form_submitted',
  'rfq_submitted',
  'floor_plan_sent',
  'inquiry_submitted',
  'maintenance_request'
]));