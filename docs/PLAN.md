# Local Conecta - Plan de Proyecto

> Marketplace comunitario que conecta negocios locales con los habitantes de su comunidad.

---

## 1. Vision del Producto

### Problema que resuelve

Los negocios locales (tiendas, profesionales independientes, restaurantes, servicios) carecen de una presencia digital unificada dentro de su comunidad. Los habitantes no tienen una forma centralizada de descubrir, comparar y reservar productos/servicios locales. La comunicacion entre negocios y clientes depende de canales fragmentados (WhatsApp personal, redes sociales, boca a boca).

### Propuesta de valor

**Para negocios:** Una plataforma donde crear su perfil digital, publicar horarios, promociones y recibir reservas sin necesidad de manejar multiples herramientas.

**Para usuarios/habitantes:** Un directorio vivo de su comunidad donde descubrir negocios, ver disponibilidad en tiempo real, apartar productos/servicios y contactar directamente.

**Diferenciador:** Enfocado en comunidades especificas (colonias, fraccionamientos, pueblos, zonas), no en una ciudad entera. Esto genera confianza y relevancia.

### Tipos de usuarios

| Rol | Descripcion | Permisos clave |
|-----|-------------|----------------|
| **visitor** | Usuario no autenticado | Navegar directorio, ver perfiles publicos |
| **user** | Habitante registrado | Reservar, contactar, guardar favoritos |
| **business_owner** | Dueno/admin de negocio | Gestionar perfil, productos, horarios, promociones, ver reservas |
| **community_admin** | Administrador de comunidad | Aprobar negocios, moderar contenido, gestionar configuracion de comunidad |
| **super_admin** | Administrador de plataforma | Gestionar comunidades, configuracion global |

### Casos de uso principales

1. **Maria (business_owner)** registra su pasteleria, sube fotos, configura horarios y publica que tiene disponibles 5 pasteles para el fin de semana.
2. **Carlos (user)** busca pastelerias en su colonia, ve el perfil de Maria, aparta 1 pastel para el sabado y recibe confirmacion.
3. **Maria** publica una promocion "2x1 en cupcakes" visible solo para su comunidad.
4. **Ana (user)** quiere saber si el plomero local trabaja domingos. Envia solicitud de informacion desde la app y recibe respuesta.
5. **Luis (community_admin)** revisa y aprueba el registro de un nuevo negocio antes de que aparezca en el directorio.

---

## 2. Funcionalidades

### MVP (Fase 1) — 6-8 semanas

**Landing page**
- Hero con headline, subtitulo y barra de busqueda central
- Grid de categorias con iconos (8 categorias seed)
- Negocios destacados (cards con foto, nombre, categoria, estado abierto/cerrado)
- Seccion "Como funciona" (3 pasos: Explora → Aparta → Disfruta)
- CTA de registro para negocios
- Navbar responsive (sticky, con estado auth/no-auth)
- Footer con links de navegacion y legales
- (Ver especificacion completa en seccion 6)

**Autenticacion y perfiles**
- Registro/login con email (Supabase Auth)
- Login con Google OAuth
- Perfil basico de usuario (nombre, telefono, comunidad)
- Registro de negocio con aprobacion manual

**Directorio de negocios**
- Listado de negocios por comunidad
- Busqueda por nombre y categoria
- Filtros: categoria, abierto ahora, con promociones
- Perfil publico de negocio: descripcion, fotos, horarios, ubicacion

**Gestion de negocio (dashboard)**
- Editar perfil del negocio
- Configurar horarios de atencion (por dia de la semana)
- CRUD de productos/servicios con precio, descripcion, fotos
- Marcar disponibilidad de productos/servicios

**Reservas**
- Usuario aparta un producto/servicio
- Seleccion de fecha/hora basada en horarios del negocio
- Estados: pending → confirmed → completed | cancelled
- Notificacion al negocio (in-app)
- Vista de "mis reservas" para el usuario

**Contacto**
- Formulario de solicitud de informacion (mensaje al negocio)
- Bandeja basica de mensajes para el negocio

**Comunidad**
- Una comunidad preconfigurada (seed)
- Negocios asociados a una comunidad

### Fase 2 — Post-MVP

- Promociones y anuncios con fecha de vigencia
- Notificaciones push (web push notifications)
- Resenas y calificaciones de negocios
- Favoritos/guardados para usuarios
- Galeria de fotos mejorada con Supabase Storage
- Mapa interactivo de negocios (Mapbox/Leaflet)
- Categorias y subcategorias gestionables
- Dashboard analitico basico para negocios (vistas de perfil, reservas)

### Fase 3 — Escalamiento

