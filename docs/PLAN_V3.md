# Local Conecta — Plan V3: Tiempo Real y PWA (Fase 3)

> Fase 2 completa. Este documento define la Fase 3 enfocada en funcionalidades de tiempo real y aplicación web progresiva.

---

## Estado Actual (MVP + Fase 2 Completados)

### MVP (Fase 1)
- ✅ Auth (email + Google OAuth)
- ✅ Directorio de negocios con búsqueda y filtros
- ✅ Perfiles públicos de negocio
- ✅ Dashboard del negocio (perfil, horarios, productos/servicios)
- ✅ Sistema de reservas (crear, confirmar, completar, cancelar)
- ✅ Mensajería bidireccional (usuario ↔ negocio)
- ✅ Upload de imágenes (Supabase Storage)
- ✅ Registro multi-step con límite de 1 negocio/usuario

### Fase 2
- ✅ Promociones y anuncios (CRUD, badges, filtros)
- ✅ Reseñas y calificaciones (rating, comentarios, respuesta del dueño)
- ✅ Sistema de favoritos (guardar negocios)
- ✅ Panel de Administración (gestión de negocios pendientes, categorías, estadísticas)
- ✅ Dashboard analítico básico
- ⏸️ Mapa Interactivo (postponed para versión futura)

---

## Fase 3 — Tiempo Real y PWA (6-8 semanas)

### 3.2 Chat en Tiempo Real
> Prioridad: **Alta** — Mejora significativa en UX de mensajería.

**Funcionalidad:**
- Migrar de polling a Supabase Realtime para mensajes instantáneos
- Indicador de "escribiendo..." en tiempo real
- Notificaciones in-app cuando llega un mensaje nuevo
- Badge con contador de mensajes no leídos en navbar
- Marcado automático de mensajes como leídos
- Presencia online (indicador de usuario conectado)

**Arquitectura Técnica:**

**1. Supabase Realtime Setup**
- Habilitar Realtime en tablas `messages` y `message_threads`
- Crear broadcast channel para indicador de "escribiendo..."
- Configurar presence channel para estado online

**2. Modelo de Datos (modificaciones):**
```sql
-- Agregar campo de mensajes no leídos
ALTER TABLE messages
ADD COLUMN read_at timestamptz;

-- Índice para queries de mensajes no leídos
CREATE INDEX idx_messages_unread
ON messages(recipient_id, read_at)
WHERE read_at IS NULL;

-- Función para contar mensajes no leídos por usuario
CREATE OR REPLACE FUNCTION get_unread_count(user_uuid uuid)
RETURNS bigint AS $$
  SELECT COUNT(*)
  FROM messages
  WHERE recipient_id = user_uuid AND read_at IS NULL;
$$ LANGUAGE sql SECURITY DEFINER;
```

**3. Hooks y Contexto:**
```
lib/hooks/
├── useRealtimeMessages.ts      # Hook para suscripción a mensajes
├── useTypingIndicator.ts       # Hook para "escribiendo..."
├── useUnreadCount.ts           # Hook para contador de no leídos
└── usePresence.ts              # Hook para estado online

lib/contexts/
└── RealtimeContext.tsx         # Provider global para conexiones Realtime
```

**4. Componentes a Modificar:**
```
components/dashboard/
├── DashboardMessageThread.tsx  # + Realtime subscription
└── DashboardSidebar.tsx        # + Badge con contador

components/account/
└── MessageThread.tsx           # + Realtime subscription

components/shared/
├── Navbar.tsx                  # + Badge de mensajes no leídos
├── TypingIndicator.tsx         # Nuevo componente
└── UnreadBadge.tsx             # Nuevo componente
```

**5. Flujo de Implementación:**

**Semana 1: Fundamentos**
- Configurar Supabase Realtime en proyecto
- Crear `RealtimeContext` y provider
- Implementar `useRealtimeMessages` hook
- Migrar `MessageThread` a usar Realtime

**Semana 2: Indicadores**
- Implementar broadcast channel para "escribiendo..."
- Crear `TypingIndicator` component
- Agregar campo `read_at` a tabla messages
- Implementar marcado de leído automático

**Semana 3: Contador de No Leídos**
- Crear función `get_unread_count` en Supabase
- Implementar `useUnreadCount` hook con Realtime
- Agregar badge en navbar
- Agregar badge en sidebar del dashboard

**Ejemplo de Código:**
```typescript
// lib/hooks/useRealtimeMessages.ts
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/lib/types/database'

export function useRealtimeMessages(threadId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [threadId, supabase])

  return messages
}
```

---

### 3.4 PWA y Notificaciones Push
> Prioridad: **Alta** — Experiencia mobile-first completa.

