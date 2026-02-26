# Configuración de Supabase Realtime

Este documento contiene las instrucciones paso a paso para configurar Supabase Realtime en el proyecto Local Conecta.

## 1. Aplicar la Migración SQL

### Opción A: Usando Supabase Dashboard (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com/)
2. Navega a **SQL Editor** en el menú lateral
3. Haz clic en **New Query**
4. Copia y pega el contenido del archivo `/supabase/migrations/004_realtime_messages.sql`
5. Haz clic en **Run** para ejecutar la migración

### Opción B: Usando Supabase CLI (Requiere instalación)

```bash
# Instalar Supabase CLI (si no lo tienes)
npm install -g supabase

# Iniciar sesión
supabase login

# Aplicar migraciones pendientes
supabase db push

# O aplicar solo esta migración
supabase db push --include-migration 004_realtime_messages.sql
```

## 2. Habilitar Realtime en Supabase Dashboard

Después de aplicar la migración SQL, debes habilitar Realtime para la tabla `messages`:

1. Ve a **Database** > **Replication** en el menú lateral
2. Busca la tabla `messages` en la lista
3. Habilita el switch de **Realtime**
4. Selecciona los eventos que quieres escuchar:
   - ✅ **INSERT** - Para nuevos mensajes
   - ✅ **UPDATE** - Para mensajes marcados como leídos
   - ❌ **DELETE** - No necesario (no eliminamos mensajes)

<img width="600" alt="Supabase Realtime Configuration" src="https://supabase.com/docs/img/realtime-replication.png" />

## 3. Verificar la Configuración

Para verificar que Realtime está habilitado correctamente:

1. Ve a **Database** > **Tables**
2. Haz clic en la tabla `messages`
3. En la parte superior derecha, deberías ver un indicador verde de "Realtime enabled"

También puedes ejecutar esta query para verificar:

```sql
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename = 'messages';
```

Si devuelve una fila con `messages`, significa que Realtime está habilitado.

## 4. Verificar las Funciones

Verifica que las funciones se crearon correctamente:

```sql
-- Verificar get_unread_count
SELECT get_unread_count('user-uuid-aqui');

-- Verificar get_business_unread_count
SELECT get_business_unread_count('business-uuid-aqui');
```

Ambas deberían devolver un número (puede ser 0).

## 5. Variables de Entorno

Asegúrate de que tu archivo `.env.local` tenga las variables correctas:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-supabase-anon-key
```

Estas variables ya deberían estar configuradas desde el MVP.

## 6. Siguientes Pasos

Una vez completada la configuración:

1. ✅ Los hooks de Realtime funcionarán correctamente
2. ✅ Los mensajes se actualizarán en tiempo real
3. ✅ El contador de mensajes no leídos funcionará

## Troubleshooting

### Error: "realtime is not enabled for this table"

**Solución:** Ve a Dashboard > Database > Replication y habilita Realtime para `messages`.

### Error: "permission denied for function get_unread_count"

**Solución:** Ejecuta:
```sql
GRANT EXECUTE ON FUNCTION get_unread_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_business_unread_count(uuid) TO authenticated;
```

### Los mensajes no se actualizan en tiempo real

**Solución:**
1. Verifica que Realtime está habilitado en el Dashboard
2. Revisa la consola del navegador para errores
3. Verifica que no hay errores de RLS (Row Level Security)
4. Asegúrate de que las policies de RLS permiten SELECT en messages

### Error: "publication supabase_realtime does not exist"

**Solución:** La publicación se crea automáticamente en Supabase. Si no existe:
```sql
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

## Límites de Realtime

- **Plan Free:** 200 conexiones concurrentes
- **Plan Pro:** 500 conexiones concurrentes
- **Plan Team:** 1,000+ conexiones concurrentes

Para monitorear el uso actual:
1. Ve a **Settings** > **Usage** en Supabase Dashboard
2. Revisa la sección "Realtime Connections"

## Recursos

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Realtime Best Practices](https://supabase.com/docs/guides/realtime/best-practices)
- [Realtime Rate Limits](https://supabase.com/docs/guides/realtime/rate-limits)