- Multi-comunidad: onboarding de nuevas comunidades
- Roles de community_admin con panel dedicado
- Pagos en linea para reservas (Stripe/MercadoPago)
- Chat en tiempo real negocio-usuario (Supabase Realtime)
- PWA con notificaciones nativas
- Sistema de lealtad/puntos por comunidad
- API publica para integraciones
- Soporte multi-idioma

---

## 3. Arquitectura Tecnica

### 3.1 Frontend — Next.js App Router

#### Estructura de carpetas

```
local-conecta/
├── app/
│   ├── (auth)/                     # Grupo: rutas de autenticacion
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx              # Layout sin navbar (pantalla completa)
│   ├── (main)/                     # Grupo: rutas publicas con navbar
│   │   ├── page.tsx                # Landing / directorio principal
│   │   ├── businesses/
│   │   │   ├── page.tsx            # Listado de negocios
│   │   │   └── [slug]/page.tsx     # Perfil publico del negocio
│   │   ├── categories/
│   │   │   └── [slug]/page.tsx     # Negocios por categoria
│   │   └── layout.tsx              # Navbar + footer
│   ├── dashboard/                  # Panel del negocio (protegido)
│   │   ├── layout.tsx              # Sidebar de dashboard
│   │   ├── page.tsx                # Overview
│   │   ├── profile/page.tsx        # Editar perfil negocio
│   │   ├── hours/page.tsx          # Horarios
│   │   ├── products/
│   │   │   ├── page.tsx            # Lista productos/servicios
│   │   │   └── [id]/page.tsx       # Editar producto
│   │   ├── bookings/page.tsx       # Reservas recibidas
│   │   ├── promotions/page.tsx     # Gestionar promociones
│   │   └── messages/page.tsx       # Bandeja de mensajes
│   ├── account/                    # Panel del usuario (protegido)
│   │   ├── page.tsx                # Mi perfil
│   │   ├── bookings/page.tsx       # Mis reservas
│   │   └── messages/page.tsx       # Mis mensajes
│   ├── globals.css
│   └── layout.tsx                  # Root layout
├── components/
│   ├── ui/                         # shadcn/ui (ya existente)
│   ├── layout/                     # Header, Footer, Sidebar, MobileNav
│   ├── businesses/                 # BusinessCard, BusinessGrid, HoursDisplay
│   ├── bookings/                   # BookingForm, BookingCard, BookingStatus
│   ├── products/                   # ProductCard, ProductGrid, ProductForm
│   └── shared/                     # SearchBar, EmptyState, LoadingStates
├── lib/
│   ├── utils.ts                    # (ya existente)
│   ├── supabase/
│   │   ├── client.ts               # createBrowserClient
│   │   ├── server.ts               # createServerClient (para RSC)
│   │   ├── middleware.ts            # Helper para refresh de sesion
│   │   └── admin.ts                # Service role client (solo server)
│   ├── types/
│   │   └── database.ts             # Tipos generados de Supabase
│   └── constants.ts                # Enums, categorias, estados
├── hooks/
│   ├── use-auth.ts                 # Hook de sesion/usuario
│   └── use-business.ts             # Hook del negocio del owner actual
├── middleware.ts                    # Auth middleware (proteccion de rutas)
└── supabase/
    ├── migrations/                 # SQL migrations
    └── seed.sql                    # Datos iniciales
```

#### Manejo de estado

**Sin state manager global.** La estrategia se basa en las capacidades nativas de Next.js App Router:

| Tipo de estado | Solucion |
|----------------|----------|
| Datos del servidor | React Server Components (RSC) con fetch directo a Supabase |
| Cache y revalidacion | Next.js cache + `revalidatePath` / `revalidateTag` |
| Estado de sesion | Supabase Auth (cookie-based) leido en server y client |
| Estado de UI local | `useState` / `useReducer` en client components |
| Estado de formularios | React 19 `useActionState` + Server Actions |
| URL como estado | `useSearchParams` para filtros, busqueda, paginacion |

**Justificacion:** Evitar una capa de complejidad innecesaria. Next.js + RSC + Supabase client cubren todos los patrones de data fetching necesarios para el MVP. Si se necesita cache client-side complejo en Fase 2+, evaluar `@tanstack/react-query`.

#### Data fetching strategy

```
RSC (Server Components) — DEFAULT
├── Listados (negocios, productos, categorias)
├── Perfil publico de negocio
├── Dashboard data
└── Usa: supabase server client → query directa

Server Actions — MUTACIONES
├── Crear/editar negocio
├── Crear reserva
├── Enviar mensaje
└── Usa: supabase server client + revalidatePath

Client Components — INTERACTIVIDAD
├── Formularios con validacion en tiempo real
├── Busqueda con debounce
├── Selector de fecha/hora para reservas
└── Usa: supabase browser client (solo si necesita realtime)
```

