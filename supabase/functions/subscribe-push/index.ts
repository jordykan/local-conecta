import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=====> FUNCTION STARTED')
  console.log('=====> Method:', req.method)
  console.log('=====> URL:', req.url)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('=====> Returning CORS response')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=====> In try block')

    return new Response(
      JSON.stringify({
        message: 'Function is working!',
        method: req.method,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('=====> ERROR:', error)
    return new Response(
      JSON.stringify({ error: 'Caught error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
