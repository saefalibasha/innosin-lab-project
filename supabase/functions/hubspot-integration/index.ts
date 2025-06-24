
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const hubspotApiKey = Deno.env.get('HUBSPOT_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface HubSpotContact {
  email: string;
  firstname?: string;
  lastname?: string;
  company?: string;
  jobtitle?: string;
  phone?: string;
}

interface HubSpotDeal {
  dealname: string;
  pipeline: string;
  dealstage: string;
  amount?: string;
  hubspot_owner_id?: string;
}

interface HubSpotTicket {
  subject: string;
  content: string;
  hs_pipeline: string;
  hs_pipeline_stage: string;
  hs_ticket_priority: string;
}

async function createHubSpotContact(contactData: HubSpotContact): Promise<any> {
  const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hubspotApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: contactData
    }),
  });

  if (!response.ok) {
    throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function createHubSpotDeal(dealData: HubSpotDeal, contactId?: string): Promise<any> {
  const response = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hubspotApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: dealData,
      associations: contactId ? [{
        to: { id: contactId },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }]
      }] : []
    }),
  });

  if (!response.ok) {
    throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function createHubSpotTicket(ticketData: HubSpotTicket, contactId?: string): Promise<any> {
  const response = await fetch('https://api.hubapi.com/crm/v3/objects/tickets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hubspotApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: ticketData,
      associations: contactId ? [{
        to: { id: contactId },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 16 }]
      }] : []
    }),
  });

  if (!response.ok) {
    throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function logToHubSpotTimeline(contactId: string, activityData: any): Promise<any> {
  const response = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}/timeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hubspotApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(activityData),
  });

  if (!response.ok) {
    throw new Error(`HubSpot Timeline API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function logIntegrationAction(sessionId: string, action: string, objectType: string, objectId: string, success: boolean, error?: string, requestData?: any, responseData?: any) {
  await supabase.from('hubspot_integration_logs').insert({
    session_id: sessionId,
    action,
    hubspot_object_type: objectType,
    hubspot_object_id: objectId,
    success,
    error_message: error,
    request_data: requestData,
    response_data: responseData
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    console.log('HubSpot Integration action:', action, data);

    switch (action) {
      case 'create_contact': {
        const { sessionId, email, name, company, jobTitle, phone } = data;
        
        const contactData: HubSpotContact = {
          email,
          firstname: name?.split(' ')[0],
          lastname: name?.split(' ').slice(1).join(' '),
          company,
          jobtitle: jobTitle,
          phone
        };

        try {
          const hubspotContact = await createHubSpotContact(contactData);
          
          // Update chat session with HubSpot contact ID
          await supabase
            .from('chat_sessions')
            .update({ hubspot_contact_id: hubspotContact.id })
            .eq('id', sessionId);

          await logIntegrationAction(sessionId, 'create_contact', 'contact', hubspotContact.id, true, undefined, contactData, hubspotContact);

          return new Response(JSON.stringify({ success: true, contactId: hubspotContact.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          await logIntegrationAction(sessionId, 'create_contact', 'contact', '', false, error.message, contactData);
          throw error;
        }
      }

      case 'create_deal': {
        const { sessionId, dealName, contactId, amount } = data;
        
        const dealData: HubSpotDeal = {
          dealname: dealName,
          pipeline: 'default',
          dealstage: 'appointmentscheduled',
          amount: amount?.toString()
        };

        try {
          const hubspotDeal = await createHubSpotDeal(dealData, contactId);
          
          // Update chat session with HubSpot deal ID
          await supabase
            .from('chat_sessions')
            .update({ hubspot_deal_id: hubspotDeal.id })
            .eq('id', sessionId);

          await logIntegrationAction(sessionId, 'create_deal', 'deal', hubspotDeal.id, true, undefined, dealData, hubspotDeal);

          return new Response(JSON.stringify({ success: true, dealId: hubspotDeal.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          await logIntegrationAction(sessionId, 'create_deal', 'deal', '', false, error.message, dealData);
          throw error;
        }
      }

      case 'create_ticket': {
        const { sessionId, subject, content, contactId, priority = 'MEDIUM' } = data;
        
        const ticketData: HubSpotTicket = {
          subject,
          content,
          hs_pipeline: 'support_pipeline',
          hs_pipeline_stage: 'open',
          hs_ticket_priority: priority
        };

        try {
          const hubspotTicket = await createHubSpotTicket(ticketData, contactId);
          
          // Update chat session with HubSpot ticket ID
          await supabase
            .from('chat_sessions')
            .update({ hubspot_ticket_id: hubspotTicket.id })
            .eq('id', sessionId);

          await logIntegrationAction(sessionId, 'create_ticket', 'ticket', hubspotTicket.id, true, undefined, ticketData, hubspotTicket);

          return new Response(JSON.stringify({ success: true, ticketId: hubspotTicket.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          await logIntegrationAction(sessionId, 'create_ticket', 'ticket', '', false, error.message, ticketData);
          throw error;
        }
      }

      case 'sync_conversation': {
        const { sessionId, contactId } = data;
        
        try {
          // Get all messages for this session
          const { data: messages } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

          if (messages && messages.length > 0) {
            const conversationSummary = messages.map(msg => 
              `${msg.sender.toUpperCase()}: ${msg.message}`
            ).join('\n');

            const timelineData = {
              eventType: 'CONVERSATION',
              eventDate: new Date().toISOString(),
              properties: {
                conversationSummary,
                totalMessages: messages.length,
                sessionId
              }
            };

            await logToHubSpotTimeline(contactId, timelineData);

            // Mark messages as synced
            await supabase
              .from('chat_messages')
              .update({ hubspot_synced: true })
              .eq('session_id', sessionId);

            await logIntegrationAction(sessionId, 'sync_conversation', 'timeline', contactId, true, undefined, timelineData);
          }

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          await logIntegrationAction(sessionId, 'sync_conversation', 'timeline', contactId, false, error.message);
          throw error;
        }
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('HubSpot Integration error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
