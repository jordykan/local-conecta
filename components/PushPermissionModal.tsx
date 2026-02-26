'use client'

import { useState } from 'react'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { IconBell, IconBellOff, IconLoader2 } from '@tabler/icons-react'
import { toast } from 'sonner'

interface PushPermissionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PushPermissionModal({ open, onOpenChange }: PushPermissionModalProps) {
  const { requestPermission, isLoading, error, isSupported } = usePushNotifications()
  const [hasRequested, setHasRequested] = useState(false)

  const handleEnableNotifications = async () => {
    setHasRequested(true)
    const success = await requestPermission()

    if (success) {
      toast.success('Notificaciones activadas', {
        description: 'Recibirás notificaciones sobre reservas y mensajes'
      })
      onOpenChange(false)
    } else if (error) {
      toast.error('Error al activar notificaciones', {
        description: error
      })
    }
  }

  if (!isSupported) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconBellOff className="h-5 w-5 text-orange-600" />
              Notificaciones no disponibles
            </DialogTitle>
            <DialogDescription>
              Tu navegador no soporta notificaciones push. Te recomendamos usar Chrome, Firefox o Safari actualizado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconBell className="h-5 w-5 text-orange-600" />
            Activar notificaciones
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p>
              Mantente informado sobre tus reservas y mensajes en tiempo real.
            </p>
            <div className="rounded-lg bg-orange-50 p-3 text-sm dark:bg-orange-950/30">
              <p className="font-medium text-orange-900 dark:text-orange-100">
                Recibirás notificaciones para:
              </p>
              <ul className="mt-2 space-y-1 text-orange-800 dark:text-orange-200">
                <li>• Nuevas reservas recibidas</li>
                <li>• Confirmación de reservas</li>
                <li>• Nuevos mensajes</li>
                <li>• Reseñas y respuestas</li>
              </ul>
            </div>
            {error && hasRequested && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
                {error}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Ahora no
          </Button>
          <Button
            onClick={handleEnableNotifications}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Activando...
              </>
            ) : (
              'Activar notificaciones'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
