import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendPushNotification, type PushSubscription, type PushMessage } from '../_shared/web-push.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  userId: string
  title: string
  body: string
  url: string
  tag?: string
  icon?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[Edge Function] send-notification invoked')

    const { userId, title, body, url, tag, icon }: NotificationPayload = await req.json()

    console.log('[Edge Function] Payload:', { userId, title, body })

    // Validar campos requeridos
    if (!userId || !title || !body) {
      console.error('[Edge Function] Missing required fields')
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    console.log('[Edge Function] Supabase config:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey
    })

    const supabase = createClient(supabaseUrl!, supabaseKey!)

    // Obtener subscriptions del usuario
    console.log('[Edge Function] Fetching subscriptions for user:', userId)

    const { data: subs, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId)

    console.log('[Edge Function] Subscriptions query result:', {
      count: subs?.length,
      error: subsError
    })

    if (subsError) {
      console.error('[Edge Function] Error fetching subscriptions:', subsError)
      throw subsError
    }

    if (!subs || subs.length === 0) {
      console.log('[Edge Function] No subscriptions found')
      return new Response(
        JSON.stringify({
          message: 'No subscriptions found for user',
          userId
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar preferencias de notificaciones del usuario
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    console.log('[Edge Function] User preferences:', prefs)

    // Si el usuario tiene preferencias y todas están desactivadas, no enviar
    if (prefs && !prefs.notify_new_booking && !prefs.notify_booking_confirmed &&
        !prefs.notify_booking_cancelled && !prefs.notify_new_message &&
        !prefs.notify_new_review) {
      console.log('[Edge Function] All notifications disabled for user')
      return new Response(
        JSON.stringify({ message: 'User has disabled all notifications' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

    console.log('[Edge Function] VAPID keys configured:', {
      hasPublic: !!vapidPublicKey,
      hasPrivate: !!vapidPrivateKey
    })

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('[Edge Function] VAPID keys not configured')
      throw new Error('VAPID keys not configured')
    }

    // Preparar el mensaje de notificación
    const message: PushMessage = {
      title,
      body,
      url,
      tag,
      icon
    }

    console.log('[Edge Function] Sending push notifications to', subs.length, 'subscriptions')

    // Enviar notificaciones a todas las suscripciones del usuario
    const results = await Promise.all(
      subs.map(async ({ subscription }) => {
        try {
          console.log('[Edge Function] Sending to:', subscription.endpoint?.substring(0, 50) + '...')

          const pushSub: PushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.keys.p256dh,
              auth: subscription.keys.auth
            }
          }

          const result = await sendPushNotification(
            pushSub,
            message,
            vapidPublicKey,
            vapidPrivateKey
          )

          if (result.success) {
            console.log('[Edge Function] ✓ Sent successfully to:', subscription.endpoint?.substring(0, 50))
          } else {
            console.error('[Edge Function] ✗ Failed to send:', result.error)
          }

          return {
            success: result.success,
            endpoint: subscription.endpoint,
            error: result.error
          }
        } catch (error) {
          console.error('[Edge Function] ✗ Exception sending push:', error)
          return {
            success: false,
            endpoint: subscription.endpoint,
            error: error.message
          }
        }
      })
    )

    const successCount = results.filter(r => r.success).length
    const failedCount = results.length - successCount
    console.log(`[Edge Function] Notifications sent: ${successCount}/${subs.length} successful`)

    return new Response(
      JSON.stringify({
        message: successCount > 0 ? 'Notifications sent successfully' : 'All notifications failed',
        results,
        total: subs.length,
        successful: successCount,
        failed: failedCount
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('[Edge Function] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