**Funcionalidad:**
- Service Worker para funcionamiento offline básico
- Caché de assets estáticos y páginas visitadas
- Web Push Notifications para eventos críticos
- Banner "Agregar a pantalla de inicio"
- Ícono de app y splash screen
- Modo standalone en dispositivos móviles

**Notificaciones Push:**
- **Para Negocios:**
  - Nueva reserva recibida
  - Nuevo mensaje de cliente
  - Nueva reseña recibida

- **Para Usuarios:**
  - Reserva confirmada por negocio
  - Reserva cancelada
  - Respuesta a mensaje
  - Respuesta del negocio a tu reseña

**Arquitectura Técnica:**

**1. PWA Setup**
```
public/
├── manifest.json              # App manifest
├── sw.js                      # Service worker
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
└── screenshots/
    ├── screenshot-mobile.png
    └── screenshot-desktop.png
```

**2. Manifest.json:**
```json
{
  "name": "Local Conecta",
  "short_name": "Local Conecta",
  "description": "Conecta con negocios locales de tu comunidad",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ea580c",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**3. Service Worker (sw.js):**
```javascript
// Caché de assets estáticos
const CACHE_NAME = 'local-conecta-v1'
const STATIC_ASSETS = [
  '/',
  '/businesses',
  '/offline.html',
  '/icons/icon-192x192.png'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/offline.html')
        }
      })
    })
  )
})

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json()
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: data.url
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data)
  )
})
```

**4. Web Push Setup (usando Supabase Edge Functions):**
```
supabase/functions/
├── send-notification/
│   └── index.ts              # Edge Function para enviar push
└── subscribe-push/
    └── index.ts              # Guardar subscription del usuario
```

**5. Modelo de Datos (nueva tabla):**
```sql
CREATE TABLE push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription jsonb NOT NULL,  -- Web Push subscription object
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, subscription)
);

-- Tabla de preferencias de notificaciones
CREATE TABLE notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notify_new_booking boolean DEFAULT true,
  notify_booking_confirmed boolean DEFAULT true,
  notify_booking_cancelled boolean DEFAULT true,
  notify_new_message boolean DEFAULT true,
  notify_new_review boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);
```

**6. Componentes y Hooks:**
```
lib/hooks/
├── usePWA.ts                   # Hook para detectar PWA y mostrar banner
└── usePushNotifications.ts     # Hook para manejar subscripción

components/shared/
├── InstallPrompt.tsx           # Banner de instalación
├── PushPermissionModal.tsx     # Modal para pedir permiso
└── NotificationSettings.tsx    # Configuración de notificaciones

app/settings/
└── notifications/
    └── page.tsx                # Página de config de notificaciones
```

**7. Flujo de Implementación:**

**Semana 1: PWA Básico**
- Crear manifest.json con metadata
- Generar iconos en todos los tamaños necesarios
- Implementar service worker básico con caché
- Agregar meta tags en layout.tsx
- Crear página offline.html
- Probar instalación en Chrome/Safari

**Semana 2: Service Worker Avanzado**
- Implementar estrategia de caché (network-first para API)
- Precarga de assets críticos
- Limpieza de caché antiguo
- Testing de offline mode
- Implementar `InstallPrompt` component

**Semana 3: Web Push Setup**
- Generar VAPID keys
- Crear Edge Function `send-notification`
- Crear Edge Function `subscribe-push`
- Implementar tabla `push_subscriptions`
- Crear `usePushNotifications` hook

**Semana 4: Integración de Notificaciones**
- Modificar server actions de reservas para enviar push
- Modificar server actions de mensajes para enviar push
- Crear `NotificationSettings` page
- Implementar tabla `notification_preferences`
- Testing end-to-end de notificaciones

**Ejemplo de Código:**
```typescript
// lib/hooks/usePushNotifications.ts
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const supabase = createClient()

  const requestPermission = async () => {
    const result = await Notification.requestPermission()
    setPermission(result)

    if (result === 'granted') {
      await subscribe()
    }
  }

  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.error('Push notifications not supported')
      return
    }

    const registration = await navigator.serviceWorker.ready
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    })

    // Guardar subscription en Supabase
    await supabase.from('push_subscriptions').upsert({
      subscription: sub.toJSON()
    })

    setSubscription(sub)
  }

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  return {
    permission,
    subscription,
    requestPermission,
    subscribe
  }
}
```

```typescript
// supabase/functions/send-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface NotificationPayload {
  userId: string
  title: string
  body: string
  url: string
}

