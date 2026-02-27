# Guía de Integración de Notificaciones Push

## 📋 Tabla de Contenidos

1. [Overview](#overview)
2. [Sistema Actual](#sistema-actual)
3. [Cómo Integrar Notificaciones](#cómo-integrar-notificaciones)
4. [Ejemplos por Tipo](#ejemplos-por-tipo)
5. [Configuración de Preferencias](#configuración-de-preferencias)
6. [Testing](#testing)

---

## Overview

El sistema de notificaciones push ya está **completamente funcional**. Solo falta integrar las llamadas en los eventos correspondientes.

### Componentes Implementados ✅

- **Hook**: `usePushNotifications` - Maneja suscripciones del cliente
- **Manager**: `PushNotificationManager` - Solicita permisos automáticamente
- **Edge Function**: `send-notification` - Envía notificaciones respetando preferencias
- **Helpers**: `lib/notifications/send-push.ts` - Funciones específicas por tipo
- **Base de Datos**: Tablas `push_subscriptions` y `notification_preferences`

---

## Sistema Actual

### Flujo de Suscripción

#### Escenario A: Usuario YA está logueado
```
1. Usuario instala PWA →
2. PushNotificationManager solicita permisos (3s delay) →
3. Usuario acepta →
4. Se guarda en push_subscriptions inmediatamente →
5. Preferencias ya existen (creadas al registrarse)
```

#### Escenario B: Usuario NO está logueado (común en PWA)
```
1. Usuario instala PWA (sin login) →
2. PushNotificationManager solicita permisos (3s delay) →
3. Usuario acepta →
4. Se guarda permiso en localStorage (pendiente) →
5. Usuario inicia sesión más tarde →
6. AuthSubscriptionSync detecta el login →
7. Se suscribe automáticamente →
8. Se guarda en push_subscriptions →
9. Preferencias creadas automáticamente (trigger)
```

**Ventajas de este flujo:**
- ✅ No se pierde el permiso concedido
- ✅ No se molesta al usuario pidiendo permisos dos veces
- ✅ Funciona tanto si el usuario se loguea antes o después de instalar
- ✅ La suscripción se sincroniza automáticamente al hacer login

### Preferencias Disponibles

```typescript
// Para NEGOCIOS
notify_new_booking: boolean       // Nueva reserva
notify_new_message: boolean       // Nuevo mensaje
notify_new_review: boolean        // Nueva reseña

// Para CLIENTES
notify_booking_confirmed: boolean // Reserva confirmada
notify_booking_cancelled: boolean // Reserva cancelada
notify_review_response: boolean   // Respuesta a reseña

// NUEVAS (después de migración 006)
notify_new_promotion: boolean     // Nueva promoción en favoritos
```

---

## Cómo Integrar Notificaciones

### Paso 1: Importar el helper

```typescript
import { notifyNewBooking } from '@/lib/notifications/send-push'
```

### Paso 2: Llamar después del evento

```typescript
// Ejemplo: Después de crear una reserva
const result = await supabase
  .from('bookings')
  .insert(newBooking)

if (result.error) throw result.error

// ✅ ENVIAR NOTIFICACIÓN
await notifyNewBooking({
  businessOwnerId: business.owner_id,
  businessName: business.name,
  customerName: customer.name,
  bookingId: result.data.id
})
```

### Paso 3: (Opcional) Manejar errores

```typescript
const notification = await notifyNewBooking({ ... })

if (!notification.success) {
  // Log error, pero NO bloquear el flujo principal
  console.error('Failed to send notification:', notification.error)
}
```

**IMPORTANTE**: Las notificaciones son **nice-to-have**, no deben bloquear operaciones críticas.

---

## Ejemplos por Tipo

### 1. Nueva Reserva (Negocio)

**Dónde**: Cuando se crea una reserva en `app/dashboard/reservations/actions.ts`

```typescript
import { notifyNewBooking } from '@/lib/notifications/send-push'

export async function createBooking(data: BookingData) {
  // 1. Crear reserva
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      business_id: data.businessId,
      customer_id: data.customerId,
      // ...
    })
    .select()
    .single()

  if (error) throw error

  // 2. Obtener info del negocio
  const { data: business } = await supabase
    .from('businesses')
    .select('owner_id, name')
    .eq('id', data.businessId)
    .single()

  // 3. Obtener nombre del cliente
  const { data: customer } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', data.customerId)
    .single()

  // 4. Enviar notificación al dueño
  if (business && customer) {
    await notifyNewBooking({
      businessOwnerId: business.owner_id,
      businessName: business.name,
      customerName: customer.full_name,
      bookingId: booking.id
    })
  }

  return { success: true, booking }
}
```

### 2. Reserva Confirmada (Cliente)

**Dónde**: Cuando el negocio confirma una reserva

```typescript
import { notifyBookingConfirmed } from '@/lib/notifications/send-push'

export async function confirmBooking(bookingId: string) {
  // 1. Actualizar estado
  const { data: booking, error } = await supabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', bookingId)
    .select('*, business:businesses(name)')
    .single()

  if (error) throw error

  // 2. Notificar al cliente
  await notifyBookingConfirmed({
    customerId: booking.customer_id,
    businessName: booking.business.name,
    bookingId: booking.id,
    dateTime: formatDateTime(booking.scheduled_at)
  })

  return { success: true }
}
```

### 3. Nueva Reseña (Negocio)

**Dónde**: Cuando un usuario deja una reseña

```typescript
import { notifyNewReview } from '@/lib/notifications/send-push'

export async function createReview(data: ReviewData) {
  // 1. Crear reseña
  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      business_id: data.businessId,
      user_id: data.userId,
      rating: data.rating,
      comment: data.comment
    })
    .select()
    .single()

  if (error) throw error

  // 2. Obtener datos para notificación
  const { data: business } = await supabase
    .from('businesses')
    .select('owner_id, name')
    .eq('id', data.businessId)
    .single()

  const { data: reviewer } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', data.userId)
    .single()

  // 3. Notificar al dueño del negocio
  if (business && reviewer) {
    await notifyNewReview({
      businessOwnerId: business.owner_id,
      reviewerName: reviewer.full_name,
      rating: data.rating,
      businessName: business.name,
      reviewId: review.id
    })
  }

  return { success: true, review }
}
```

### 4. Respuesta a Reseña (Cliente)

**Dónde**: Cuando el negocio responde una reseña

```typescript
import { notifyReviewResponse } from '@/lib/notifications/send-push'

export async function replyToReview(reviewId: string, response: string) {
  // 1. Actualizar reseña con respuesta
  const { data: review, error } = await supabase
    .from('reviews')
    .update({
      business_response: response,
      responded_at: new Date().toISOString()
    })
    .eq('id', reviewId)
    .select('user_id, business:businesses(name)')
    .single()

  if (error) throw error

  // 2. Notificar al usuario que dejó la reseña
  await notifyReviewResponse({
    reviewerId: review.user_id,
    businessName: review.business.name,
    reviewId: reviewId
  })

  return { success: true }
}
```

### 5. Nuevo Mensaje

**Dónde**: Cuando se envía un mensaje en el chat

```typescript
import { notifyNewMessage } from '@/lib/notifications/send-push'

export async function sendMessage(data: MessageData) {
  // 1. Insertar mensaje
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: data.conversationId,
      sender_id: data.senderId,
      content: data.content
    })
    .select()
    .single()

  if (error) throw error

  // 2. Obtener info del remitente
  const { data: sender } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', data.senderId)
    .single()

  // 3. Determinar el destinatario (el otro usuario en la conversación)
  const { data: conversation } = await supabase
    .from('conversations')
    .select('user_id_1, user_id_2')
    .eq('id', data.conversationId)
    .single()

  const recipientId = conversation.user_id_1 === data.senderId
    ? conversation.user_id_2
    : conversation.user_id_1

  // 4. Notificar al destinatario
  await notifyNewMessage({
    recipientId,
    senderName: sender.full_name,
    messagePreview: data.content.substring(0, 50),
    conversationId: data.conversationId
  })

  return { success: true, message }
}
```

### 6. Nueva Promoción (Usuarios que tienen el negocio en favoritos)

**Dónde**: Cuando se publica una promoción

```typescript
import { notifyNewPromotion } from '@/lib/notifications/send-push'

export async function createPromotion(data: PromotionData) {
  // 1. Crear promoción
  const { data: promotion, error } = await supabase
    .from('promotions')
    .insert({
      business_id: data.businessId,
      title: data.title,
      description: data.description,
      // ...
    })
    .select()
    .single()

  if (error) throw error

  // 2. Obtener nombre del negocio
  const { data: business } = await supabase
    .from('businesses')
    .select('name')
    .eq('id', data.businessId)
    .single()

  // 3. Notificar a TODOS los usuarios que tienen este negocio en favoritos
  // Esta función internamente consulta la tabla de favoritos
  if (business) {
    const result = await notifyNewPromotion({
      businessName: business.name,
      promotionTitle: data.title,
      promotionId: promotion.id,
      businessId: data.businessId
    })

    console.log(`Notificación enviada a ${result.sent}/${result.total} usuarios`)
  }

  return { success: true, promotion }
}
```

---

## Configuración de Preferencias

### UI de Preferencias (Próximo paso)

Crear una página en `/dashboard/settings/notifications` donde el usuario pueda:

```typescript
'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    notify_new_booking: true,
    notify_new_message: true,
    notify_new_review: true,
    notify_booking_confirmed: true,
    notify_new_promotion: true,
  })

  const handleToggle = async (key: string, value: boolean) => {
    // 1. Actualizar estado local
    setPrefs(prev => ({ ...prev, [key]: value }))

    // 2. Actualizar en base de datos
    const supabase = createClient()
    await supabase
      .from('notification_preferences')
      .update({ [key]: value })
      .eq('user_id', userId)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="new-booking">Nuevas reservas</Label>
        <Switch
          id="new-booking"
          checked={prefs.notify_new_booking}
          onCheckedChange={(v) => handleToggle('notify_new_booking', v)}
        />
      </div>
      {/* Repetir para cada preferencia */}
    </div>
  )
}
```

---

## Testing

### 1. Página de Test (Ya existe)

Ir a `/test-notifications` para:
- Verificar permisos
- Ver estado de suscripción
- Enviar notificación de prueba

### 2. Test Manual de cada Tipo

```typescript
// En cualquier server action temporal
import { notifyNewBooking } from '@/lib/notifications/send-push'

export async function testNotification() {
  await notifyNewBooking({
    businessOwnerId: 'user-id-aquí',
    businessName: 'Test Business',
    customerName: 'Test Customer',
    bookingId: 'test-123'
  })
}
```

### 3. Verificar en iPhone

1. Instalar PWA
2. Aceptar permisos
3. Ejecutar la acción (crear reserva, mensaje, etc.)
4. ✅ Debería aparecer la notificación

---

## Próximos Pasos

### Migrar Base de Datos
```bash
cd supabase
supabase db push
```

### Integrar en Eventos Reales

1. **Reservas** → `app/dashboard/reservations/actions.ts`
2. **Reseñas** → `app/businesses/[slug]/reviews/actions.ts`
3. **Mensajes** → `app/messages/actions.ts` (cuando se implemente)
4. **Promociones** → `app/dashboard/promotions/actions.ts`

### Crear UI de Configuración

Página en `/dashboard/settings/notifications` con switches para cada tipo.

---

## Notas Importantes

### Notificaciones
- ✅ Las notificaciones se envían de forma asíncrona
- ✅ Respetan las preferencias del usuario automáticamente
- ✅ Si el usuario no tiene suscripciones activas, no falla (retorna mensaje)
- ✅ Si el usuario desactivó todas las notificaciones, no se envía nada
- ✅ iOS requiere PWA instalada para notificaciones
- ✅ Funciona en Android e iOS

### Suscripciones y Duplicados
- ✅ **Mismo dispositivo, múltiples logins**: ACTUALIZA el registro existente (no crea duplicados)
- ✅ **Múltiples dispositivos**: Crea un registro por dispositivo (endpoint diferente)
- ✅ **Notificaciones multi-dispositivo**: El usuario recibe notificaciones en TODOS sus dispositivos
- ✅ **Edge Function**: Verifica automáticamente si el endpoint ya existe antes de insertar
- ✅ **AuthSubscriptionSync**: Evita intentos redundantes de suscripción

### Identificación de Dispositivos
Cada suscripción se identifica por:
- `user_id`: El usuario
- `endpoint`: URL única del navegador/dispositivo (generada por el navegador)

Ejemplo:
```
Usuario "juan@example.com":
- iPhone (Safari): endpoint_A → 1 registro
- iPad (Safari):   endpoint_B → 1 registro
- Mac (Chrome):    endpoint_C → 1 registro

Total: 3 registros, 3 dispositivos reciben notificaciones ✅
```

---

## Resumen

**Sistema completo y listo para producción** 🎉

Solo falta:
1. Aplicar migración 006 (promociones)
2. Integrar llamadas en eventos reales
3. Crear UI de configuración (opcional pero recomendado)
