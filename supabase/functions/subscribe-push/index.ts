import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubscribePayload {
  subscription: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  }
  accessToken?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[Subscribe] ==> Request received')
    console.log('[Subscribe] ==> Method:', req.method)
    console.log('[Subscribe] ==> Headers:', JSON.stringify([...req.headers.entries()]))

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    console.log('[Subscribe] ==> Env vars present:', {
      url: !!supabaseUrl,
      serviceKey: !!supabaseServiceKey,
      anonKey: !!supabaseAnonKey
    })

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      console.error('[Subscribe] Supabase config missing')
      return new Response(
        JSON.stringify({ error: 'Configuración faltante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body = await req.json()
    console.log('[Subscribe] ==> Body keys:', Object.keys(body))
    console.log('[Subscribe] ==> Has accessToken:', !!body.accessToken)
    console.log('[Subscribe] ==> Has subscription:', !!body.subscription)

    const { subscription, accessToken }: SubscribePayload = body

    // Get Authorization header
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || (accessToken ? `Bearer ${accessToken}` : null)

    console.log('[Subscribe] ==> Auth source:', authHeader ? (accessToken && !req.headers.get('Authorization') ? 'body' : 'header') : 'none')

    if (!authHeader) {
      console.error('[Subscribe] No authorization')
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create client and verify user
    console.log('[Subscribe] ==> Creating client...')
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    console.log('[Subscribe] ==> Getting user...')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError) {
      console.error('[Subscribe] ==> Auth error:', JSON.stringify(authError))
      return new Response(
        JSON.stringify({ error: 'Auth failed', details: authError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!user) {
      console.error('[Subscribe] ==> No user returned')
      return new Response(
        JSON.stringify({ error: 'No user' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Subscribe] ==> User OK:', user.id)

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      console.error('[Subscribe] Invalid subscription')
      return new Response(
        JSON.stringify({ error: 'Invalid subscription data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Save subscription
    console.log('[Subscribe] ==> Saving...')
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { data: existingList } = await supabaseAdmin
      .from('push_subscriptions')
      .select('id, subscription')
      .eq('user_id', user.id)

    console.log('[Subscribe] ==> Existing count:', existingList?.length || 0)

    const existing = existingList?.find(
      (sub: any) => sub.subscription?.endpoint === subscription.endpoint
    )

    if (existing) {
      console.log('[Subscribe] ==> Updating existing...')
      const { error: updateError } = await supabaseAdmin
        .from('push_subscriptions')
        .update({ subscription, updated_at: new Date().toISOString() })
        .eq('id', existing.id)

      if (updateError) {
        console.error('[Subscribe] ==> Update error:', JSON.stringify(updateError))
        throw updateError
      }

      console.log('[Subscribe] ==> Updated OK')
      return new Response(
        JSON.stringify({ message: 'Updated' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert new
    console.log('[Subscribe] ==> Inserting new...')
    const { error: insertError } = await supabaseAdmin
      .from('push_subscriptions')
      .insert({ user_id: user.id, subscription })

    if (insertError) {
      console.error('[Subscribe] ==> Insert error:', JSON.stringify(insertError))
      throw insertError
    }

    console.log('[Subscribe] ==> Inserted OK')
    return new Response(
      JSON.stringify({ message: 'Saved' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[Subscribe] ==> CATCH:', error.message, error.stack)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
