import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: jobs, error } = await supabase
    .from('embedding_jobs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(5);

  if (error) {
    console.error('Error fetching jobs:', error);
    return new Response(JSON.stringify({ error: 'failed to fetch jobs' }), { headers: corsHeaders, status: 500 });
  }

  let processed = 0;
  for (const job of jobs ?? []) {
    const { id, payload, attempts } = job as any;

    await supabase.from('embedding_jobs').update({ status: 'processing', attempts: (attempts || 0) + 1 }).eq('id', id);

    const { text, projectId, metadata } = payload || {};
    const { data: result, error: procError } = await supabase.functions.invoke('process-embeddings', {
      body: { text, projectId, metadata }
    });

    if (procError || result?.success !== true) {
      await supabase.from('embedding_jobs').update({ status: 'failed' }).eq('id', id);
    } else {
      await supabase.from('embedding_jobs').update({ status: 'complete' }).eq('id', id);
    }

    processed++;
  }

  return new Response(JSON.stringify({ processed }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
