'use server'

import { sendPushNotification } from '@/lib/services/push-notifications'
import { createClient } from '@/lib/supabase/server'

export interface SendTestNotificationResult {
  success: boolean
  error?: string
}

/**
 * Envía una notificación de prueba al usuario actual
 */
export async function sendTestNotification(): Promise<SendTestNotificationResult> {
  try {
    const supabase = await createClient()

    // Verificar que el usuario esté autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[Test] Auth error:', authError)
      return {
        success: false,
        error: 'No autenticado'
      }
    }

    console.log('[Test] Sending test notification to user:', user.id)

    // Enviar notificación usando el servicio (que usa Service Role Key)
    const result = await sendPushNotification({
      userId: user.id,
      title: '🧪 Notificación de Prueba',
      body: 'Si ves esto, ¡las notificaciones funcionan! 🎉',
      url: '/test-notifications',
      tag: 'test',
      icon: '/icon.svg'
    })

    if (!result) {
      return {
        success: false,
        error: 'Error al enviar notificación'
      }
    }

    console.log('[Test] Notification sent successfully')
    return { success: true }

  } catch (error) {
    console.error('[Test] Error sending notification:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}
