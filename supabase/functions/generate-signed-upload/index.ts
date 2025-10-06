import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { filePath, bucket = 'documents' } = await req.json();

    if (!filePath) {
      throw new Error('filePath is required');
    }

    console.log('Generating signed upload URL for:', { filePath, bucket, userId: user.id });

    // Check permissions based on path
    const pathParts = filePath.split('/');
    const isProductPath = pathParts[0] === 'products';
    const isUserUploadPath = pathParts[0] === 'uploads' && pathParts[1] === user.id;

    if (isProductPath) {
      // Only admins can upload to products/**
      const { data: userEmail } = await supabase.rpc('get_current_user_email');
      const { data: isAdmin } = await supabase.rpc('is_admin', { user_email: userEmail });
      
      if (!isAdmin) {
        throw new Error('Only admins can upload product assets');
      }
    } else if (!isUserUploadPath) {
      throw new Error('Invalid upload path');
    }

    // Create signed upload URL (valid for 5 minutes)
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error('Error creating signed URL:', error);
      throw error;
    }

    console.log('Signed URL generated successfully');

    return new Response(
      JSON.stringify({ 
        signedUrl: data.signedUrl,
        path: data.path,
        token: data.token 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});