# Scripts de Base de Datos

## Clean Database (Limpiar Base de Datos)

Script para eliminar todos los registros de prueba de la base de datos, manteniendo únicamente las categorías.

### ⚠️ ADVERTENCIA

Este script eliminará **TODOS** los datos de las siguientes tablas:
- `favorites` (favoritos)
- `reviews` (reseñas)
- `messages` (mensajes)
- `bookings` (reservas)
- `promotions` (promociones)
- `products_services` (productos/servicios)
- `business_hours` (horarios de negocios)
- `profile_views` (vistas de perfil)
- `push_subscriptions` (suscripciones push)
- `notification_preferences` (preferencias de notificaciones)
- `businesses` (negocios)
- `profiles` (perfiles de usuarios)
- `communities` (comunidades)

**NO se eliminará:**
- `categories` (categorías) ✅

### Requisitos

- Variables de entorno configuradas en `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Uso

```bash
npm run clean-db
```

El script esperará 5 segundos antes de ejecutarse, dándote tiempo para cancelar con `Ctrl+C` si cambias de opinión.

### Proceso

1. El script muestra una advertencia
2. Espera 5 segundos (puedes cancelar con Ctrl+C)
3. Elimina los registros en orden respetando las relaciones entre tablas
4. Muestra un resumen de los registros eliminados
5. Verifica que las categorías se hayan preservado

### Ejemplo de salida

```
⚠️  ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos
   excepto las categorías.

   Presiona Ctrl+C para cancelar o espera 5 segundos para continuar...

🧹 Iniciando limpieza de la base de datos...

🗑️  Limpiando tabla: favorites...
   ✅ 15 registros eliminados
🗑️  Limpiando tabla: reviews...
   ✅ 23 registros eliminados
...

📊 Resumen:
   Total de registros eliminados: 156
   ✅ Categorías preservadas: 12

✨ Limpieza completada exitosamente!
```