#### Autenticacion con Supabase

Se usa `@supabase/ssr` para manejar auth con cookies (compatible con RSC):

1. **middleware.ts**: En cada request, refresca el token si esta por expirar. Redirige rutas protegidas (`/dashboard/*`, `/account/*`) al login si no hay sesion.
2. **Server Components**: Leen la sesion desde cookies (sin round-trip al browser).
3. **Client Components**: Usan `createBrowserClient` para operaciones que necesitan el usuario en el browser (ej: suscripciones realtime).
4. **Server Actions**: Validan la sesion antes de ejecutar cualquier mutacion.

Flujo de login:
```
1. Usuario llena formulario → Server Action
2. Server Action llama supabase.auth.signInWithPassword()
3. Supabase setea cookies automaticamente via @supabase/ssr
4. redirect('/') o redirect('/dashboard')
5. middleware.ts mantiene sesion fresca en cada request
```

### 3.2 Backend — Supabase

#### Supabase Auth

- Providers habilitados: email/password + Google OAuth
- Email confirmation deshabilitado en MVP (simplificar onboarding)
- La tabla `profiles` extiende `auth.users` con datos adicionales via trigger `on_auth_user_created`
- Roles almacenados en `profiles.role` (no en JWT custom claims para simplificar MVP)

#### Row Level Security (RLS)

Toda tabla tiene RLS habilitado. Politicas clave:

```sql
-- profiles: cada usuario lee/edita solo su perfil
-- businesses: lectura publica, escritura solo owner
-- products_services: lectura publica, escritura solo owner del negocio
-- bookings: usuario ve las suyas, negocio ve las de su negocio
-- messages: solo emisor y receptor
```

Patron recurrente para verificar ownership de negocio:
```sql
CREATE POLICY "business_owner_write" ON products_services
FOR ALL USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);
```

#### Edge Functions

No necesarias para MVP. Los Server Actions de Next.js cubren toda la logica del server. Evaluarlas en Fase 2 para:
- Webhooks de pago (Stripe/MercadoPago)
- Envio de emails transaccionales
- Cron jobs (expirar promociones, limpiar reservas viejas)

#### Supabase Realtime

No incluido en MVP. Planeado para Fase 3:
- Chat negocio-usuario
- Actualizacion en vivo del estado de reservas
- Notificaciones in-app en tiempo real

#### Supabase Storage

Un bucket `public` para:
- Fotos de negocios (logo, portada)
- Fotos de productos/servicios
- Avatares de usuarios

Politicas de storage:
- Upload: solo usuarios autenticados, max 5MB, tipos imagen
- Read: publico
- Delete: solo el owner del archivo

---

## 4. Modelo de Datos

### Diagrama de relaciones

```
auth.users
    │
    └──→ profiles (1:1)
              │
              ├──→ businesses (1:N) ←── communities (N:1)
              │         │
              │         ├──→ business_hours (1:N)
              │         ├──→ products_services (1:N)
              │         │         │
              │         │         └──→ bookings (1:N) ←── profiles (N:1)
              │         ├──→ promotions (1:N)
              │         └──→ messages (1:N) ←── profiles (N:1)
              │
              └──→ bookings (1:N, como cliente)
```

### Tablas

#### `profiles`
Extiende auth.users. Creada automaticamente via trigger.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | = auth.users.id |
| full_name | text | Nombre completo |
| phone | text | Telefono (opcional) |
| avatar_url | text | URL en Supabase Storage |
| role | text | 'user' \| 'business_owner' \| 'community_admin' \| 'super_admin' |
| community_id | uuid FK → communities | Comunidad a la que pertenece |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

#### `communities`
Representa una comunidad/zona geografica.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | gen_random_uuid() |
| name | text NOT NULL | "Colonia Del Valle" |
| slug | text UNIQUE | "colonia-del-valle" (para URLs) |
| description | text | |
| city | text | |
| state | text | |
| country | text | Default 'MX' |
| is_active | boolean | Default true |
| created_at | timestamptz | |

#### `categories`
Categorias de negocios.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| name | text NOT NULL | "Comida", "Servicios profesionales" |
| slug | text UNIQUE | "comida" |
| icon | text | Nombre del icono (Tabler icons) |
| sort_order | int | Para ordenar en UI |

