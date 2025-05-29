import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openAIApiKey) {
      throw new Error("Missing OpenAI API key");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const { keyword, projectId } = await req.json();
    
    if (!keyword || !projectId) {
      throw new Error("Missing required parameters: keyword and projectId");
    }

    console.log(`Conducting deep research on: "${keyword}" for project: ${projectId}`);

    // Create a comprehensive research prompt
    const systemPrompt = `You are an expert marketing researcher. Your task is to conduct deep research on the given topic and provide comprehensive, actionable insights for small businesses. Include:
    1. Overview and current trends
    2. Best practices and strategies
    3. Common mistakes to avoid
    4. Practical implementation tips
    5. Tools and resources
    6. Case studies or examples
    
    Format your response with clear headings and bullet points for easy scanning.`;

    const userPrompt = `Please conduct deep research on: "${keyword}"
    
    Focus on practical, actionable insights that a small business (1-10 employees) can implement. 
    Include current trends, best practices, and specific recommendations.`;

    // Call OpenAI with web search (when available)
    // For now, we'll use standard GPT-4 until web search is available
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const researchContent = data.choices[0].message.content;

    // Store the research as scraped content
    const { data: contentData, error: contentError } = await supabase
      .from('scraped_content')
      .insert({
        project_id: projectId,
        url: `research://${keyword.replace(/\s+/g, '-').toLowerCase()}`,
        title: `Research: ${keyword}`,
        meta_description: `Deep research report on ${keyword}`,
        headings: [{
          tag: 'h1',
          text: `Research Report: ${keyword}`
        }],
        paragraphs: researchContent.split('\n').filter(p => p.trim()),
        links: [],
        list_items: [],
        images: [],
        scraped_at: new Date().toISOString()
      })
      .select()
      .single();

    if (contentError) {
      console.error("Error storing research:", contentError);
      throw contentError;
    }

    // Generate embeddings for the research
    const { error: embeddingError } = await supabase.functions.invoke('process-embeddings', {
      body: {
        projectId,
        contents: [{
          title: `Research: ${keyword}`,
          url: `research://${keyword.replace(/\s+/g, '-').toLowerCase()}`,
          paragraphs: researchContent.split('\n').filter(p => p.trim()),
          headings: [],
          links: [],
          listItems: []
        }]
      },
      headers: {
        Authorization: authHeader
      }
    });

    if (embeddingError) {
      console.error("Error generating embeddings:", embeddingError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        contentId: contentData.id,
        research: researchContent,
        message: `Research completed successfully`
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error conducting research:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to conduct research"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
}); 