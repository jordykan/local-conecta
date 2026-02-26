'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PushNotificationState {
  permission: NotificationPermission
  subscription: PushSubscription | null
  isSupported: boolean
  isLoading: boolean
  error: string | null
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    permission: 'default',
    subscription: null,
    isSupported: false,
    isLoading: false,
    error: null
  })

  const supabase = createClient()

  useEffect(() => {
    // Verificar si el navegador soporta Push Notifications
    const checkSupport = () => {
      const supported =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window

      setState(prev => ({
        ...prev,
        isSupported: supported,
        permission: supported ? Notification.permission : 'denied'
      }))
    }

    checkSupport()

    // Cargar subscription existente si la hay
    if (state.isSupported) {
      loadExistingSubscription()
    }
  }, [])

  const loadExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        setState(prev => ({
          ...prev,
          subscription,
          permission: Notification.permission
        }))
      }
    } catch (error) {
      console.error('[Push] Error loading existing subscription:', error)
    }
  }

  const requestPermission = async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Tu navegador no soporta notificaciones push'
      }))
      return false
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      const permission = await Notification.requestPermission()

      setState(prev => ({ ...prev, permission }))

      if (permission === 'granted') {
        await subscribe()
        return true
      }

      setState(prev => ({
        ...prev,
        error: permission === 'denied'
          ? 'Has bloqueado las notificaciones. Puedes habilitarlas en la configuración de tu navegador.'
          : 'Necesitas otorgar permisos para recibir notificaciones'
      }))

      return false
    } catch (error) {
      console.error('[Push] Error requesting permission:', error)
      setState(prev => ({
        ...prev,
        error: 'Error al solicitar permisos de notificaciones'
      }))
      return false
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const subscribe = async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.error('[Push] Push notifications not supported')
      return false
    }

    if (Notification.permission !== 'granted') {
      console.error('[Push] Permission not granted')
      return false
    }

    try {
      console.log('[Push] Starting subscription process...')
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      console.log('[Push] Waiting for service worker...')
      const registration = await navigator.serviceWorker.ready
      console.log('[Push] Service worker ready')

      // Verificar si ya existe una subscription
      let subscription = await registration.pushManager.getSubscription()
      console.log('[Push] Existing subscription:', !!subscription)

      if (!subscription) {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        console.log('[Push] VAPID key configured:', !!vapidPublicKey)

        if (!vapidPublicKey) {
          throw new Error('VAPID public key not configured')
        }

        // Crear nueva subscription
        console.log('[Push] Creating new subscription...')
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        })
        console.log('[Push] New subscription created')
      }

      // Guardar subscription en Supabase
      console.log('[Push] Getting auth session...')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[Push] Session exists:', !!session)

      if (!session) {
        throw new Error('Usuario no autenticado')
      }

      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/subscribe-push`
      console.log('[Push] Sending subscription to:', url)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          accessToken: session.access_token // Send token in body as fallback for iOS
        })
      })

      console.log('[Push] Response status:', response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error('[Push] Server error:', error)
        throw new Error(error.error || 'Error al guardar subscription')
      }

      const result = await response.json()
      console.log('[Push] Server response:', result)

      setState(prev => ({
        ...prev,
        subscription,
        error: null
      }))

      console.log('[Push] Subscribed successfully')
      return true
    } catch (error) {
      console.error('[Push] Error subscribing:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al suscribirse a notificaciones'
      }))
      return false
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const unsubscribe = async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()

        // Eliminar de Supabase
        const endpoint = subscription.endpoint
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('subscription->>endpoint', endpoint)

        setState(prev => ({
          ...prev,
          subscription: null,
          error: null
        }))

        console.log('[Push] Unsubscribed successfully')
        return true
      }

      return false
    } catch (error) {
      console.error('[Push] Error unsubscribing:', error)
      setState(prev => ({
        ...prev,
        error: 'Error al cancelar suscripción de notificaciones'
      }))
      return false
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    isSubscribed: !!state.subscription
  }
}

// Utility function para convertir VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray as BufferSource
}
