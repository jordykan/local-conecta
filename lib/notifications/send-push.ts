/**
 * Helper para enviar notificaciones push a usuarios
 * Llama a la Edge Function send-notification
 */

import { createClient } from '@/lib/supabase/server'

interface SendNotificationParams {
  userId: string
  title: string
  body: string
  url: string
  tag?: string
  icon?: string
}

export async function sendPushNotification({
  userId,
  title,
  body,
  url,
  tag,
  icon = '/icons/icon-192x192.png'
}: SendNotificationParams) {
  try {
    const supabase = await createClient()

    // Obtener la sesión del usuario actual (para el token)
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      console.error('[sendPushNotification] No session found')
      return { success: false, error: 'No session' }
    }

    const url_endpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-notification`

    const response = await fetch(url_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      },
      body: JSON.stringify({
        userId,
        title,
        body,
        url,
        tag,
        icon
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[sendPushNotification] Error:', error)
      return { success: false, error: error.error }
    }

    const result = await response.json()
    console.log('[sendPushNotification] Success:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('[sendPushNotification] Exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ============================================================
// HELPERS ESPECÍFICOS POR TIPO DE NOTIFICACIÓN
// ============================================================

/**
 * Notificar al dueño del negocio sobre una nueva reserva
 */
export async function notifyNewBooking(params: {
  businessOwnerId: string
  businessName: string
  customerName: string
  bookingId: string
}) {
  return sendPushNotification({
    userId: params.businessOwnerId,
    title: 'Nueva reserva recibida',
    body: `${params.customerName} hizo una reserva en ${params.businessName}`,
    url: `/dashboard/reservations/${params.bookingId}`,
    tag: 'new-booking',
    icon: '/icons/icon-192x192.png'
  })
}

/**
 * Notificar al cliente que su reserva fue confirmada
 */
export async function notifyBookingConfirmed(params: {
  customerId: string
  businessName: string
  bookingId: string
  dateTime: string
}) {
  return sendPushNotification({
    userId: params.customerId,
    title: 'Reserva confirmada',
    body: `Tu reserva en ${params.businessName} para el ${params.dateTime} ha sido confirmada`,
    url: `/reservations/${params.bookingId}`,
    tag: 'booking-confirmed',
    icon: '/icons/icon-192x192.png'
  })
}

/**
 * Notificar al cliente que su reserva fue cancelada
 */
export async function notifyBookingCancelled(params: {
  customerId: string
  businessName: string
  bookingId: string
}) {
  return sendPushNotification({
    userId: params.customerId,
    title: 'Reserva cancelada',
    body: `Tu reserva en ${params.businessName} ha sido cancelada`,
    url: `/reservations/${params.bookingId}`,
    tag: 'booking-cancelled',
    icon: '/icons/icon-192x192.png'
  })
}

/**
 * Notificar sobre un nuevo mensaje
 */
export async function notifyNewMessage(params: {
  recipientId: string
  senderName: string
  messagePreview: string
  conversationId: string
}) {
  return sendPushNotification({
    userId: params.recipientId,
    title: `Mensaje de ${params.senderName}`,
    body: params.messagePreview,
    url: `/messages/${params.conversationId}`,
    tag: 'new-message',
    icon: '/icons/icon-192x192.png'
  })
}

/**
 * Notificar al negocio sobre una nueva reseña
 */
export async function notifyNewReview(params: {
  businessOwnerId: string
  reviewerName: string
  rating: number
  businessName: string
  reviewId: string
}) {
  const stars = '⭐'.repeat(params.rating)

  return sendPushNotification({
    userId: params.businessOwnerId,
    title: 'Nueva reseña recibida',
    body: `${params.reviewerName} dejó una reseña ${stars} en ${params.businessName}`,
    url: `/dashboard/reviews/${params.reviewId}`,
    tag: 'new-review',
    icon: '/icons/icon-192x192.png'
  })
}

/**
 * Notificar al usuario que el negocio respondió su reseña
 */
export async function notifyReviewResponse(params: {
  reviewerId: string
  businessName: string
  reviewId: string
}) {
  return sendPushNotification({
    userId: params.reviewerId,
    title: 'Respuesta a tu reseña',
    body: `${params.businessName} respondió a tu reseña`,
    url: `/reviews/${params.reviewId}`,
    tag: 'review-response',
    icon: '/icons/icon-192x192.png'
  })
}

/**
 * Notificar a usuarios que tienen el negocio en favoritos sobre una nueva promoción
 */
export async function notifyNewPromotion(params: {
  businessName: string
  promotionTitle: string
  promotionId: string
  businessId: string
}) {
  // Esta función se llamará para cada usuario que tenga el negocio en favoritos
  // El businessId se usa para consultar la tabla de favoritos

  const supabase = await createClient()

  // Obtener todos los usuarios que tienen este negocio en favoritos
  const { data: favorites } = await supabase
    .from('favorites')
    .select('user_id')
    .eq('business_id', params.businessId)

  if (!favorites || favorites.length === 0) {
    return { success: true, message: 'No users have this business in favorites' }
  }

  // Enviar notificación a cada usuario
  const results = await Promise.all(
    favorites.map(({ user_id }) =>
      sendPushNotification({
        userId: user_id,
        title: `Nueva promoción en ${params.businessName}`,
        body: params.promotionTitle,
        url: `/businesses/${params.businessId}/promotions/${params.promotionId}`,
        tag: 'new-promotion',
        icon: '/icons/icon-192x192.png'
      })
    )
  )

  return {
    success: true,
    sent: results.filter(r => r.success).length,
    total: favorites.length
  }
}
