'use client'

import { useEffect } from 'react'
import { usePWA } from '@/lib/hooks/usePWA'

export function PWAInitializer() {
  const { isInstalled, isStandalone } = usePWA()

  useEffect(() => {
    console.log('[PWA] Initialized - Installed:', isInstalled, 'Standalone:', isStandalone)
  }, [isInstalled, isStandalone])

  // Este componente no renderiza nada, solo inicializa el PWA
  return null
}
