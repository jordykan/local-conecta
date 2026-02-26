'use client'

import { useEffect, useState } from 'react'
import { usePWA } from '@/lib/hooks/usePWA'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'
import { toast } from 'sonner'

/**
 * Componente que solicita permisos de notificaciones automáticamente
 * Solo solicita si:
 * 1. La app está instalada como PWA (standalone)
 * 2. El usuario no ha dado permisos aún
 * 3. Han pasado algunos segundos desde que se cargó la app
 */
export function PushNotificationManager() {
  const { isStandalone } = usePWA()
  const { permission, isSupported, requestPermission } = usePushNotifications()
  const [hasRequested, setHasRequested] = useState(false)

  useEffect(() => {
    // Log para diagnóstico
    console.log('[PushNotificationManager] State:', {
      isStandalone,
      isSupported,
      permission,
      hasRequested
    })

    // Solo solicitar permisos si:
    // - La app está instalada (standalone mode)
    // - El navegador soporta notificaciones
    // - El usuario no ha dado permisos aún (default)
    // - No hemos solicitado ya en esta sesión
    if (isStandalone && isSupported && permission === 'default' && !hasRequested) {
      // Esperar 3 segundos antes de solicitar permisos
      const timer = setTimeout(async () => {
        console.log('[PushNotificationManager] Requesting push notification permission...')
        setHasRequested(true)

        const success = await requestPermission()

        if (success) {
          toast.success('Notificaciones activadas', {
            description: 'Recibirás notificaciones sobre reservas y mensajes'
          })
        }
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isStandalone, isSupported, permission, hasRequested, requestPermission])

  // Este componente no renderiza nada
  return null
}