#### `businesses`
Perfil del negocio.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| owner_id | uuid FK → profiles | Quien lo administra |
| community_id | uuid FK → communities | A que comunidad pertenece |
| category_id | uuid FK → categories | |
| name | text NOT NULL | |
| slug | text UNIQUE | Auto-generado del nombre |
| description | text | |
| short_description | text | Max 160 chars, para cards |
| logo_url | text | |
| cover_url | text | |
| phone | text | |
| whatsapp | text | Numero de WhatsApp (importante en LATAM) |
| email | text | |
| address | text | Direccion legible |
| latitude | decimal | Para mapa futuro |
| longitude | decimal | |
| status | text | 'pending' \| 'active' \| 'suspended' |
| is_featured | boolean | Default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Indice:** `idx_businesses_community_status` en (community_id, status) para el listado principal.

#### `business_hours`
Horarios de atencion. Un registro por dia de la semana.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| business_id | uuid FK → businesses | |
| day_of_week | int | 0=Domingo, 6=Sabado |
| open_time | time | "09:00" |
| close_time | time | "18:00" |
| is_closed | boolean | true = cerrado ese dia |

**Constraint:** UNIQUE(business_id, day_of_week) — un registro por dia.

#### `products_services`
Productos o servicios que ofrece un negocio.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| business_id | uuid FK → businesses | |
| type | text | 'product' \| 'service' |
| name | text NOT NULL | |
| description | text | |
| price | decimal | Nullable (precio "a consultar") |
| price_type | text | 'fixed' \| 'starting_at' \| 'per_hour' \| 'quote' |
| image_url | text | |
| is_available | boolean | Default true |
| is_bookable | boolean | Default false (no todo se puede reservar) |
| stock | int | Nullable (null = sin limite / servicio) |
| duration_minutes | int | Para servicios con duracion |
| sort_order | int | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `bookings`
Reservas/apartados de productos o servicios.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| user_id | uuid FK → profiles | Quien reserva |
| business_id | uuid FK → businesses | Denormalizado para queries rapidas |
| product_service_id | uuid FK → products_services | |
| status | text | 'pending' \| 'confirmed' \| 'completed' \| 'cancelled' \| 'no_show' |
| booking_date | date | Fecha de la reserva |
| booking_time | time | Hora (nullable para productos) |
| quantity | int | Default 1 |
| notes | text | Comentarios del usuario |
| cancellation_reason | text | |
| confirmed_at | timestamptz | |
| completed_at | timestamptz | |
| cancelled_at | timestamptz | |
| created_at | timestamptz | |

**Indices:**
- `idx_bookings_user` en (user_id, status)
- `idx_bookings_business` en (business_id, status)

#### `promotions`
Anuncios y promociones de negocios.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| business_id | uuid FK → businesses | |
| title | text NOT NULL | |
| description | text | |
| image_url | text | |
| discount_type | text | 'percentage' \| 'fixed' \| 'bogo' \| 'freeform' |
| discount_value | decimal | Nullable (para freeform) |
| starts_at | timestamptz | |
| ends_at | timestamptz | |
| is_active | boolean | Default true |
| created_at | timestamptz | |

#### `messages`
Solicitudes de informacion / mensajes al negocio.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| conversation_id | uuid | Agrupa mensajes de un hilo |
| sender_id | uuid FK → profiles | |
| business_id | uuid FK → businesses | Negocio destino |
| content | text NOT NULL | |
| is_read | boolean | Default false |
| created_at | timestamptz | |

**Indice:** `idx_messages_conversation` en (conversation_id, created_at).

### Consideraciones multi-tenant

1. **community_id como partition key logico:** Toda query del directorio filtra por `community_id`. Esto permite que la misma base de datos sirva multiples comunidades sin cambios.
2. **RLS refuerza aislamiento:** Las politicas incluyen `community_id` donde aplica, asegurando que un usuario no vea negocios de otra comunidad accidentalmente.
3. **Slugs unicos por comunidad:** El slug del negocio es UNIQUE globalmente pero podria cambiarse a UNIQUE(community_id, slug) en Fase 3 si hay colisiones.
4. **Sin schema separation:** En MVP usamos una sola base de datos con filtros. Si en Fase 3 una comunidad requiere aislamiento estricto, se puede migrar a schemas separados por comunidad en Postgres.

### SQL: Trigger para crear perfil automaticamente

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### SQL: Funcion para verificar ownership

```sql
CREATE OR REPLACE FUNCTION public.is_business_owner(b_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM businesses
    WHERE id = b_id AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

---

## 5. Flujos Clave

### Flujo 1: Registro de negocio

```
1. Usuario ya autenticado (role = 'user') navega a /register-business
2. Llena formulario multi-step:
   Step 1: Nombre, categoria, descripcion corta
   Step 2: Contacto (telefono, WhatsApp, email, direccion)
   Step 3: Logo y foto de portada (upload a Supabase Storage)
   Step 4: Horarios de atencion (7 dias)
