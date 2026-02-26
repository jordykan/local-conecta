'use client'

import { useEffect, useState } from 'react'
import { usePWA } from '@/lib/hooks/usePWA'
import { IconX, IconDownload } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

export function InstallPrompt() {
  const { canInstall, promptInstall } = usePWA()
  const [isDismissed, setIsDismissed] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Verificar si el usuario ya descartó el banner anteriormente
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Mostrar banner después de 3 segundos si puede instalar
    if (canInstall) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [canInstall])

  const handleInstall = async () => {
    const accepted = await promptInstall()
    if (accepted) {
      setIsVisible(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    // Guardar en localStorage para no volver a mostrar
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!canInstall || isDismissed || !isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="relative rounded-lg border border-orange-200 bg-white p-4 shadow-lg dark:border-orange-800 dark:bg-gray-900">
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          aria-label="Cerrar"
        >
          <IconX className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <IconDownload className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Instalar Local Conecta
            </h3>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Accede más rápido y recibe notificaciones de reservas y mensajes.
            </p>

            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={handleInstall}
                className="h-8 text-xs"
              >
                Instalar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-8 text-xs"
              >
                Ahora no
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
