# PWA y Push Notifications - Guía de Configuración

## ✅ Implementado

### 1. PWA Básico
- ✅ `manifest.json` configurado con metadata de la app
- ✅ Meta tags de PWA en `layout.tsx`
- ✅ Página offline (`public/offline.html`)
- ✅ Service Worker (`public/sw.js`) con:
  - Caché de assets estáticos
  - Estrategia network-first con fallback
  - Manejo de notificaciones push
  - Click handling de notificaciones
- ✅ Hook `usePWA` para registro y detección de instalación
- ✅ Componente `PWAInitializer` integrado en el layout
- ✅ Componente `InstallPrompt` con banner de instalación

### 2. Push Notifications - Base
- ✅ Edge Functions creadas:
  - `supabase/functions/send-notification/index.ts`
  - `supabase/functions/subscribe-push/index.ts`
- ✅ Migración de base de datos (`005_push_notifications.sql`):
  - Tabla `push_subscriptions`
  - Tabla `notification_preferences`
  - RLS policies configuradas
  - Trigger para crear preferencias por defecto
- ✅ Tipos TypeScript actualizados en `database.ts`
- ✅ Hook `usePushNotifications` para manejar subscripciones
- ✅ Componente `PushPermissionModal` para solicitar permisos
- ✅ Helper `lib/services/push-notifications.ts` para enviar notificaciones desde el servidor

---

## 🔧 Configuración Requerida

### Paso 1: Generar VAPID Keys

```bash
# Instalar dependencia
npm install web-push --save-dev

# Generar keys
node scripts/generate-vapid-keys.js
```

Esto generará un par de claves (pública y privada) que debes copiar en tu `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="tu-clave-publica-aqui"
VAPID_PRIVATE_KEY="tu-clave-privada-aqui"
```

### Paso 2: Configurar Supabase Edge Functions

1. **Subir Edge Functions a Supabase:**
   ```bash
   # Instalar Supabase CLI si no lo tienes
   brew install supabase/tap/supabase

   # Login
   supabase login

   # Link a tu proyecto
   supabase link --project-ref tu-project-ref

   # Deploy functions
   supabase functions deploy send-notification
   supabase functions deploy subscribe-push
   ```

2. **Configurar Secrets en Supabase Dashboard:**
   - Ve a: Dashboard > Edge Functions > Manage secrets
   - Agrega las siguientes variables:
     ```
     VAPID_PUBLIC_KEY=tu-clave-publica
     VAPID_PRIVATE_KEY=tu-clave-privada
     ```

### Paso 3: Ejecutar Migración de Base de Datos

```bash
# Opción 1: Usando Supabase CLI
supabase db push

# Opción 2: Manualmente en Supabase Dashboard
# Copia y ejecuta el contenido de:
# supabase/migrations/005_push_notifications.sql
```

### Paso 4: Generar Iconos PWA

Necesitas crear iconos en múltiples tamaños. Tienes dos opciones:

**Opción A: Automática (recomendada)**
```bash
# Instalar generador
npm install -D pwa-asset-generator

# Generar iconos desde tu logo
npx pwa-asset-generator [tu-logo.png] public/icons \
  --icon-only \
  --background '#ea580c' \
  --type png \
  --padding '10%'
```

**Opción B: Manual**
Crea iconos PNG en estos tamaños en `public/icons/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### Paso 5: Crear Screenshots (Opcional pero recomendado)

Para mejor experiencia en app stores:
- `public/screenshots/screenshot-mobile.png` (540x720)
- `public/screenshots/screenshot-desktop.png` (1280x720)

---

## 📋 Pendientes de Implementación

### 1. Integrar Notificaciones en Server Actions

Actualizar las siguientes server actions para enviar notificaciones:

**`app/dashboard/bookings/actions.ts`:**
```typescript
import { sendNotificationIfEnabled, NOTIFICATION_TYPE } from '@/lib/services/push-notifications'

// En createBooking - notificar al negocio
await sendNotificationIfEnabled({
  userId: business.owner_id,
  title: 'Nueva reserva',
  body: `${user.full_name} ha solicitado una reserva`,
  url: `/dashboard/bookings/${bookingId}`,
  tag: 'booking'
}, 'NEW_BOOKING')

// En confirmBooking - notificar al usuario
await sendNotificationIfEnabled({
  userId: booking.user_id,
  title: 'Reserva confirmada',
  body: `Tu reserva en ${business.name} ha sido confirmada`,
  url: `/account/bookings/${bookingId}`,
  tag: 'booking'
}, 'BOOKING_CONFIRMED')

