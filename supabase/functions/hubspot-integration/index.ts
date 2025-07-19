
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

// Enhanced error handling for HubSpot API responses
const handleHubSpotError = (response: Response, responseText: string) => {
  console.error('HubSpot API error:', response.status, responseText);
  
  if (response.status === 429) {
    throw new Error('HubSpot API rate limit exceeded. Please try again later.');
  }
  
  if (response.status === 401) {
    throw new Error('HubSpot API authentication failed. Please check your API key.');
  }
  
  if (response.status === 403) {
    throw new Error('HubSpot API access forbidden. Please check your permissions.');
  }

  // Try to parse error details from HubSpot response
  try {
    const errorData = JSON.parse(responseText);
    if (errorData.message) {
      throw new Error(`HubSpot API error: ${errorData.message}`);
    }
    if (errorData.errors && errorData.errors.length > 0) {
      throw new Error(`HubSpot API error: ${errorData.errors[0].message}`);
    }
  } catch (parseError) {
    // If we can't parse the error, use the status text
  }
  
  throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
};

async function findHubSpotContactByEmail(email: string): Promise<any> {
  try {
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

    const responseText = await response.text();

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('Rate limit hit while searching for contact, will retry...');
        throw new Error('Rate limit exceeded');
      }
      console.error('HubSpot Search API error:', response.status, responseText);
      return null;
    }

    const result = JSON.parse(responseText);
    return result.results.length > 0 ? result.results[0] : null;
  } catch (error) {
    if (error.message?.includes('Rate limit')) {
      throw error; // Re-throw rate limit errors for retry logic
    }
    console.error('Error searching for contact:', error);
    return null;
  }
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

  const responseText = await response.text();

  if (!response.ok) {
    handleHubSpotError(response, responseText);
  }

  return JSON.parse(responseText);
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

  const responseText = await response.text();

  if (!response.ok) {
    handleHubSpotError(response, responseText);
  }

  return JSON.parse(responseText);
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

  const responseText = await response.text();

  if (!response.ok) {
    handleHubSpotError(response, responseText);
  }

  return JSON.parse(responseText);
}

async function createHubSpotNote(contactId: string, noteContent: string): Promise<any> {
  const response = await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hubspotApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        hs_note_body: noteContent,
        hs_timestamp: new Date().toISOString()
      },
      associations: [{
        to: { id: contactId },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 214 }]
      }]
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    handleHubSpotError(response, responseText);
  }

  return JSON.parse(responseText);
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
          
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            isRateLimit: error.message?.includes('rate limit') || error.message?.includes('429')
          }), {
            status: error.message?.includes('rate limit') ? 429 : 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
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
          
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            isRateLimit: error.message?.includes('rate limit') || error.message?.includes('429')
          }), {
            status: error.message?.includes('rate limit') ? 429 : 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
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
          
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            isRateLimit: error.message?.includes('rate limit') || error.message?.includes('429')
          }), {
            status: error.message?.includes('rate limit') ? 429 : 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
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

            const noteContent = `Chat Conversation Summary (Session: ${sessionId}):\n\n${conversationSummary}`;

            console.log('Creating HubSpot note with data:', { contactId, noteContent: noteContent.substring(0, 200) + '...' });
            const noteResult = await createHubSpotNote(contactId, noteContent);
            console.log('HubSpot note created:', noteResult.id);

            // Mark messages as synced
            const { error: syncError } = await supabase
              .from('chat_messages')
              .update({ hubspot_synced: true })
              .eq('session_id', sessionData.id);

            if (syncError) {
              console.error('Error marking messages as synced:', syncError);
            }

            await logIntegrationAction(sessionId, 'sync_conversation', 'note', noteResult.id, true, undefined, { noteContent }, noteResult);
            
            console.log('Conversation sync completed successfully');
          } else {
            console.log('No messages found to sync');
          }

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Error syncing conversation:', error);
          await logIntegrationAction(sessionId, 'sync_conversation', 'note', contactId, false, error.message);
          
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            isRateLimit: error.message?.includes('rate limit') || error.message?.includes('429')
          }), {
            status: error.message?.includes('rate limit') ? 429 : 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
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
    return new Response(JSON.stringify({ 
      error: error.message,
      isRateLimit: error.message?.includes('rate limit') || error.message?.includes('429')
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
