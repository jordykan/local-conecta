// Service Worker para Local Conecta PWA
const CACHE_NAME = 'local-conecta-v2'
const STATIC_CACHE = 'local-conecta-static-v2'
const DYNAMIC_CACHE = 'local-conecta-dynamic-v2'

// Assets estáticos a cachear en la instalación
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/icon.svg',
  '/manifest.json'
]

// Instalación: cachear assets estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    }).then(() => {
      console.log('[SW] Skip waiting')
      return self.skipWaiting()
    })
  )
})

// Activación: limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key)
            return caches.delete(key)
          })
      )
    }).then(() => {
      console.log('[SW] Claiming clients')
      return self.clients.claim()
    })
  )
})

// Fetch: estrategia network-first con fallback a caché
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Solo cachear requests del mismo origen
  if (url.origin !== location.origin) {
    return
  }

  // Estrategia: Network First con fallback a caché
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Si la respuesta es válida, cachearla en dynamic cache
        if (response && response.status === 200) {
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // Si falla network, intentar desde caché
        return caches.match(request).then((cached) => {
          if (cached) {
            return cached
          }

          // Si es navegación y no hay caché, mostrar página offline
          if (request.destination === 'document') {
            return caches.match('/offline.html')
          }

          // Para otros recursos, retornar error
          return new Response('Network error', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          })
        })
      })
  )
})

// Push: mostrar notificación
self.addEventListener('push', (event) => {
  console.log('[SW] ========================================')
  console.log('[SW] Push notification received!')
  console.log('[SW] Event data:', event.data)
  console.log('[SW] Has data:', !!event.data)

  let data = {
    title: 'Local Conecta',
    body: 'Tienes una nueva notificación',
    icon: '/icon.svg',
    badge: '/icon.svg',
    url: '/'
  }

  if (event.data) {
    try {
      const parsed = event.data.json()
      console.log('[SW] Parsed data:', parsed)
      data = parsed
    } catch (e) {
      console.error('[SW] Error parsing push data:', e)
      console.log('[SW] Raw text:', event.data.text())
    }
  }

  console.log('[SW] Notification data:', data)

  const options = {
    body: data.body,
    icon: data.icon || '/icon.svg',
    badge: data.badge || '/icon.svg',
    data: {
      url: data.url || '/'
    },
    vibrate: [200, 100, 200],
    tag: data.tag || 'default',
    requireInteraction: true // Changed to true for testing
  }

  console.log('[SW] Showing notification with options:', options)

  event.waitUntil(
    self.registration.showNotification(data.title, options)
      .then(() => console.log('[SW] Notification shown successfully'))
      .catch(err => console.error('[SW] Error showing notification:', err))
  )
})

// Notification Click: abrir URL
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked')

  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Si ya hay una ventana abierta con la URL, enfocarla
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }

      // Si no, abrir nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Background Sync (futuro)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)

  if (event.tag === 'sync-messages') {
    event.waitUntil(
      // Aquí se pueden sincronizar mensajes offline
      Promise.resolve()
    )
  }
})
