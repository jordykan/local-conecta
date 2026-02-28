-- ============================================================================
-- VERIFICAR CONFIGURACIÓN DE AUTENTICACIÓN (con resultados visibles)
-- ============================================================================

-- 1. Verificar función handle_new_user
SELECT
    'Función handle_new_user' as check_type,
    CASE
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user')
        THEN 'SI EXISTE ✅'
        ELSE 'NO EXISTE ❌'
    END as status;

-- 2. Verificar trigger on_auth_user_created
SELECT
    'Trigger on_auth_user_created' as check_type,
    CASE
        WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created')
        THEN 'SI EXISTE ✅'
        ELSE 'NO EXISTE ❌'
    END as status;

-- 3. Verificar comunidad activa
SELECT
    'Comunidad activa' as check_type,
    CASE
        WHEN COUNT(*) > 0 THEN CONCAT('SI EXISTE ✅ (', COUNT(*), ' comunidad(es))')
        ELSE 'NO EXISTE ❌'
    END as status
FROM communities
WHERE is_active = true;

-- 4. Ver detalles de la comunidad
SELECT
    id,
    name,
    slug,
    city,
    state,
    is_active
FROM communities
WHERE is_active = true
LIMIT 5;

-- 5. Ver políticas RLS en profiles
SELECT
    schemaname,
    tablename,
    policyname,
    cmd as comando,
    CASE
        WHEN cmd = 'SELECT' THEN 'Lectura'
        WHEN cmd = 'INSERT' THEN 'Inserción'
        WHEN cmd = 'UPDATE' THEN 'Actualización'
        WHEN cmd = 'DELETE' THEN 'Eliminación'
        ELSE cmd
    END as tipo_operacion,
    CASE
        WHEN permissive = 'PERMISSIVE' THEN 'Permite'
        ELSE 'Restringe'
    END as tipo_politica,
    roles
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd;

-- 6. Ver el código de la función handle_new_user (si existe)
SELECT
    proname as nombre_funcion,
    prosrc as codigo_fuente
FROM pg_proc
WHERE proname = 'handle_new_user';
