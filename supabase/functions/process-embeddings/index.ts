
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { text, projectId, metadata } = await req.json();

    if (!text || !projectId) {
      return new Response(
        JSON.stringify({ error: 'Text and projectId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Skip processing if text is related to an error page
    if (text.includes('Error') && (metadata?.type === 'title' || text.length < 20)) {
      console.log(`Skipping embedding generation for likely error content: "${text}"`);
      return new Response(
        JSON.stringify({ success: false, skipped: true, reason: 'Error content detected' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing text for project ${projectId} (length: ${text.length})`);
    
    // Generate embedding with OpenAI
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small',
      }),
    });

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.json();
      const errorMsg = error.error?.message || 'Failed to generate embedding';
      console.error(`OpenAI API error: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;
    
    console.log(`Successfully generated embedding vector (dimensions: ${embedding.length})`);
    
    // Verify project exists before inserting
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // First check if project exists
    const { data: projectData, error: projectError } = await supabase
      .from('scraped_projects')
      .select('id')
      .eq('id', projectId)
      .single();
      
    if (projectError || !projectData) {
      console.error(`Project verification error: Project ${projectId} does not exist`, projectError);
      throw new Error(`Project ${projectId} not found. Embedding storage aborted.`);
    }

    // Then store embedding
    const { data, error } = await supabase
      .from('document_chunks')
      .insert({
        project_id: projectId,
        content: text,
        embedding: embedding,
        metadata: metadata || {}
      });
      
    if (error) {
      console.error(`Database error: ${error.message}`, error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Successfully stored document chunk for project ${projectId}`);
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing embeddings:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