3. Server Action recibe los datos:
   a. Valida sesion (auth.uid())
   b. INSERT en businesses con status = 'pending'
   c. INSERT 7 registros en business_hours
   d. UPDATE profiles SET role = 'business_owner'
   e. Mueve archivos de Storage de temp/ a businesses/{id}/
4. community_admin recibe notificacion (MVP: revisa lista de pendientes)
5. community_admin aprueba → UPDATE businesses SET status = 'active'
6. Negocio aparece en directorio publico
7. Owner es redirigido a /dashboard
```

**Validaciones:**
- Un usuario puede tener multiples negocios
- Slug autogenerado y verificado como unico
- Imagenes: max 5MB, tipos jpg/png/webp
- Horarios: close_time > open_time

### Flujo 2: Creacion de producto/servicio

```
1. Business owner navega a /dashboard/products → click "Agregar"
2. Llena formulario:
   - Tipo: producto o servicio
   - Nombre, descripcion, precio, tipo de precio
   - Foto (upload)
   - Es reservable? (toggle)
   - Si es producto: stock disponible
   - Si es servicio: duracion en minutos
3. Server Action:
   a. Verifica que auth.uid() es owner del negocio
   b. INSERT en products_services
   c. Mueve imagen de Storage
   d. revalidatePath('/dashboard/products')
   e. revalidatePath('/businesses/[slug]') — actualiza perfil publico
4. Producto/servicio visible en perfil publico del negocio
```

### Flujo 3: Usuario realiza reserva

```
1. Usuario navega al perfil publico del negocio (/businesses/pasteleria-maria)
2. Ve lista de productos/servicios marcados como is_bookable = true
3. Click en "Apartar" en un producto
4. Modal/pagina de reserva:
   a. Muestra disponibilidad basada en business_hours
   b. Si es producto: verifica stock > bookings activas
   c. Si es servicio: muestra slots disponibles por duracion
   d. Usuario selecciona fecha, hora (si aplica), cantidad
   e. Campo de notas opcional
5. Server Action:
   a. Verifica auth.uid()
   b. Verifica que el negocio esta activo
   c. Verifica disponibilidad (race condition: usa SELECT FOR UPDATE o constraint)
   d. INSERT en bookings con status = 'pending'
   e. Si es producto: decrementa stock si se maneja asi
   f. revalidatePath para ambos: usuario y negocio
6. Business owner ve la reserva en /dashboard/bookings
7. Owner confirma o rechaza:
   a. Confirmar → status = 'confirmed', se registra confirmed_at
   b. Rechazar → status = 'cancelled', razon obligatoria
8. Usuario ve actualizacion en /account/bookings
```

**Manejo de concurrencia para stock:**
```sql
-- Usar un check constraint o transaccion
-- Opcion simple: verificar al momento de confirmar
UPDATE products_services
SET stock = stock - 1
WHERE id = $1 AND stock > 0
RETURNING id;
-- Si no retorna nada, stock agotado
```

### Flujo 4: Usuario envia solicitud de informacion

```
1. Usuario en perfil del negocio, click "Enviar mensaje"
2. Formulario simple: textarea con el mensaje
3. Server Action:
   a. Verifica auth.uid()
   b. Genera conversation_id (o busca uno existente entre ese user y business)
   c. INSERT en messages
4. Business owner ve mensaje en /dashboard/messages
5. Owner responde desde su bandeja:
   a. INSERT en messages con mismo conversation_id
   b. sender_id = owner, business_id = su negocio
6. Usuario ve respuesta en /account/messages
```

**Estructura de conversacion:**
- conversation_id agrupa todos los mensajes entre un usuario y un negocio
- Se genera como `gen_random_uuid()` la primera vez
- Queries: `WHERE conversation_id = X ORDER BY created_at ASC`

### Flujo 5: Gestion de promociones

```
1. Business owner en /dashboard/promotions → "Crear promocion"
2. Formulario:
   - Titulo ("2x1 en cupcakes")
   - Descripcion
   - Tipo de descuento: porcentaje, monto fijo, 2x1, texto libre
   - Valor del descuento (si aplica)
   - Imagen promocional (opcional)
   - Fecha inicio y fecha fin
3. Server Action:
   a. Verifica ownership
   b. INSERT en promotions con is_active = true
   c. revalidatePath del perfil publico
4. Promocion visible en:
   - Perfil publico del negocio (seccion "Promociones")
   - Listado general con filtro "con promociones"
   - Badge en BusinessCard del directorio
5. Cuando ends_at pasa:
   - MVP: La query filtra WHERE ends_at > now() OR ends_at IS NULL
   - Fase 2: Cron job para marcar is_active = false