serve(async (req) => {
  const { userId, title, body, url }: NotificationPayload = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Obtener subscriptions del usuario
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', userId)

  if (!subs) {
    return new Response('No subscriptions found', { status: 404 })
  }

  // Enviar notificación a cada subscription
  const results = await Promise.all(
    subs.map(async ({ subscription }) => {
      try {
        await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${Deno.env.get('WEB_PUSH_PRIVATE_KEY')}`
          },
          body: JSON.stringify({
            notification: { title, body },
            to: subscription.endpoint,
            data: { url }
          })
        })
        return { success: true }
      } catch (error) {
        return { success: false, error }
      }
    })
  )

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

**8. Configuración en layout.tsx:**
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: 'Local Conecta',
  description: 'Conecta con negocios locales de tu comunidad',
  manifest: '/manifest.json',
  themeColor: '#ea580c',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Local Conecta'
  }
}
```

---

## Orden de Implementación (Fase 3)

```
Semanas 1-3: Chat en Tiempo Real
├── Supabase Realtime setup
├── Migración de polling a Realtime
├── Indicador de "escribiendo..."
├── Marcado de mensajes como leídos
└── Badge de mensajes no leídos

Semanas 4-6: PWA Básico
├── Manifest y service worker
├── Iconos y assets
├── Caché offline
├── Banner de instalación
└── Testing en múltiples dispositivos

Semanas 7-8: Notificaciones Push
├── Web Push setup (VAPID keys)
├── Edge Functions para envío
├── Integración con eventos de la app
├── Preferencias de notificaciones
└── Testing end-to-end
```

---

## Dependencias Nuevas

```bash
# No se necesitan dependencias adicionales para Supabase Realtime
# (ya incluido en @supabase/supabase-js)

# Para generar iconos PWA
npm install -D pwa-asset-generator

# Para generar VAPID keys (one-time)
npx web-push generate-vapid-keys
```

---

## Configuración de Supabase

### 1. Habilitar Realtime en Tablas
```sql
-- En Supabase Dashboard > Database > Replication
-- Habilitar Realtime para:
- messages
- message_threads
```

### 2. Variables de Entorno
```env
# .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY="tu-vapid-public-key"
WEB_PUSH_PRIVATE_KEY="tu-vapid-private-key"
```

---

## Testing Checklist

### Chat en Tiempo Real
- [ ] Mensaje se muestra instantáneamente al destinatario
- [ ] Indicador "escribiendo..." funciona correctamente
- [ ] Badge de mensajes no leídos se actualiza en tiempo real
- [ ] Mensajes se marcan como leídos automáticamente
- [ ] No hay memory leaks en subscripciones Realtime

### PWA
- [ ] App se instala correctamente en Android (Chrome)
- [ ] App se instala correctamente en iOS (Safari)
- [ ] Iconos se muestran correctamente en home screen
- [ ] App funciona en modo offline (páginas cacheadas)
- [ ] Splash screen se muestra al abrir
- [ ] Modo standalone funciona sin barra de navegador

### Notificaciones Push
- [ ] Usuario puede otorgar/denegar permisos
- [ ] Notificación llega cuando hay nueva reserva
- [ ] Notificación llega cuando hay nuevo mensaje
- [ ] Click en notificación abre la página correcta
- [ ] Preferencias de notificaciones se respetan
- [ ] Notificaciones NO se envían si usuario las desactivó

---

## Notas Técnicas

- **Supabase Realtime** tiene límite de conexiones concurrentes en el plan free (200). Para producción considerar upgrade.
- **Service Worker** debe estar en la raíz (`/sw.js`) o configurar scope correctamente.
- **VAPID Keys** deben generarse una sola vez y guardarse de forma segura (no regenerar).
- **iOS Safari** tiene limitaciones con PWAs (no soporta push notifications en iOS < 16.4).
- **Testing local** de push notifications requiere HTTPS (usar `ngrok` o `localhost`).
- **Web Push** es diferente de Firebase Cloud Messaging (FCM), pero compatible.

---

## Recursos y Referencias

### Supabase Realtime
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Realtime Broadcast](https://supabase.com/docs/guides/realtime/broadcast)
- [Realtime Presence](https://supabase.com/docs/guides/realtime/presence)

### PWA
- [web.dev - PWA Checklist](https://web.dev/pwa-checklist/)
- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Next.js PWA Examples](https://github.com/vercel/next.js/tree/canary/examples/progressive-web-app)

### Web Push
- [web.dev - Push Notifications](https://web.dev/push-notifications-overview/)
- [MDN - Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [VAPID Keys Generator](https://vapidkeys.com/)

---

## Métricas de Éxito

### Chat en Tiempo Real
- Reducir latencia de mensajes de ~5s (polling) a <1s (realtime)
- 90%+ de mensajes entregados instantáneamente
- Usuarios reportan mejor experiencia de chat

### PWA
- 40%+ de usuarios móviles instalan la app
- 30%+ de sesiones desde app instalada
- Bounce rate disminuye 20% en modo standalone

### Notificaciones Push
- 60%+ de usuarios otorgan permisos de notificaciones
- 80%+ de notificaciones push son abiertas
- Aumento de 25% en engagement con reservas y mensajes
