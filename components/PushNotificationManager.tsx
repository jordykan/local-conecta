'use client'

import { useEffect, useState } from 'react'
import { usePWA } from '@/lib/hooks/usePWA'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'
import { PushPermissionModal } from './PushPermissionModal'

/**
 * Componente que maneja automáticamente el modal de permisos de notificaciones
 * Solo se muestra si:
 * 1. La app está instalada como PWA (standalone)
 * 2. El usuario no ha dado permisos aún
 * 3. Han pasado algunos segundos desde que se cargó la app
 */
export function PushNotificationManager() {
  const { isStandalone } = usePWA()
  const { permission, isSupported } = usePushNotifications()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Solo mostrar modal si:
    // - La app está instalada (standalone mode)
    // - El navegador soporta notificaciones
    // - El usuario no ha dado permisos (default) o los denegó previamente
    if (isStandalone && isSupported && permission === 'default') {
      // Esperar 5 segundos antes de mostrar el modal
      const timer = setTimeout(() => {
        setShowModal(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isStandalone, isSupported, permission])

  return <PushPermissionModal open={showModal} onOpenChange={setShowModal} />
}