// En cancelBooking - notificar según quien cancele
```

**`app/dashboard/messages/actions.ts` o similar:**
```typescript
// Al enviar mensaje - notificar al destinatario
await sendNotificationIfEnabled({
  userId: recipientId,
  title: `Nuevo mensaje de ${senderName}`,
  body: messagePreview,
  url: `/dashboard/messages/${threadId}`,
  tag: 'message'
}, 'NEW_MESSAGE')
```

**`app/dashboard/reviews/actions.ts` (si existe):**
```typescript
// En createReview - notificar al negocio
await sendNotificationIfEnabled({
  userId: business.owner_id,
  title: 'Nueva reseña',
  body: `${user.full_name} dejó una reseña`,
  url: `/dashboard/reviews`,
  tag: 'review'
}, 'NEW_REVIEW')

// En respondToReview - notificar al usuario
await sendNotificationIfEnabled({
  userId: review.user_id,
  title: 'Respuesta a tu reseña',
  body: `${business.name} respondió a tu reseña`,
  url: `/businesses/${business.slug}#reviews`,
  tag: 'review'
}, 'REVIEW_RESPONSE')
```

### 2. Crear Página de Configuración de Notificaciones

Crear: `app/(authenticated)/settings/notifications/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'
import { PushPermissionModal } from '@/components/PushPermissionModal'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
// ... importar componentes necesarios

export default function NotificationSettingsPage() {
  // Cargar preferencias del usuario
  // Permitir activar/desactivar por tipo
  // Permitir desuscribirse completamente
  // Mostrar modal de permisos si no están otorgados
}
```

### 3. Probar en Múltiples Dispositivos

- [ ] Chrome Android (instalar y probar notificaciones)
- [ ] Safari iOS 16.4+ (PWA y notificaciones)
- [ ] Chrome Desktop (notificaciones)
- [ ] Firefox Desktop/Mobile
- [ ] Edge Desktop

---

## 🧪 Testing

### Test Manual PWA:

1. **Instalación:**
   ```bash
   npm run dev
   # Abrir en navegador, esperar banner "Instalar Local Conecta"
   # Click en "Instalar" y verificar que se instala
   ```

2. **Offline Mode:**
   ```bash
   # Con la app abierta, ir a DevTools > Network > Offline
   # Intentar navegar - debería mostrar página offline
   ```

3. **Notificaciones:**
   ```bash
   # Otorgar permisos
   # Crear una acción que dispare notificación (ej: nueva reserva)
   # Verificar que llega la notificación
   # Click en notificación - debería abrir la URL correcta
   ```

### Test con Lighthouse:

```bash
# Build de producción
npm run build
npm run start

# Abrir Chrome DevTools > Lighthouse
# Seleccionar "Progressive Web App" category
# Objetivo: Score > 90
```

---

## 📱 Consideraciones Importantes

### iOS Safari Limitaciones

- **iOS < 16.4:** No soporta Web Push Notifications
- **iOS 16.4+:** Soporta notificaciones pero solo si la app está instalada como PWA
- **Home Screen:** El usuario debe agregar la app a la pantalla de inicio manualmente

### Android Chrome

- Soporte completo de PWA y notificaciones
- Banner de instalación automático (si cumple criterios)
- Puede instalar desde menú "Agregar a pantalla de inicio"

### Desktop Browsers

- Chrome/Edge: Soporte completo
- Firefox: Soporte completo
- Safari: Limitado (macOS Big Sur+)

### HTTPS Requerido

- Service Workers y Push API **solo funcionan con HTTPS**
- Para desarrollo local: `localhost` está exento
- Para producción: usa Vercel (HTTPS automático)

---

## 🚀 Deploy

### Vercel (Recomendado)

1. Push a GitHub
2. Importar en Vercel
3. Configurar variables de entorno:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY` (solo servidor)
4. Deploy automático

### Post-Deploy

1. Verificar que `manifest.json` es accesible: `https://tuapp.com/manifest.json`
2. Verificar que Service Worker se registra: DevTools > Application > Service Workers
3. Verificar iconos: DevTools > Application > Manifest
4. Probar instalación en móvil real

---

## 📚 Recursos

- [Web.dev - PWA Checklist](https://web.dev/pwa-checklist/)
- [MDN - Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

## 🐛 Troubleshooting

### Service Worker no se registra
```bash
# Verificar en DevTools > Console
# Verificar que sw.js existe en /public/sw.js
# Hard refresh: Cmd+Shift+R (Mac) o Ctrl+Shift+R (Windows)
```

### Notificaciones no llegan
```bash
# Verificar permisos en navegador
# Verificar VAPID keys configuradas
# Verificar Edge Functions desplegadas
# Ver logs en Supabase Dashboard > Edge Functions > Logs
```

### App no se puede instalar
```bash
# Verificar manifest.json válido
# Verificar HTTPS (producción) o localhost (desarrollo)
# Verificar que existen los iconos referenciados
# Ver DevTools > Application > Manifest para errores
```
