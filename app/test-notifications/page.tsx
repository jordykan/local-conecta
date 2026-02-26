'use client'

import { usePushNotifications } from '@/lib/hooks/usePushNotifications'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconBell } from '@tabler/icons-react'
import { toast } from 'sonner'

export default function TestNotificationsPage() {
  const { permission, isSupported, requestPermission, subscription } = usePushNotifications()

  const handleRequest = async () => {
    console.log('[Test] Requesting permission...')
    const success = await requestPermission()

    if (success) {
      toast.success('Permisos concedidos!')
    } else {
      toast.error('Permisos denegados o error')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBell className="h-5 w-5" />
            Prueba de Notificaciones Push
          </CardTitle>
          <CardDescription>
            Página de prueba para solicitar y verificar permisos de notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Soporte:</span>
              <span className="text-sm">{isSupported ? '✅ Soportado' : '❌ No soportado'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estado:</span>
              <span className="text-sm">
                {permission === 'granted' && '✅ Concedido'}
                {permission === 'denied' && '❌ Denegado'}
                {permission === 'default' && '⏳ Pendiente'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Suscripción:</span>
              <span className="text-sm">{subscription ? '✅ Activa' : '❌ No activa'}</span>
            </div>
          </div>

          <Button onClick={handleRequest} className="w-full" disabled={!isSupported}>
            Solicitar Permisos de Notificación
          </Button>

          {permission === 'denied' && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
              Los permisos fueron denegados. Para habilitarlos:
              <ul className="mt-2 ml-4 list-disc">
                <li>Ve a Configuración → Safari → Sitios web</li>
                <li>Busca "Notificaciones"</li>
                <li>Cambia el permiso para este sitio</li>
              </ul>
            </div>
          )}

          {subscription && (
            <div className="rounded-lg bg-green-50 p-3 text-xs dark:bg-green-950/30">
              <p className="font-medium text-green-900 dark:text-green-100">Endpoint:</p>
              <p className="mt-1 break-all text-green-800 dark:text-green-200">
                {subscription.endpoint.substring(0, 60)}...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