6. Owner puede desactivar manualmente en cualquier momento
```

---

## 6. Landing Page — Especificacion

> Ruta: `app/(main)/page.tsx` — Es la primera pantalla que ve cualquier visitante.
> Enfoque: moderna, minimalista, mucho espacio en blanco, tipografia limpia.

### Principios de diseno

- **Mobile-first**: Se disena primero para movil, luego adapta a desktop
- **Minimalismo funcional**: Cada elemento tiene un proposito claro, sin decoracion innecesaria
- **Jerarquia visual clara**: Un solo CTA principal por seccion
- **Colores limitados**: Un color de acento (brand), grises neutros, fondo blanco
- **Tipografia grande y legible**: Headlines bold, cuerpo de texto regular con buen line-height

### Estructura de secciones

```
┌─────────────────────────────────────────┐
│  Navbar                                 │
│  Logo | Explorar | Categorias | [Login] │
├─────────────────────────────────────────┤
│                                         │
│  HERO                                   │
│                                         │
│  Headline principal                     │
│  Subtitulo (1 linea)                    │
│                                         │
│  [ SearchBar: busca negocios, prod... ] │
│                                         │
│  Categorias rapidas (chips/pills)       │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  CATEGORIAS                             │
│  Grid de iconos + nombre                │
│  (6-8 categorias principales)           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  NEGOCIOS DESTACADOS                    │
│  "Descubre lo que hay en tu comunidad"  │
│                                         │
│  [Card] [Card] [Card] [Card]            │
│                                         │
│  [Ver todos los negocios →]             │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  COMO FUNCIONA                          │
│  3 pasos con icono + texto              │
│                                         │
│  1. Explora   2. Aparta   3. Disfruta  │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  CTA NEGOCIOS                           │
│  "Tienes un negocio local?"             │
│  "Registra tu negocio y conecta..."     │
│                                         │
│  [Registrar mi negocio]                 │
│                                         │
├─────────────────────────────────────────┤
│  Footer                                 │
│  Links | Comunidad | Legal              │
└─────────────────────────────────────────┘
```

### Seccion 1: Navbar

Componente: `components/layout/Navbar.tsx`

```
Desktop:  Logo | ---- espacio ---- | Explorar | Categorias | [Iniciar sesion]
Mobile:   Logo | ---- espacio ---- | [Hamburger menu]
```

- Sticky en scroll con fondo `bg-white/80 backdrop-blur`
- Logo: texto "Local Conecta" en semibold, sin imagen por ahora
- Boton de login: variante `outline`, cambia a avatar + dropdown cuando esta autenticado
- Altura: `h-16`
- Border bottom sutil: `border-b border-gray-100`

### Seccion 2: Hero

Componente: `components/landing/HeroSection.tsx`

**Contenido:**

| Elemento | Valor | Estilo |
|----------|-------|--------|
| Headline | "Descubre los negocios de tu comunidad" | text-4xl md:text-5xl font-bold tracking-tight |
| Subtitulo | "Encuentra, aparta y conecta con negocios locales cerca de ti" | text-lg text-muted-foreground max-w-xl |
| SearchBar | Placeholder: "Busca negocios, productos o servicios..." | Input grande con icono de lupa, ancho completo max-w-lg |
| Chips | Categorias rapidas: "Comida", "Servicios", "Salud", "Belleza" | Fila de badges/pills clickeables debajo del search |

**Layout:**
- Centrado vertical y horizontalmente
- Padding generoso: `py-20 md:py-32`
- Sin imagen de fondo (minimalista), solo fondo blanco o un gradiente sutil `bg-gradient-to-b from-gray-50 to-white`
- Maximo ancho del contenido: `max-w-2xl mx-auto text-center`

**Comportamiento:**
- El SearchBar al escribir redirige a `/businesses?q={query}`
- Los chips redirigen a `/categories/{slug}`
- Autofocus en el SearchBar en desktop

### Seccion 3: Categorias

Componente: `components/landing/CategoriesSection.tsx`

**Layout:** Grid de 3 columnas en mobile, 4 en tablet, 6-8 en desktop.

Cada item:
```
┌──────────────┐
│     Icon     │  ← Tabler icon, 32px, color brand
│   Nombre     │  ← text-sm font-medium
└──────────────┘
```

- Fondo de cada item: `bg-gray-50 hover:bg-gray-100 rounded-xl p-6`
- Transicion suave en hover
- Click redirige a `/categories/{slug}`

**Categorias iniciales (seed):**

| Nombre | Icono (Tabler) | Slug |
|--------|----------------|------|
| Comida y bebidas | IconToolsKitchen2 | comida-y-bebidas |
| Salud y bienestar | IconHeartbeat | salud-y-bienestar |
| Belleza | IconSparkles | belleza |
| Servicios del hogar | IconHome | servicios-del-hogar |
| Educacion | IconSchool | educacion |
| Mascotas | IconPaw | mascotas |
| Tecnologia | IconDevices | tecnologia |
| Tiendas | IconShoppingBag | tiendas |

### Seccion 4: Negocios destacados

Componente: `components/landing/FeaturedBusinessesSection.tsx`

**Heading:** "Descubre lo que hay en tu comunidad"
**Subheading:** Nombre de la comunidad activa

**Layout:** Scroll horizontal en mobile, grid de 4 columnas en desktop.

Cada BusinessCard (`components/businesses/BusinessCard.tsx`):
```
┌─────────────────────────┐
│  [Cover image]          │  ← aspect-video, rounded-t-xl
├─────────────────────────┤
│  Logo  Nombre negocio   │  ← flex items-center gap-3
│        Categoria        │  ← text-sm text-muted-foreground
│                         │
│  ★ 4.8  ·  Abierto      │  ← Badge verde si esta abierto ahora
│                         │
│  Descripcion corta...   │  ← text-sm, line-clamp-2
└─────────────────────────┘
```

- Si no hay foto de portada: fondo con gradiente suave usando el color de la categoria
- Badge "Abierto" / "Cerrado" calculado desde `business_hours` y hora actual
- Link: toda la card es clickeable → `/businesses/{slug}`
- Debajo del grid: link "Ver todos los negocios →" alineado a la derecha

**Data fetching:** Server Component que consulta:
```sql
SELECT b.*, c.name as category_name, c.icon as category_icon
FROM businesses b
JOIN categories c ON b.category_id = c.id
WHERE b.community_id = :community_id
  AND b.status = 'active'
  AND b.is_featured = true
