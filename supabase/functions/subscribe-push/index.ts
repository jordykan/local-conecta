import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubscribePayload {
  subscription: PushSubscriptionJSON
}

interface PushSubscriptionJSON {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obtener el token de autorización
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    )

    // Verificar usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { subscription }: SubscribePayload = await req.json()

    // Validar subscription
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return new Response(
        JSON.stringify({ error: 'Invalid subscription object' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Guardar o actualizar subscription
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          subscription: subscription
        },
        {
          onConflict: 'user_id,subscription',
          ignoreDuplicates: false
        }
      )
      .select()
      .single()

    if (error) {
      throw error
    }

    // Crear preferencias por defecto si no existen
    const { error: prefsError } = await supabase
      .from('notification_preferences')
      .upsert(
        {
          user_id: user.id,
          notify_new_booking: true,
          notify_booking_confirmed: true,
          notify_booking_cancelled: true,
          notify_new_message: true,
          notify_new_review: true
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: true
        }
      )

    if (prefsError) {
      console.error('Error creating notification preferences:', prefsError)
    }

    return new Response(
      JSON.stringify({
        message: 'Subscription saved successfully',
        data
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in subscribe-push:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
