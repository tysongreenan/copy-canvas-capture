
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("Missing OpenAI API key");
    }

    // Parse the request body
    const { text } = await req.json();
    
    if (!text) {
      throw new Error("Missing text parameter");
    }

    console.log(`Generating embedding for text of length: ${text.length}`);

    // Call OpenAI's embedding API with the smaller model (1536 dimensions)
    const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: text,
        model: "text-embedding-3-small", // Use the smaller model for 1536 dimensions
      }),
    });

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.json();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
    }

    const { data } = await embeddingResponse.json();
    
    console.log(`Successfully generated embedding with ${data[0].embedding.length} dimensions`);
    
    return new Response(JSON.stringify({ embedding: data[0].embedding }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error generating embedding:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