ORDER BY b.created_at DESC
LIMIT 8
```

### Seccion 5: Como funciona

Componente: `components/landing/HowItWorksSection.tsx`

**Layout:** 3 columnas en desktop, stack vertical en mobile.

| Paso | Icono | Titulo | Descripcion |
|------|-------|--------|-------------|
| 1 | IconSearch | Explora | Navega el directorio de negocios de tu comunidad y encuentra lo que necesitas |
| 2 | IconCalendarEvent | Aparta | Reserva productos o servicios directamente desde la app en segundos |
| 3 | IconMapPin | Disfruta | Acude al negocio en el horario acordado y disfruta de lo local |

Cada paso:
```
┌──────────────────┐
│   (1)  Icon      │  ← Numero + icono en circulo con fondo brand/10
│                  │
│   Titulo         │  ← text-lg font-semibold
│   Descripcion    │  ← text-sm text-muted-foreground
└──────────────────┘
```

- Fondo de seccion: `bg-gray-50`
- Padding: `py-20`
- Linea conectora entre pasos (desktop): un borde dashed sutil

### Seccion 6: CTA para negocios

Componente: `components/landing/BusinessCTASection.tsx`

**Layout:** Centrado, fondo con color brand oscuro o gradiente.

```
┌───────────────────────────────────────┐
│                                       │
│  "Tienes un negocio local?"           │  ← text-2xl font-bold text-white
│                                       │
│  "Registra tu negocio gratis y        │
│   conecta con tu comunidad"           │  ← text-white/80
│                                       │
│  [Registrar mi negocio]               │  ← Button variante blanco/invertido
│                                       │
└───────────────────────────────────────┘
```

- Fondo: gradiente oscuro del color brand `bg-gray-900` o color primario oscuro
- Padding: `py-20`
- Border radius en todo el contenedor: `rounded-2xl mx-4 md:mx-8` (efecto tarjeta floating)
- Link del boton: `/register` si no esta autenticado, `/register-business` si ya tiene cuenta

### Seccion 7: Footer

Componente: `components/layout/Footer.tsx`

```
Desktop (3 columnas):

Local Conecta              Explorar               Legal
Conectando comunidades     Negocios               Terminos de servicio
con sus negocios locales   Categorias             Privacidad
                           Promociones

                           Para negocios
                           Registrar negocio

