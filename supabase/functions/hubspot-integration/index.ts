
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

async function findHubSpotContactByEmail(email: string): Promise<any> {
  const response = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hubspotApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: email
        }]
      }],
      properties: ['id', 'email', 'firstname', 'lastname']
    }),
  });

  if (!response.ok) {
    console.error('HubSpot Search API error:', response.status, await response.text());
    return null;
  }

  const result = await response.json();
  return result.results.length > 0 ? result.results[0] : null;
}

async function createHubSpotContact(contactData: HubSpotContact): Promise<any> {
  // First check if contact already exists
  const existingContact = await findHubSpotContactByEmail(contactData.email);
  if (existingContact) {
    console.log('Contact already exists:', existingContact.id);
    return existingContact;
  }

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
    const errorText = await response.text();
    console.error('HubSpot Contact API error:', response.status, errorText);
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
    const errorText = await response.text();
    console.error('HubSpot Deal API error:', response.status, errorText);
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
    const errorText = await response.text();
    console.error('HubSpot Ticket API error:', response.status, errorText);
    throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function createHubSpotEngagement(contactId: string, engagementData: any): Promise<any> {
  const response = await fetch('https://api.hubapi.com/crm/v3/objects/communications', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hubspotApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        hs_communication_channel_type: 'CUSTOM_CHANNEL_CONVERSATION',
        hs_communication_logged_from: 'CRM',
        hs_communication_body: engagementData.body,
        hs_timestamp: engagementData.timestamp
      },
      associations: [{
        to: { id: contactId },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 199 }]
      }]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('HubSpot Engagement API error:', response.status, errorText);
    throw new Error(`HubSpot Engagement API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function logIntegrationAction(sessionId: string, action: string, objectType: string, objectId: string, success: boolean, error?: string, requestData?: any, responseData?: any) {
  try {
    // Get the session's database ID first
    const { data: sessionData } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    const sessionUuid = sessionData?.id;
    
    const { error: logError } = await supabase.from('hubspot_integration_logs').insert({
      session_id: sessionUuid,
      action,
      hubspot_object_type: objectType,
      hubspot_object_id: objectId,
      success,
      error_message: error,
      request_data: requestData,
      response_data: responseData
    });

    if (logError) {
      console.error('Error inserting integration log:', logError);
    } else {
      console.log('Integration log saved:', { sessionId, action, success });
    }
  } catch (logError) {
    console.error('Error saving integration log:', logError);
  }
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
          console.log('HubSpot contact processed:', hubspotContact.id);
          
          // Update chat session with HubSpot contact ID
          const { error: updateError } = await supabase
            .from('chat_sessions')
            .update({ hubspot_contact_id: hubspotContact.id })
            .eq('session_id', sessionId);

          if (updateError) {
            console.error('Error updating session with contact ID:', updateError);
          }

          await logIntegrationAction(sessionId, 'create_contact', 'contact', hubspotContact.id, true, undefined, contactData, hubspotContact);

          return new Response(JSON.stringify({ success: true, contactId: hubspotContact.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Error creating/finding HubSpot contact:', error);
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
          const { error: updateError } = await supabase
            .from('chat_sessions')
            .update({ hubspot_deal_id: hubspotDeal.id })
            .eq('session_id', sessionId);

          if (updateError) {
            console.error('Error updating session with deal ID:', updateError);
          }

          await logIntegrationAction(sessionId, 'create_deal', 'deal', hubspotDeal.id, true, undefined, dealData, hubspotDeal);

          return new Response(JSON.stringify({ success: true, dealId: hubspotDeal.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Error creating HubSpot deal:', error);
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
          const { error: updateError } = await supabase
            .from('chat_sessions')
            .update({ hubspot_ticket_id: hubspotTicket.id })
            .eq('session_id', sessionId);

          if (updateError) {
            console.error('Error updating session with ticket ID:', updateError);
          }

          await logIntegrationAction(sessionId, 'create_ticket', 'ticket', hubspotTicket.id, true, undefined, ticketData, hubspotTicket);

          return new Response(JSON.stringify({ success: true, ticketId: hubspotTicket.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Error creating HubSpot ticket:', error);
          await logIntegrationAction(sessionId, 'create_ticket', 'ticket', '', false, error.message, ticketData);
          throw error;
        }
      }

      case 'sync_conversation': {
        const { sessionId, contactId } = data;
        console.log('Syncing conversation for session:', sessionId, 'contact:', contactId);
        
        try {
          // Get all messages for this session using the session_id string
          const { data: sessionData, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('id')
            .eq('session_id', sessionId)
            .single();

          if (sessionError || !sessionData) {
            console.error('Session lookup error:', sessionError);
            throw new Error('Session not found');
          }

          const { data: messages, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionData.id)
            .order('created_at', { ascending: true });

          if (messagesError) {
            console.error('Messages lookup error:', messagesError);
            throw new Error('Failed to retrieve messages');
          }

          console.log('Messages found for sync:', messages?.length || 0);

          if (messages && messages.length > 0) {
            const conversationSummary = messages.map(msg => 
              `${msg.sender.toUpperCase()}: ${msg.message}`
            ).join('\n\n');

            const engagementData = {
              body: `Chat Conversation Summary:\n\n${conversationSummary}`,
              timestamp: new Date().toISOString()
            };

            console.log('Creating HubSpot engagement with data:', engagementData);
            const engagementResult = await createHubSpotEngagement(contactId, engagementData);
            console.log('HubSpot engagement created:', engagementResult.id);

            // Mark messages as synced
            const { error: syncError } = await supabase
              .from('chat_messages')
              .update({ hubspot_synced: true })
              .eq('session_id', sessionData.id);

            if (syncError) {
              console.error('Error marking messages as synced:', syncError);
            }

            await logIntegrationAction(sessionId, 'sync_conversation', 'engagement', engagementResult.id, true, undefined, engagementData, engagementResult);
            
            console.log('Conversation sync completed successfully');
          } else {
            console.log('No messages found to sync');
          }

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Error syncing conversation:', error);
          await logIntegrationAction(sessionId, 'sync_conversation', 'engagement', contactId, false, error.message);
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
