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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  console.log('AI Chat function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, chatHistory = [] } = await req.json();
    console.log('Processing message:', { message, sessionId, historyLength: chatHistory.length });

    if (!message || !sessionId) {
      throw new Error('Message and sessionId are required');
    }

    // Enhanced system prompt for laboratory equipment specialist
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

When users ask about pricing or want to purchase, collect their contact information and mention that a specialist will reach out with detailed quotes and technical specifications.`;

    // Prepare messages for OpenAI API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.message
      })),
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI API with', messages.length, 'messages');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14', // Using reliable GPT-4.1 model
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    const aiMessage = data.choices[0].message.content;
    const confidence = 0.9; // High confidence for GPT-4 responses

    // Save the AI response to database
    try {
      // Get session UUID from session_id string
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .single();

      if (sessionError || !sessionData) {
        console.error('Session lookup error:', sessionError);
      } else {
        // Save AI message to database
        const { error: messageError } = await supabase
          .from('chat_messages')
          .insert({
            session_id: sessionData.id,
            message: aiMessage,
            sender: 'bot',
            confidence: confidence
          });

        if (messageError) {
          console.error('Error saving AI message:', messageError);
        } else {
          console.log('AI message saved to database');
        }
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Don't throw here - still return the AI response even if DB save fails
    }

    return new Response(JSON.stringify({
      success: true,
      message: aiMessage,
      confidence: confidence,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    
    // Fallback response for when OpenAI fails
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