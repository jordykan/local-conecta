import { createClient } from '@/lib/supabase/server'

export interface SendNotificationParams {
  userId: string
  title: string
  body: string
  url: string
  tag?: string
  icon?: string
}

export interface NotificationType {
  NEW_BOOKING: 'new_booking'
  BOOKING_CONFIRMED: 'booking_confirmed'
  BOOKING_CANCELLED: 'booking_cancelled'
  NEW_MESSAGE: 'new_message'
  NEW_REVIEW: 'new_review'
  REVIEW_RESPONSE: 'review_response'
}

export const NOTIFICATION_TYPE: NotificationType = {
  NEW_BOOKING: 'new_booking',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  NEW_MESSAGE: 'new_message',
  NEW_REVIEW: 'new_review',
  REVIEW_RESPONSE: 'review_response'
}

/**
 * Envía una notificación push a un usuario
 */
export async function sendPushNotification(params: SendNotificationParams): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Verificar que la URL y las claves de Supabase estén configuradas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[Push] Supabase credentials not configured')
      return false
    }

    // Llamar a la Edge Function para enviar la notificación
    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-notification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`
        },
        body: JSON.stringify(params)
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('[Push] Error sending notification:', error)
      return false
    }

    const result = await response.json()
    console.log('[Push] Notification sent:', result)

    return true
  } catch (error) {
    console.error('[Push] Error in sendPushNotification:', error)
    return false
  }
}

/**
 * Verifica si un usuario tiene habilitado un tipo específico de notificación
 */
export async function isNotificationEnabled(
  userId: string,
  notificationType: keyof NotificationType
): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!prefs) {
      // Si no hay preferencias, asumir que están todas habilitadas
      return true
    }

    const typeMap: Record<string, keyof typeof prefs> = {
      NEW_BOOKING: 'notify_new_booking',
      BOOKING_CONFIRMED: 'notify_booking_confirmed',
      BOOKING_CANCELLED: 'notify_booking_cancelled',
      NEW_MESSAGE: 'notify_new_message',
      NEW_REVIEW: 'notify_new_review',
      REVIEW_RESPONSE: 'notify_review_response'
    }

    const prefKey = typeMap[notificationType]
    return prefKey ? (prefs[prefKey] as boolean) : false
  } catch (error) {
    console.error('[Push] Error checking notification preferences:', error)
    return false
  }
}

/**
 * Envía notificación solo si el usuario la tiene habilitada
 */
export async function sendNotificationIfEnabled(
  params: SendNotificationParams,
  notificationType: keyof NotificationType
): Promise<boolean> {
  const enabled = await isNotificationEnabled(params.userId, notificationType)

  if (!enabled) {
    console.log(`[Push] Notification ${notificationType} disabled for user ${params.userId}`)
    return false
  }

  return sendPushNotification(params)
}