─────────────────────────────────────────────────
© 2025 Local Conecta. Todos los derechos reservados.
```

- Fondo: `bg-gray-50`, texto en grises
- Padding: `py-12`
- Links funcionales desde MVP
- Mobile: stack vertical

### Componentes a crear (orden de implementacion)

```
1. components/layout/Navbar.tsx          ← Usado en layout de (main)
2. components/layout/Footer.tsx          ← Usado en layout de (main)
3. components/shared/SearchBar.tsx       ← Reutilizable en Hero y /businesses
4. components/landing/HeroSection.tsx
5. components/landing/CategoriesSection.tsx
6. components/landing/FeaturedBusinessesSection.tsx
7. components/businesses/BusinessCard.tsx ← Reutilizable en directorio
8. components/landing/HowItWorksSection.tsx
9. components/landing/BusinessCTASection.tsx
```

### Variantes por estado de autenticacion

| Elemento | Visitor (no auth) | User (auth) |
|----------|-------------------|-------------|
| Navbar CTA | "Iniciar sesion" | Avatar + dropdown (Mi cuenta, Mis reservas, Cerrar sesion) |
| Hero | Sin cambios | Sin cambios |
| CTA Negocios | "Registrar mi negocio" → /register | "Registrar mi negocio" → /register-business |
| Footer | Sin cambios | Sin cambios |

### Composicion final en page.tsx

```tsx
// app/(main)/page.tsx
import { HeroSection } from '@/components/landing/HeroSection'
import { CategoriesSection } from '@/components/landing/CategoriesSection'
import { FeaturedBusinessesSection } from '@/components/landing/FeaturedBusinessesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { BusinessCTASection } from '@/components/landing/BusinessCTASection'

export default async function HomePage() {
  // RSC: fetch data directamente
  const categories = await getCategories()
  const featuredBusinesses = await getFeaturedBusinesses()

  return (
    <main>
      <HeroSection categories={categories} />
      <CategoriesSection categories={categories} />
      <FeaturedBusinessesSection businesses={featuredBusinesses} />
      <HowItWorksSection />
      <BusinessCTASection />
    </main>
  )
}
```

---

## 7. Dependencias a Instalar

### Requeridas para MVP

```bash
# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Formularios y validacion
npm install zod

# Utilidades de fecha
npm install date-fns

# Upload de imagenes (UI)
npm install react-dropzone
```

### CLI de desarrollo

```bash
# Supabase CLI (desarrollo local)
brew install supabase/tap/supabase

# Generador de tipos de Supabase
npx supabase gen types typescript --project-id <ref> > lib/types/database.ts
```

### Ya instaladas (verificado)

- next 16.1.6
- react 19.2.3
- tailwindcss 4
- shadcn/ui (componentes en /components/ui)
- @tabler/icons-react (iconos)
- clsx + tailwind-merge (utilidades CSS)

---

## 8. Decisiones Tecnicas Justificadas

| Decision | Alternativa descartada | Justificacion |
|----------|----------------------|---------------|
| **Server Actions para mutaciones** | API Routes / tRPC | Menos boilerplate, tipado end-to-end nativo, colocacion con UI |
| **Zod para validacion** | Yup / Valibot | Ecosistema mas grande, integracion nativa con Server Actions via useActionState |
| **Sin ORM (queries directas a Supabase)** | Prisma / Drizzle | Supabase client ya provee un query builder tipado; agregar ORM es redundante |
| **Roles en tabla profiles** | JWT custom claims | Mas simple de modificar sin regenerar tokens; para MVP no hay impacto de performance |
| **Slugs en URL (no UUIDs)** | UUIDs visibles | URLs legibles mejoran SEO y UX: `/businesses/pasteleria-maria` |
| **date-fns sobre dayjs/moment** | dayjs | Tree-shakeable, funcional, bien tipado |
| **Sin state manager global** | Zustand / Jotai | RSC + Server Actions eliminan la necesidad; evita complejidad prematura |
| **Cookie-based auth (ssr)** | Token en localStorage | Compatible con RSC, protege contra XSS, funciona en middleware |

---

## 9. Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # Solo server-side, NUNCA en client

# Opcional MVP
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_COMMUNITY_SLUG=mi-comunidad
```

---

## 10. Orden de Implementacion Sugerido (MVP)

```
Semana 1-2: Fundamentos
├── Configurar Supabase (proyecto, auth, storage)
├── Crear migrations SQL (todas las tablas + RLS)
├── Seed data (comunidad, categorias)
├── Configurar @supabase/ssr (client, server, middleware)
├── Layout principal + navegacion
└── Flujo de auth (register, login, logout)

Semana 3-4: Negocios
├── Registro de negocio (formulario multi-step)
├── Perfil publico de negocio
├── Dashboard layout + sidebar
├── CRUD de productos/servicios
└── Configuracion de horarios

Semana 5-6: Interaccion
├── Directorio con busqueda y filtros
├── Sistema de reservas
├── Mensajes/solicitudes de informacion
└── Paginas de cuenta del usuario (/account/*)

Semana 7-8: Pulido
├── Estados vacios, loading states, error boundaries
├── Responsive design (mobile-first)
├── Upload de imagenes con preview
├── Testing de flujos criticos
└── Deploy a Vercel + Supabase production
```
