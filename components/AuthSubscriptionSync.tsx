'use client'

import { useEffect } from 'react'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'
import { createClient } from '@/lib/supabase/client'

/**
 * Componente que sincroniza la suscripción push cuando el usuario inicia sesión
 *
 * Escenario:
 * 1. Usuario instala PWA sin estar logueado
 * 2. Acepta permisos de notificaciones
 * 3. Se guarda localmente que tiene permiso concedido
 * 4. Cuando el usuario inicia sesión, este componente detecta el evento
 * 5. Suscribe automáticamente al usuario a push notifications
 */
export function AuthSubscriptionSync() {
  const { subscribe, isSubscribed, permission } = usePushNotifications()
  const supabase = createClient()

  useEffect(() => {
    let isProcessing = false // Evitar múltiples intentos simultáneos

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthSubscriptionSync] Auth event:', event)

        // Solo actuar cuando el usuario inicia sesión
        if (event === 'SIGNED_IN' && session) {
          console.log('[AuthSubscriptionSync] User signed in, checking pending subscription...')

          // Verificar si hay una suscripción pendiente
          const hasPendingSubscription = localStorage.getItem('push_subscription_pending') === 'true'
          const hasPermission = permission === 'granted' ||
                               localStorage.getItem('push_permission_granted') === 'true'

          console.log('[AuthSubscriptionSync] State:', {
            hasPendingSubscription,
            hasPermission,
            isSubscribed,
            isProcessing
          })

          // Si tiene permiso pero no está suscrito, y no estamos procesando ya
          if (hasPermission && !isSubscribed && !isProcessing) {
            isProcessing = true
            console.log('[AuthSubscriptionSync] Subscribing user to push notifications...')

            const success = await subscribe()

            if (success) {
              console.log('[AuthSubscriptionSync] ✓ Subscription successful')
              // Limpiar flags locales
              localStorage.removeItem('push_subscription_pending')
            } else {
              console.error('[AuthSubscriptionSync] ✗ Subscription failed')
            }

            isProcessing = false
          } else if (isSubscribed) {
            console.log('[AuthSubscriptionSync] Already subscribed, skipping')
            // Limpiar flag pendiente si ya está suscrito
            localStorage.removeItem('push_subscription_pending')
          }
        }

        // Limpiar subscription pendiente cuando el usuario cierra sesión
        if (event === 'SIGNED_OUT') {
          console.log('[AuthSubscriptionSync] User signed out, clearing pending subscription')
          localStorage.removeItem('push_subscription_pending')
          isProcessing = false
        }
      }
    )

    // Cleanup
    return () => {
      authSubscription.unsubscribe()
    }
  }, [subscribe, isSubscribed, permission])

  // Este componente no renderiza nada
  return null
}
