
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    // Parse the request body
    const { content, contentType, marketingDomain } = await req.json();
    
    if (!content) {
      throw new Error("Missing content parameter");
    }

    console.log(`Assessing quality for content of length: ${content.length}`);

    // Create a specialized prompt for marketing content quality assessment
    const assessmentPrompt = `You are an expert marketing content quality assessor. Evaluate the following marketing content based on these criteria:

1. CLARITY (0-1): How clear and understandable is the content?
2. ACCURACY (0-1): How accurate and factual does the information appear?
3. RELEVANCE (0-1): How relevant is this to ${marketingDomain || 'marketing'} and ${contentType || 'general knowledge'}?
4. COMPLETENESS (0-1): How complete and comprehensive is the information?
5. MARKETING_VALUE (0-1): How valuable is this for marketing professionals?

Content to assess:
"${content.substring(0, 2000)}"

Respond with ONLY a JSON object in this exact format:
{
  "clarity": 0.8,
  "accuracy": 0.9,
  "relevance": 0.7,
  "completeness": 0.6,
  "marketing_value": 0.8,
  "overall_score": 0.76,
  "reasoning": "Brief explanation of the scoring"
}

The overall_score should be a weighted average: (clarity * 0.25) + (accuracy * 0.25) + (relevance * 0.2) + (completeness * 0.15) + (marketing_value * 0.15)`;

    // Call OpenAI's API for quality assessment
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a precise content quality assessor. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: assessmentPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
    }

    const { choices } = await response.json();
    const assessmentText = choices[0].message.content.trim();
    
    console.log("Raw assessment response:", assessmentText);
    
    // Parse the JSON response
    let assessment;
    try {
      // Clean the response in case there's any markdown formatting
      const cleanedResponse = assessmentText.replace(/```json\n?|\n?```/g, '').trim();
      assessment = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse assessment JSON:", assessmentText);
      // Fallback to a default moderate score
      assessment = {
        clarity: 0.7,
        accuracy: 0.7,
        relevance: 0.7,
        completeness: 0.7,
        marketing_value: 0.7,
        overall_score: 0.7,
        reasoning: "Failed to parse AI assessment, using default score"
      };
    }
    
    // Validate and clamp scores to 0-1 range
    const validatedAssessment = {
      clarity: Math.max(0, Math.min(1, assessment.clarity || 0.7)),
      accuracy: Math.max(0, Math.min(1, assessment.accuracy || 0.7)),
      relevance: Math.max(0, Math.min(1, assessment.relevance || 0.7)),
      completeness: Math.max(0, Math.min(1, assessment.completeness || 0.7)),
      marketing_value: Math.max(0, Math.min(1, assessment.marketing_value || 0.7)),
      overall_score: Math.max(0, Math.min(1, assessment.overall_score || 0.7)),
      reasoning: assessment.reasoning || "AI quality assessment completed"
    };
    
    console.log("Quality assessment completed:", validatedAssessment);
    
    return new Response(JSON.stringify(validatedAssessment), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error assessing content quality:", error);
    
    // Return a fallback score instead of failing completely
    const fallbackAssessment = {
      clarity: 0.7,
      accuracy: 0.7,
      relevance: 0.7,
      completeness: 0.7,
      marketing_value: 0.7,
      overall_score: 0.7,
      reasoning: `Assessment failed: ${error.message}. Using fallback score.`
    };
    
    return new Response(JSON.stringify(fallbackAssessment), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Return 200 to avoid breaking the upload flow
    });
  }
});
