
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("Missing OpenAI API key");
    }

    const { projectId, content } = await req.json();

    if (!content) {
      throw new Error("Missing content parameter");
    }

    // Create the prompt for brand voice analysis
    const prompt = `
You are a brand voice analyst. Your task is to analyze website content and extract the brand's voice characteristics.
Identify the following elements based on the content provided:

1. TONE: What emotional tone does the brand use? (e.g., formal, conversational, authoritative, friendly)
2. STYLE: How does the brand structure its writing? (e.g., concise, detailed, storytelling)
3. LANGUAGE: What type of language does the brand use? (e.g., simple, technical, industry-specific)
4. AUDIENCE: Who is the target audience based on the content?
5. KEY_MESSAGES: What are the 3-5 most important messages or value propositions?
6. TERMINOLOGY: Identify key terms or phrases unique to this brand and their meanings/descriptions
7. AVOID_PHRASES: What phrases or terms should be avoided based on brand positioning?

Website Content:
${content}

Respond in JSON format:
{
  "tone": "string",
  "style": "string",
  "language": "string",
  "audience": "string",
  "key_messages": ["string"],
  "terminology": {"term": "definition"},
  "avoid_phrases": ["string"]
}
`;

    // Call OpenAI's API
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using a more cost-effective model
        messages: [
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.5,
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
    }

    const completion = await aiResponse.json();
    const aiContent = completion.choices[0].message.content;
    
    // Extract JSON from the AI response
    let brandVoiceData;
    try {
      // Handle potential markdown formatting in the response
      const jsonContent = aiContent.replace(/```json|```/g, '').trim();
      brandVoiceData = JSON.parse(jsonContent);
    } catch (e) {
      console.error("Error parsing AI response as JSON:", e);
      throw new Error("Failed to parse AI analysis results");
    }

    // Add project_id to the response
    const result = {
      project_id: projectId,
      ...brandVoiceData
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error analyzing brand voice:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
