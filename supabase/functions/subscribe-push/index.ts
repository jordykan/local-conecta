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
  accessToken?: string // Fallback for iOS PWAs that don't send Authorization header
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[Subscribe] Request received')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      console.error('[Subscribe] Supabase config missing')
      throw new Error('Supabase configuration missing')
    }

    // Parse request body first to get potential accessToken
    const { subscription, accessToken }: SubscribePayload = await req.json()

    // Get Authorization header (try multiple sources)
    let authHeader = req.headers.get('Authorization') || req.headers.get('authorization')

    // Fallback: if no header, try to get token from body (iOS PWA workaround)
    if (!authHeader && accessToken) {
      authHeader = `Bearer ${accessToken}`
      console.log('[Subscribe] Using token from body (iOS fallback)')
    }

    console.log('[Subscribe] Auth header present:', !!authHeader)

    if (!authHeader) {
      console.error('[Subscribe] No authorization header or token in body')
      return new Response(
        JSON.stringify({ error: 'No autorizado - falta token de acceso' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create client with user's JWT for auth verification
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    })

    // Verify user authentication
    console.log('[Subscribe] Verifying user...')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      console.error('[Subscribe] Auth error:', authError)
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

    console.log('[Subscribe] Saving subscription for user:', user.id)

    // Use service role client for database operations (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Check if subscription already exists
    // Note: We can't easily query JSONB fields with Supabase JS client,
    // so we'll get all user subscriptions and filter in memory
    const { data: existingList } = await supabaseAdmin
      .from('push_subscriptions')
      .select('id, subscription')
      .eq('user_id', user.id)

    const existing = existingList?.find(
      (sub: any) => sub.subscription?.endpoint === subscription.endpoint
    )

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
