import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;
const hubspotApiKey = Deno.env.get('HUBSPOT_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Input validation constants
const MAX_MESSAGE_LENGTH = 5000;
const MAX_SESSION_ID_LENGTH = 100;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Validate and sanitize input
function validateInput(message: unknown, sessionId: unknown): { 
  valid: boolean; 
  error?: string; 
  sanitizedMessage?: string; 
  sanitizedSessionId?: string 
} {
  // Validate message
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required and must be a string' };
  }
  
  if (message.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` };
  }
  
  // Validate sessionId
  if (!sessionId || typeof sessionId !== 'string') {
    return { valid: false, error: 'Session ID is required and must be a string' };
  }
  
  if (sessionId.length > MAX_SESSION_ID_LENGTH) {
    return { valid: false, error: 'Invalid session ID format' };
  }
  
  // UUID format validation for sessionId
  if (!UUID_REGEX.test(sessionId)) {
    return { valid: false, error: 'Session ID must be a valid UUID' };
  }
  
  // Sanitize message - remove potential XSS vectors
  const sanitizedMessage = message
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
  
  return { 
    valid: true, 
    sanitizedMessage, 
    sanitizedSessionId: sessionId.trim() 
  };
}
// Specific response mappings for common queries
const specificResponses: Record<string, {
  triggers: string[];
  response: string;
  createTicket: boolean;
  ticketType?: string;
  ticketPriority?: string;
}> = {
  eyewash: {
    triggers: ['eyewash', 'eye wash', 'bl-hes', 'bl-ebs', 'emergency eye', 'eye station'],
    response: `Our emergency eyewash stations include:

**Bench-Mounted Models:**
• BL-HES-BENCH-001 - Compact bench-mounted unit
• BL-HES-BENCH-002 - Extended reach model

**Wall-Mounted Models:**
• BL-HES-WALL-001 - Standard wall-mounted unit
• BL-HES-WALL-002 - ADA compliant model

**Recessed Models:**
• BL-EBS-RECESSED-001 - Flush-mount recessed unit
• BL-EBS-RECESSED-002 - Cabinet-style recessed unit

All units meet **ANSI Z358.1** standards with 15 minutes continuous flow at 0.4 GPM minimum. Features include:
- Dust covers for hygiene
- Push-paddle activation
- Stay-open valves
- Flow control

Would you like detailed specifications, installation requirements, or pricing for any specific model?`,
    createTicket: false
  },
  safetyShower: {
    triggers: ['safety shower', 'emergency shower', 'decontamination shower', 'bl-bs', 'shower station'],
    response: `Our safety shower systems provide full-body emergency decontamination:

**Wall-Mounted:**
• BL-BS-WALL-001 - Standard wall shower
• BL-BS-WALL-002 - With eyewash combination

**Ceiling-Mounted:**
• BL-BS-CEIL-001 - Recessed ceiling model
• BL-BS-CEIL-002 - Surface-mounted ceiling model

**Combination Units:**
• BL-BS-COMBO-001 - Shower + eyewash station
• BL-BS-COMBO-002 - Shower + eyewash + foot wash

All systems are **ANSI Z358.1 compliant** with:
- Minimum 20 GPM flow rate
- Thermostatic mixing valves available
- Corrosion-resistant construction
- High-visibility signage included

Would you like specifications, pricing, or installation information?`,
    createTicket: false
  },
  fumeCupboard: {
    triggers: ['fume cupboard', 'fume hood', 'fume cabinet', 'chemical hood', 'extraction hood', 'ventilation hood'],
    response: `Our fume cupboards offer superior containment and efficiency:

**Standard Fume Cupboards:**
• 4-foot, 5-foot, 6-foot, and 8-foot widths
• Ducted and ductless options
• Constant and variable air volume (VAV)

**Specialty Models:**
• Perchloric acid fume hoods
• Radioisotope fume hoods
• Walk-in fume cupboards
• Distillation fume cupboards

**Key Features:**
- ASHRAE 110 tested and certified
- Digital airflow monitors
- LED lighting
- Chemical-resistant liners
- Sash position alarms

All units feature advanced safety monitoring and energy-efficient designs. What type of laboratory work will you be conducting?`,
    createTicket: false
  },
  labFurniture: {
    triggers: ['lab furniture', 'laboratory furniture', 'lab bench', 'work bench', 'lab table', 'storage cabinet', 'lab cabinet'],
    response: `Our laboratory furniture solutions include:

**Workbenches:**
• Steel frame modular benches
• Wood casework systems
• Mobile workstations
• Height-adjustable benches

**Storage Solutions:**
• Acid storage cabinets
• Flammable storage cabinets
• Base cabinets with drawers
• Overhead storage units
• Mobile storage carts

**Specialty Furniture:**
• Fume hood base cabinets
• Sink units and pegboards
• Computer workstations
• Balance tables (vibration-free)

All furniture features chemical-resistant surfaces and meets laboratory safety standards. Are you planning a new lab or upgrading existing facilities?`,
    createTicket: false
  },
  quote: {
    triggers: ['quote', 'price', 'pricing', 'cost', 'how much', 'purchase', 'buy', 'order', 'budget'],
    response: `I'd be happy to help you get a detailed quote! To provide accurate pricing, our team will need:

1. **Product details** - Which products are you interested in?
2. **Quantity** - How many units do you need?
3. **Installation** - Do you need professional installation?
4. **Timeline** - When do you need the equipment?
5. **Location** - Delivery destination for shipping calculations

I've created a **Quote Request** ticket for our sales team. They will contact you within 24 hours with a detailed quotation.

In the meantime, feel free to ask me any technical questions about our products!`,
    createTicket: true,
    ticketType: 'Quote Request',
    ticketPriority: 'MEDIUM'
  },
  support: {
    triggers: ['support', 'help', 'problem', 'issue', 'not working', 'broken', 'repair', 'fix', 'troubleshoot', 'malfunction'],
    response: `I'm sorry to hear you're experiencing issues. Let me help you troubleshoot.

**Common Quick Fixes:**
1. Check water supply connections
2. Verify electrical connections (if applicable)
3. Inspect for visible damage or blockages
4. Review maintenance schedule

**For Immediate Assistance:**
I've created a **Support Ticket** for our technical team. They will contact you within 4 hours during business hours.

**Emergency Support:**
For urgent safety equipment issues, please call our emergency line at **+44 (0) 1onal Emergency**.

Could you describe the specific issue you're experiencing?`,
    createTicket: true,
    ticketType: 'Technical Support',
    ticketPriority: 'HIGH'
  },
  installation: {
    triggers: ['installation', 'install', 'setup', 'commissioning', 'fitting'],
    response: `Our professional installation services include:

**Pre-Installation:**
• Site survey and assessment
• Utility requirements planning
• Compliance review

**Installation:**
• Certified technician installation
• Connection to utilities
• System testing and verification

**Post-Installation:**
• Staff training
• Documentation and certificates
• Warranty registration

**Timeline:** Typically 1-3 days depending on scope

Would you like to schedule a site survey, or do you have questions about installation requirements for specific products?`,
    createTicket: true,
    ticketType: 'Installation Inquiry',
    ticketPriority: 'MEDIUM'
  },
  maintenance: {
    triggers: ['maintenance', 'service', 'calibration', 'inspection', 'annual service', 'preventive'],
    response: `Our maintenance programs ensure your equipment stays compliant and reliable:

**Service Options:**
• Annual inspection and certification
• Bi-annual preventive maintenance
• Quarterly service contracts
• On-demand repairs

**What's Included:**
• Full system inspection
• Flow rate verification
• Component replacement as needed
• Compliance documentation
• Service reports

**Pricing:** Annual contracts start from competitive rates based on equipment type and quantity.

I've noted your interest in maintenance services. Would you like a quote for a service contract?`,
    createTicket: true,
    ticketType: 'Maintenance Inquiry',
    ticketPriority: 'LOW'
  },
  compliance: {
    triggers: ['compliance', 'certification', 'standard', 'ansi', 'osha', 'regulation', 'certificate'],
    response: `Our products meet all major safety standards:

**Emergency Equipment (ANSI Z358.1):**
• Eyewash stations - 15 min flow @ 0.4 GPM
• Safety showers - 20 GPM minimum
• Tepid water requirements (60-100°F)

**Fume Cupboards (ASHRAE 110):**
• Face velocity testing
• Containment verification
• Tracer gas testing

**Laboratory Furniture:**
• SEFA standards compliance
• Chemical resistance certifications

**Documentation Provided:**
• Compliance certificates
• Test reports
• Installation certificates
• Maintenance records

Do you need specific compliance documentation or have questions about meeting particular standards?`,
    createTicket: false
  },
  humanAgent: {
    triggers: ['speak to human', 'talk to agent', 'real person', 'human agent', 'live support', 'customer service', 'representative'],
    response: `I understand you'd like to speak with a human representative. I've escalated your conversation to our support team.

**What happens next:**
• A support ticket has been created
• Our team will contact you within 2 business hours
• For urgent matters, call us directly

**While you wait:**
Feel free to continue asking me questions - I can provide product information, specifications, and general guidance.

Is there anything specific I can help you with in the meantime?`,
    createTicket: true,
    ticketType: 'Human Agent Request',
    ticketPriority: 'HIGH'
  }
};

