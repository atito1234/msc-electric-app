// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const BUCKET_NAME = 'project_documents';

serve(async (req) => {
    // CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Get the uploaded file path from the webhook payload or manual call
        const { document_url, project_id } = await req.json()

        if (!document_url || !project_id) {
            return new Response(JSON.stringify({ error: 'document_url and project_id are required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 2. Mark project as "processing"
        await supabaseClient
            .from('projects')
            .update({ ai_quote_status: 'processing' })
            .eq('id', project_id);

        // 3. Download the file from Supabase Storage (Simulation)
        /* 
          const { data: fileData, error: downloadError } = await supabaseClient
            .storage
            .from(BUCKET_NAME)
            .download(document_url);
            
          if (downloadError) throw downloadError;
        */

        console.log(`Analyzing document for project ${project_id}: ${document_url}`);

        // 4. MOCK AI INGESTION & QUOTING
        // In production, you would pipe the file buffer to OpenAI Vision/Text extractors here.
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time

        // AI generated values
        const estimatedValue = Math.floor(Math.random() * 50000) + 15000;
        const aiScopeOfWork = "AI Analysis: Blueprint suggests 5 bedrooms, 3 baths. Major panel upgrade required. Estimated 120 man-hours.";

        // 5. Update the project with the AI results
        const { error: updateError } = await supabaseClient
            .from('projects')
            .update({
                ai_quote_status: 'completed',
                status: 'quoted',
                estimated_value: estimatedValue,
                description: aiScopeOfWork
            })
            .eq('id', project_id);

        if (updateError) throw updateError;

        return new Response(
            JSON.stringify({ success: true, estimatedValue, message: 'Quote generated successfully.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
