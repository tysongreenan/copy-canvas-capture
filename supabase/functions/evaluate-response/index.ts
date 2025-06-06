
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      response,
      originalQuery,
      taskType = 'general',
      context = [],
      qualityThreshold = 90
    } = await req.json();

    if (!response || !originalQuery) {
      return new Response(JSON.stringify({ 
        error: "Missing required parameters: response and originalQuery" 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Evaluating response for query: ${originalQuery.substring(0, 50)}...`);

    // Create a task-specific evaluation prompt
    let evaluationPrompt = "You are an expert evaluator of AI responses. ";
    
    // Add task-specific evaluation criteria
    if (taskType === 'email') {
      evaluationPrompt += "Evaluate this email response based on: professionalism, clarity, completeness, personalization, and actionable content.";
    } else if (taskType === 'summary') {
      evaluationPrompt += "Evaluate this summary based on: accuracy, conciseness, comprehensiveness, and objectivity.";
    } else if (taskType === 'research') {
      evaluationPrompt += "Evaluate this research response based on: factual accuracy, depth of analysis, quality of sources, and relevance to the query.";
    } else if (taskType === 'marketing' || taskType === 'content') {
      evaluationPrompt += "Evaluate this marketing/content response based on: persuasiveness, creativity, brand alignment, audience targeting, and call-to-action effectiveness.";
    } else {
      evaluationPrompt += "Evaluate this general response based on: accuracy, relevance, completeness, and clarity.";
    }

    // Add evaluation instructions
    evaluationPrompt += `\n\nRate the response on a scale from 0-100, where:
    - 90-100: Excellent - accurate, complete, well-formatted, and directly addresses the user's needs
    - 80-89: Good - mostly accurate and helpful but has minor issues or omissions
    - 70-79: Adequate - helpful but has notable issues or misses important information
    - Below 70: Needs improvement - contains inaccuracies, irrelevant information, or major omissions
    
    Provide specific feedback on what needs improvement and why. Your evaluation must include:
    
    1. Overall score (0-100)
    2. Specific strengths of the response
    3. Specific weaknesses or inaccuracies
    4. Concrete suggestions for improvement
    5. Analysis of how well the response addresses the original query`;

    // Add any additional context if provided
    if (context && context.length > 0) {
      evaluationPrompt += "\n\nAlso consider this additional context when evaluating:";
      context.forEach((item: any) => {
        evaluationPrompt += `\n- ${item.content}`;
      });
    }

    // Call OpenAI for evaluation
    const evaluationResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: evaluationPrompt },
          { role: "user", content: `Original query: ${originalQuery}\n\nAI response to evaluate: ${response}` }
        ],
        temperature: 0.3, // Lower temperature for more consistent evaluations
        max_tokens: 1000
      })
    });

    if (!evaluationResponse.ok) {
      const errorData = await evaluationResponse.json();
      throw new Error(`OpenAI API Error: ${JSON.stringify(errorData)}`);
    }

    const evaluationData = await evaluationResponse.json();
    const evaluationFeedback = evaluationData.choices[0].message.content;

    // Parse the score from the feedback 
    // We'll look for patterns like "Score: 85", "Overall score: 85", etc.
    const scoreMatch = evaluationFeedback.match(/(?:score|rating)(?:\s*|:)\s*(\d{1,3})/i);
    let score = scoreMatch ? parseInt(scoreMatch[1]) : null;
    
    // If we couldn't extract a score, make a second attempt with a more generic pattern
    if (score === null) {
      const numericMatch = evaluationFeedback.match(/\b([0-9]{2,3})(?:\/100)?\b/);
      score = numericMatch ? parseInt(numericMatch[1]) : 70; // Default to 70 if we can't extract a score
    }
    
    // Constrain score to valid range
    score = Math.min(Math.max(score || 0, 0), 100);

    return new Response(JSON.stringify({
      score,
      feedback: evaluationFeedback,
      passesThreshold: score >= qualityThreshold
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in evaluate-response function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      score: 70, // Default fallback score
      feedback: "Error evaluating response: " + error.message,
      passesThreshold: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
