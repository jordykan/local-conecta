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
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[Subscribe] Request received')

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('[Subscribe] No authorization header')
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Subscribe] Supabase config missing')
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    })

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[Subscribe] Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Subscribe] User authenticated:', user.id)

    // Parse request body
    const { subscription }: SubscribePayload = await req.json()

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      console.error('[Subscribe] Invalid subscription data')
      return new Response(
        JSON.stringify({ error: 'Datos de suscripción inválidos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Subscribe] Saving subscription for user:', user.id)

    // Use service role client to insert subscription
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Check if subscription already exists
    const { data: existing } = await supabaseAdmin
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('subscription->>endpoint', subscription.endpoint)
      .single()

    if (existing) {
      console.log('[Subscribe] Subscription already exists, updating...')

      // Update existing subscription
      const { error: updateError } = await supabaseAdmin
        .from('push_subscriptions')
        .update({
          subscription,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)

      if (updateError) {
        console.error('[Subscribe] Error updating subscription:', updateError)
        throw updateError
      }

      console.log('[Subscribe] Subscription updated successfully')
      return new Response(
        JSON.stringify({ message: 'Suscripción actualizada exitosamente' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert new subscription
    const { error: insertError } = await supabaseAdmin
      .from('push_subscriptions')
      .insert({
        user_id: user.id,
        subscription
      })

    if (insertError) {
      console.error('[Subscribe] Error inserting subscription:', insertError)
      throw insertError
    }

    console.log('[Subscribe] Subscription saved successfully')

    return new Response(
      JSON.stringify({ message: 'Suscripción guardada exitosamente' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[Subscribe] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
