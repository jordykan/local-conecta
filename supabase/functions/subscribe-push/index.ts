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
  console.log('[Subscribe] Request received')

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      console.error('[Subscribe] Supabase config missing')
      return new Response(
        JSON.stringify({ error: 'Configuración faltante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { subscription, accessToken }: SubscribePayload = await req.json()
    console.log('[Subscribe] Has subscription:', !!subscription)
    console.log('[Subscribe] Has accessToken:', !!accessToken)

    if (!accessToken) {
      console.error('[Subscribe] No access token provided')
      return new Response(
        JSON.stringify({ error: 'Token de acceso requerido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user with access token
    console.log('[Subscribe] Verifying user...')
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    })

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      console.error('[Subscribe] Auth error:', authError?.message)
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Subscribe] User authenticated:', user.id)

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      console.error('[Subscribe] Invalid subscription data')
      return new Response(
        JSON.stringify({ error: 'Datos de suscripción inválidos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Save subscription using service role client
    console.log('[Subscribe] Saving subscription...')
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Check if subscription already exists
    const { data: existingList } = await supabaseAdmin
      .from('push_subscriptions')
      .select('id, subscription')
      .eq('user_id', user.id)

    const existing = existingList?.find(
      (sub: any) => sub.subscription?.endpoint === subscription.endpoint
    )

    if (existing) {
      console.log('[Subscribe] Updating existing subscription')
      const { error: updateError } = await supabaseAdmin
        .from('push_subscriptions')
        .update({ subscription, updated_at: new Date().toISOString() })
        .eq('id', existing.id)

      if (updateError) {
        console.error('[Subscribe] Update error:', updateError)
        throw updateError
      }

      console.log('[Subscribe] Subscription updated')
      return new Response(
        JSON.stringify({ message: 'Suscripción actualizada exitosamente' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert new subscription
    console.log('[Subscribe] Inserting new subscription')
    const { error: insertError } = await supabaseAdmin
      .from('push_subscriptions')
      .insert({ user_id: user.id, subscription })

    if (insertError) {
      console.error('[Subscribe] Insert error:', insertError)
      throw insertError
    }

    console.log('[Subscribe] Subscription saved successfully')
    return new Response(
      JSON.stringify({ message: 'Suscripción guardada exitosamente' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[Subscribe] Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
