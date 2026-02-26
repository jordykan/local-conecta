'use client'

import { usePushNotifications } from '@/lib/hooks/usePushNotifications'
import { usePWA } from '@/lib/hooks/usePWA'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconBell, IconRefresh } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestNotificationsPage() {
  const { permission, isSupported, requestPermission, subscription, error } = usePushNotifications()
  const { isStandalone } = usePWA()
  const [userId, setUserId] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
      console.log('[Test] User ID:', user?.id)
    }
    checkUser()

    // Capturar logs de consola
    const originalLog = console.log
    const originalError = console.error

    console.log = (...args) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')
      if (message.includes('[Push]') || message.includes('[Test]')) {
        setLogs(prev => [...prev.slice(-20), `[LOG] ${message}`])
      }
      originalLog(...args)
    }

    console.error = (...args) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')
      if (message.includes('[Push]') || message.includes('[Test]')) {
        setLogs(prev => [...prev.slice(-20), `[ERROR] ${message}`])
      }
      originalError(...args)
    }

    return () => {
      console.log = originalLog
      console.error = originalError
    }
  }, [])

  const handleRequest = async () => {
    console.log('[Test] Requesting permission...')
    const success = await requestPermission()

    if (success) {
      toast.success('Permisos concedidos y suscripción guardada!')
    } else {
      toast.error('Error al solicitar permisos')
    }
  }

  const handleRefresh = () => {
    window.location.reload()
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
              <span className="text-sm font-medium">Usuario:</span>
              <span className="text-sm">{userId ? `✅ ${userId.substring(0, 8)}...` : '❌ No autenticado'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">PWA Instalada:</span>
              <span className="text-sm">{isStandalone ? '✅ Sí (standalone)' : '❌ No (browser)'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Soporte:</span>
              <span className="text-sm">{isSupported ? '✅ Soportado' : '❌ No soportado'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Permisos:</span>
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

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
              <p className="font-medium">Error:</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleRequest} className="flex-1" disabled={!isSupported}>
              Solicitar Permisos
            </Button>
            <Button onClick={handleRefresh} variant="outline" size="icon">
              <IconRefresh className="h-4 w-4" />
            </Button>
          </div>

          {logs.length > 0 && (
            <div className="rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-950/30">
              <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">Logs de consola:</p>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className={`font-mono ${log.startsWith('[ERROR]') ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

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
