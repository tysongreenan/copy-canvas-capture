
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { message, threadId, assistantId } = await req.json();

    if (!message || !assistantId) {
      return new Response(
        JSON.stringify({ error: 'Message and assistantId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing message: "${message}" with assistant ${assistantId}`);

    let activeThreadId = threadId;
    
    // If no thread ID is provided, create a new thread
    if (!activeThreadId) {
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v1'
        },
        body: JSON.stringify({})
      });

      if (!threadResponse.ok) {
        const error = await threadResponse.json();
        throw new Error(error.error?.message || 'Failed to create thread');
      }

      const threadData = await threadResponse.json();
      activeThreadId = threadData.id;
      console.log(`Created new thread with ID: ${activeThreadId}`);
    }

    // Add the user's message to the thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        role: 'user',
        content: message
      })
    });

    if (!messageResponse.ok) {
      const error = await messageResponse.json();
      throw new Error(error.error?.message || 'Failed to add message to thread');
    }

    // Run the assistant on the thread
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        assistant_id: assistantId
      })
    });

    if (!runResponse.ok) {
      const error = await runResponse.json();
      throw new Error(error.error?.message || 'Failed to run assistant');
    }

    const runData = await runResponse.json();
    const runId = runData.id;

    // Poll for the run to complete
    let runStatus = runData.status;
    let attempts = 0;
    const maxAttempts = 60; // Maximum 60 attempts with 1 second delay = 1 minute timeout
    
    while (runStatus !== 'completed' && runStatus !== 'failed' && runStatus !== 'expired' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const runCheckResponse = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v1'
        }
      });

      if (!runCheckResponse.ok) {
        const error = await runCheckResponse.json();
        throw new Error(error.error?.message || 'Failed to check run status');
      }

      const runCheckData = await runCheckResponse.json();
      runStatus = runCheckData.status;
      attempts++;
      
      console.log(`Run status check ${attempts}: ${runStatus}`);
    }

    if (runStatus !== 'completed') {
      throw new Error(`Run did not complete successfully. Status: ${runStatus}`);
    }

    // Get the assistant's response
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/messages`, {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      }
    });

    if (!messagesResponse.ok) {
      const error = await messagesResponse.json();
      throw new Error(error.error?.message || 'Failed to get messages');
    }

    const messagesData = await messagesResponse.json();
    const assistantMessage = messagesData.data.find(msg => msg.role === 'assistant');

    if (!assistantMessage) {
      throw new Error('No assistant message found');
    }

    // Extract the text content from the message
    let responseContent = '';
    if (assistantMessage.content && assistantMessage.content.length > 0) {
      assistantMessage.content.forEach(content => {
        if (content.type === 'text') {
          responseContent += content.text.value;
        }
      });
    }

    return new Response(
      JSON.stringify({ message: responseContent, threadId: activeThreadId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in assistant-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
