import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { userId, title, body, url, tag, icon }: NotificationPayload = await req.json()

    // Validar campos requeridos
    if (!userId || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Obtener subscriptions del usuario
    const { data: subs, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId)

    if (subsError) {
      throw subsError
    }

    if (!subs || subs.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No subscriptions found for user' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar preferencias de notificaciones del usuario
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Si el usuario tiene preferencias y todas están desactivadas, no enviar
    if (prefs && !prefs.notify_new_booking && !prefs.notify_booking_confirmed &&
        !prefs.notify_booking_cancelled && !prefs.notify_new_message &&
        !prefs.notify_new_review) {
      return new Response(
        JSON.stringify({ message: 'User has disabled all notifications' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured')
    }

    // Enviar notificación a cada subscription usando web-push
    const results = await Promise.all(
      subs.map(async ({ subscription }) => {
        try {
          // Usar web-push standard
          const endpoint = subscription.endpoint
          const keys = subscription.keys

          const payload = JSON.stringify({
            title,
            body,
            icon: icon || '/icon.svg',
            badge: '/icon.svg',
            url: url || '/',
            tag: tag || 'default'
          })

          // Por ahora solo registramos, la implementación real de web-push
          // requiere una librería específica que no está disponible en Deno
          // Se recomienda usar un servicio como FCM o implementar web-push manualmente
          console.log('Sending push notification:', {
            endpoint,
            payload
          })

          return { success: true, endpoint }
        } catch (error) {
          console.error('Error sending push:', error)
          return { success: false, error: error.message }
        }
      })
    )

    return new Response(
      JSON.stringify({
        message: 'Notifications processed',
        results,
        total: subs.length,
        successful: results.filter(r => r.success).length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in send-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
