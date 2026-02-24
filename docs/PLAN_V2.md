# Local Conecta — Plan Post-MVP (Fase 2 y 3)

> El MVP está completo. Este documento define las siguientes fases de desarrollo.

---

## Estado Actual (MVP Completado)

- ✅ Auth (email + Google OAuth)
- ✅ Directorio de negocios con busqueda y filtros
- ✅ Perfiles publicos de negocio
- ✅ Dashboard del negocio (perfil, horarios, productos/servicios)
- ✅ Sistema de reservas (crear, confirmar, completar, cancelar)
- ✅ Mensajeria bidireccional (usuario ↔ negocio)
- ✅ Upload de imagenes (Supabase Storage)
- ✅ Registro multi-step con limite de 1 negocio/usuario
- ✅ Loading states, error boundaries, not-found pages

---

## Fase 2 — Engagement y Crecimiento (4-6 semanas)

### 2.1 Promociones y Anuncios
> Prioridad: **Alta** — Diferenciador clave para atraer negocios.

**Funcionalidad:**
- CRUD de promociones desde `/dashboard/promotions`
- Tipos: porcentaje, monto fijo, 2x1, texto libre
- Fecha de inicio y fin con auto-desactivacion
- Imagen promocional (upload con Supabase Storage)
- Seccion "Promociones" en perfil publico del negocio
- Badge "Con promocion" en BusinessCard del directorio
- Filtro "Con promociones" en listado de negocios

**Modelo de datos:** Ya existe la tabla `promotions` en la base de datos.

**Archivos a crear:**
```
app/dashboard/promotions/
├── page.tsx              # Lista de promociones del negocio
├── actions.ts            # CRUD server actions
└── loading.tsx           # Skeleton

components/dashboard/
├── PromotionCard.tsx     # Card editable
└── PromotionForm.tsx     # Modal crear/editar

components/businesses/
└── PromotionBadge.tsx    # Badge en cards publicas
```

---

### 2.2 Resenas y Calificaciones
> Prioridad: **Alta** — Genera confianza y contenido.

**Funcionalidad:**
- Usuarios pueden dejar resena (1-5 estrellas + texto)
- Solo si han tenido una reserva completada en ese negocio
- Rating promedio visible en BusinessCard y perfil publico
- Respuesta del negocio a cada resena (1 respuesta por resena)
- Seccion "Resenas" en perfil publico

**Modelo de datos (nueva tabla):**
```sql
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id),
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  owner_reply text,
  owner_replied_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, business_id) -- 1 resena por usuario por negocio
);
```

**Archivos a crear:**
```
lib/queries/reviews.ts
lib/validations/review.ts

components/businesses/
├── ReviewCard.tsx
├── ReviewForm.tsx
├── ReviewsList.tsx
└── RatingStars.tsx

app/(main)/businesses/[slug]/
└── reviews section (integrar en page.tsx existente)
```

---

### 2.3 Favoritos / Guardados
> Prioridad: **Media** — Mejora enganchamiento.

**Funcionalidad:**
- Boton de corazon/bookmark en cada BusinessCard y perfil publico
- Pagina `/account/favorites` con grid de negocios guardados
- Contador de favoritos visible en perfil del negocio (opcional)

**Modelo de datos (nueva tabla):**
```sql
CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, business_id)
);
```

---

### 2.4 Panel de Administracion de Comunidad
> Prioridad: **Alta** — Necesario para gestionar negocios pendientes.

**Funcionalidad:**
- Ruta `/admin` protegida para roles `community_admin` y `super_admin`
- Lista de negocios pendientes de aprobacion
- Aprobar / rechazar negocio con un click
- Vista de estadisticas basicas (total negocios, usuarios, reservas)
- Gestion de categorias (CRUD)

**Archivos a crear:**
```
app/admin/
├── layout.tsx            # Layout con nav de admin
├── page.tsx              # Dashboard de admin
├── businesses/
│   └── page.tsx          # Lista de negocios (pendientes, activos, suspendidos)
├── categories/
│   └── page.tsx          # CRUD categorias
└── loading.tsx
```

---

### 2.5 Dashboard Analitico Basico
> Prioridad: **Media** — Valor agregado para retener negocios.

**Funcionalidad:**
- Contador de visitas al perfil publico (requiere tabla `profile_views`)
- Total de reservas por periodo (semana, mes)
- Mensajes recibidos por periodo
- Graficas simples (barras o lineas)

**Dependencia:** Necesita tracking de vistas (nueva tabla `profile_views`).

---

### 2.6 Mapa Interactivo
> Prioridad: **Baja** — Nice-to-have, requiere que negocios tengan lat/lng.

**Funcionalidad:**
- Mapa en pagina del directorio (`/businesses`) con pins de negocios
- Popup al hacer click en un pin con mini-card del negocio
- Toggle entre vista de grid y vista de mapa
- Libreria: Leaflet con OpenStreetMap (gratis)

**Prerequisito:** Negocios necesitan `latitude` y `longitude` filled (actualmente nullables).

---

## Fase 3 — Escalamiento (8-12 semanas)

### 3.1 Multi-Comunidad y Onboarding
- Formulario para crear nueva comunidad
- Seleccion de comunidad al registrarse
- Filtro global por comunidad en toda la app
- Subdominio o ruta per comunidad (`/comunidad/mi-colonia`)

### 3.2 Chat en Tiempo Real
- Migrar mensajes de polling a Supabase Realtime
- Indicador de "escribiendo..."
- Notificaciones in-app en tiempo real
- Badge de mensajes no leidos en navbar

### 3.3 Pagos en Linea
- Integracion con MercadoPago (o Stripe)
- Pago al momento de reservar (opcional por negocio)
- Gestion de reembolsos
- Recibos automaticos por email

### 3.4 PWA y Notificaciones Push
- Service worker para funcionamiento offline basico
- Web push notifications para:
  - Nueva reserva (negocio)
  - Reserva confirmada/cancelada (usuario)
  - Nuevo mensaje
- Banner "Agregar a pantalla de inicio"

### 3.5 Sistema de Lealtad
- Puntos por reserva completada
- Niveles de usuario (bronce, plata, oro)
- Descuentos automaticos al alcanzar cierto nivel
- Dashboard de puntos para el usuario

### 3.6 API Publica
- REST o GraphQL para integraciones de terceros
- Documentacion con Swagger/OpenAPI
- API keys por negocio

---

## Orden de Implementacion Sugerido (Fase 2)

```
Semana 1-2: Fundamentos de engagement
├── Promociones (CRUD + UI publica)
├── Panel de admin (aprobar negocios)
└── Favoritos

Semana 3-4: Confianza y contenido
├── Resenas y calificaciones
├── Respuestas del negocio a resenas
└── Rating promedio en cards

Semana 5-6: Analitica y extras
├── Dashboard analitico
├── Mapa interactivo (si hay datos de ubicacion)
└── Pulido general y deploy
```

---

## Dependencias Nuevas (Fase 2)

```bash
# Graficas para dashboard analitico
npm install recharts

# Mapa interactivo (si se implementa)
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

---

## Notas Tecnicas

- **No se necesita cambiar la arquitectura.** Server Components + Server Actions + Supabase siguen siendo la base.
- **Las tablas nuevas** (reviews, favorites, profile_views) siguen el mismo patron de RLS existente.
- **Supabase Realtime** (Fase 3) es el unico cambio arquitectonico significativo — requiere suscripciones en client components.
- **MercadoPago** (Fase 3) necesita webhook endpoint — evaluar Edge Functions o Route Handlers de Next.js.