// Detect intent and find specific response
function detectIntent(message: string): { key: string; match: typeof specificResponses[string] } | null {
  const lowerMessage = message.toLowerCase();
  
  for (const [key, config] of Object.entries(specificResponses)) {
    const matchCount = config.triggers.filter(trigger => 
      lowerMessage.includes(trigger.toLowerCase())
    ).length;
    
    if (matchCount > 0) {
      return { key, match: config };
    }
  }
  
  return null;
}

// Create HubSpot ticket
async function createHubSpotTicket(
  sessionId: string,
  ticketType: string,
  ticketPriority: string,
  userMessage: string,
  contactId?: string
): Promise<{ success: boolean; ticketId?: string; error?: string }> {
  if (!hubspotApiKey) {
    console.log('HubSpot API key not configured, skipping ticket creation');
    return { success: false, error: 'HubSpot not configured' };
  }

  try {
    // Get ticket pipelines
    const pipelinesResponse = await fetch('https://api.hubapi.com/crm/v3/pipelines/tickets', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${hubspotApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    let pipelineId = '0';
    let stageId = '1';

    if (pipelinesResponse.ok) {
      const pipelinesData = await pipelinesResponse.json();
      if (pipelinesData.results?.length > 0) {
        pipelineId = pipelinesData.results[0].id;
        if (pipelinesData.results[0].stages?.length > 0) {
          stageId = pipelinesData.results[0].stages[0].id;
        }
      }
    }

    const ticketData = {
      properties: {
        subject: `[AI Chat] ${ticketType}: ${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}`,
        content: `**Ticket Type:** ${ticketType}\n\n**Customer Query:**\n${userMessage}\n\n**Session ID:** ${sessionId}\n\n**Created via:** AI Chat Assistant`,
        hs_pipeline: pipelineId,
        hs_pipeline_stage: stageId,
        hs_ticket_priority: ticketPriority
      },
      associations: contactId ? [{
        to: { id: contactId },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 16 }]
      }] : []
    };

    console.log('Creating HubSpot ticket:', ticketData);

    const response = await fetch('https://api.hubapi.com/crm/v3/objects/tickets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('HubSpot ticket creation failed:', response.status, responseText);
      return { success: false, error: `HubSpot error: ${response.status}` };
    }

    const result = JSON.parse(responseText);
    console.log('HubSpot ticket created:', result.id);

    // Update session with ticket ID
    const { data: sessionData } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (sessionData) {
      await supabase
        .from('chat_sessions')
        .update({ hubspot_ticket_id: result.id })
        .eq('id', sessionData.id);
    }

    // Log the integration action
    await supabase.from('hubspot_integration_logs').insert({
      session_id: sessionData?.id,
      action: 'auto_create_ticket',
      hubspot_object_type: 'ticket',
      hubspot_object_id: result.id,
      success: true,
      request_data: ticketData,
      response_data: result
    });

    return { success: true, ticketId: result.id };
  } catch (error) {
    console.error('Error creating HubSpot ticket:', error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  console.log('AI Chat function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Allow both authenticated and anonymous users
  let userId: string | null = null;
  const authHeader = req.headers.get('authorization');
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    const { data: user } = await supabase.auth.getUser(token);
    userId = user?.user?.id || null;
  }

  try {
    const requestBody = await req.json();
    const { message, sessionId, chatHistory = [], contactId } = requestBody;
    
    // Validate and sanitize inputs
    const validation = validateInput(message, sessionId);
    if (!validation.valid) {
      console.error('Input validation failed:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const sanitizedMessage = validation.sanitizedMessage!;
    const sanitizedSessionId = validation.sanitizedSessionId!;
    
    console.log('Processing message:', { 
      messageLength: sanitizedMessage.length, 
      sessionId: sanitizedSessionId, 
      historyLength: chatHistory.length, 
      hasContactId: !!contactId 
    });
    
    // Rate limiting check - server-side enforcement
    const { data: recentMessages } = await supabase
      .from('chat_messages')
      .select('created_at')
      .eq('sender', 'user')
      .gte('created_at', new Date(Date.now() - 60000).toISOString())
      .limit(15);
    
    if (recentMessages && recentMessages.length >= 15) {
      console.warn('Rate limit exceeded for chat messages');
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait before sending more messages.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for specific intent first
    const intentMatch = detectIntent(sanitizedMessage);
    let aiMessage: string;
    let confidence = 0.9;
    let ticketCreated: { success: boolean; ticketId?: string } | null = null;

    if (intentMatch) {
      console.log('Matched specific intent:', intentMatch.key);
      aiMessage = intentMatch.match.response;
      confidence = 0.95;

      // Create HubSpot ticket if needed
      if (intentMatch.match.createTicket) {
        // Get contact ID from session if not provided
        let effectiveContactId = contactId;
        if (!effectiveContactId) {
          const { data: sessionData } = await supabase
            .from('chat_sessions')
            .select('hubspot_contact_id')
            .eq('session_id', sessionId)
            .single();
          effectiveContactId = sessionData?.hubspot_contact_id;
        }

        ticketCreated = await createHubSpotTicket(
          sessionId,
          intentMatch.match.ticketType || 'General Inquiry',
          intentMatch.match.ticketPriority || 'MEDIUM',
          sanitizedMessage,
          effectiveContactId
        );

        if (ticketCreated.success && ticketCreated.ticketId) {
          aiMessage += `\n\n📋 **Ticket #${ticketCreated.ticketId}** has been created for your inquiry.`;
        }
      }
    } else {
      // Use OpenAI for general queries
      const systemPrompt = `You are an AI assistant for Innosin Lab, a leading provider of laboratory safety equipment and furniture. You are knowledgeable about:

1. EMERGENCY EYEWASH STATIONS & SAFETY SHOWERS:
   - Emergency eyewash stations (wall-mounted, pedestal, deck-mounted)
   - Safety shower systems with ANSI Z358.1 compliance
   - Combination eyewash/shower units
   - Freeze protection and water temperature management
   - Installation requirements and maintenance procedures

2. FUME CUPBOARDS & VENTILATION:
   - Chemical fume cupboards for various applications
   - Biological safety cabinets
   - Powder weighing enclosures
   - Ductless and ducted systems
   - Airflow monitoring and safety features

3. LABORATORY FURNITURE:
   - Laboratory benches and workstations
   - Storage cabinets (mobile, wall-mounted, tall)
   - Chemical storage solutions
   - Specialized laboratory seating
   - Modular laboratory systems

4. SERVICES:
   - Professional installation services
   - Maintenance and calibration programs
   - Laboratory design consultation
   - Compliance testing and certification
   - Emergency repair services

Key guidelines:
- Always be helpful, professional, and knowledgeable
- Provide specific product recommendations when appropriate
- Mention relevant safety standards and compliance requirements
- Offer to connect users with specialists for detailed quotes
- Ask clarifying questions to better understand specific needs
- Emphasize safety and compliance in all recommendations
- Keep responses concise but informative (under 300 words)

When users ask about pricing or want to purchase, mention that they can request a quote and our team will provide detailed pricing.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.slice(-8).map((msg: any) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.message
        })),
        { role: 'user', content: sanitizedMessage }
      ];

      console.log('Calling OpenAI API');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      aiMessage = data.choices[0].message.content;
    }

    // Save the AI response to database
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .single();

      if (!sessionError && sessionData) {
        await supabase
          .from('chat_messages')
          .insert({
            session_id: sessionData.id,
            message: aiMessage,
            sender: 'bot',
            confidence: confidence
          });
        console.log('AI message saved to database');
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: aiMessage,
      confidence: confidence,
      ticketCreated: ticketCreated?.success ? ticketCreated.ticketId : null,
      intentMatched: intentMatch?.key || null,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    
    const fallbackResponse = "I apologize, but I'm experiencing technical difficulties right now. Please feel free to browse our product catalog or contact our team directly at info@innosinlab.com for immediate assistance with your laboratory equipment needs.";
    
    return new Response(JSON.stringify({
      success: false,
      message: fallbackResponse,
      confidence: 0.3,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: error.message.includes('rate limit') ? 429 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
