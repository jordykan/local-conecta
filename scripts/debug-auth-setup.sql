-- ============================================================================
-- SCRIPT DE DEPURACIÓN - Verificar configuración de autenticación
-- ============================================================================
-- Este script verifica que todo esté configurado correctamente
-- ============================================================================

DO $$
DECLARE
    trigger_exists BOOLEAN;
    function_exists BOOLEAN;
    community_count INTEGER;
    community_id UUID;
    community_name TEXT;
    rec RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE '🔍 VERIFICANDO CONFIGURACIÓN DE AUTENTICACIÓN';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';

    -- 1. Verificar que existe la función handle_new_user
    SELECT EXISTS (
        SELECT 1 FROM pg_proc
        WHERE proname = 'handle_new_user'
    ) INTO function_exists;

    IF function_exists THEN
        RAISE NOTICE '✅ Función handle_new_user() existe';
    ELSE
        RAISE NOTICE '❌ ERROR: Función handle_new_user() NO existe';
        RAISE NOTICE '   Solución: Ejecuta setup-after-clean.sql';
    END IF;

    RAISE NOTICE '';

    -- 2. Verificar que existe el trigger
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'on_auth_user_created'
    ) INTO trigger_exists;

    IF trigger_exists THEN
        RAISE NOTICE '✅ Trigger on_auth_user_created existe';
    ELSE
        RAISE NOTICE '❌ ERROR: Trigger on_auth_user_created NO existe';
        RAISE NOTICE '   Solución: Ejecuta setup-after-clean.sql';
    END IF;

    RAISE NOTICE '';

    -- 3. Verificar que existe al menos una comunidad activa
    SELECT COUNT(*) INTO community_count FROM communities WHERE is_active = true;

    IF community_count > 0 THEN
        SELECT id, name INTO community_id, community_name
        FROM communities
        WHERE is_active = true
        LIMIT 1;
    END IF;

    IF community_count > 0 THEN
        RAISE NOTICE '✅ Comunidad activa encontrada';
        RAISE NOTICE '   ID: %', community_id;
        RAISE NOTICE '   Nombre: %', community_name;
    ELSE
        RAISE NOTICE '❌ ERROR: NO hay comunidades activas';
        RAISE NOTICE '   Solución: Ejecuta setup-after-clean.sql';
    END IF;

    RAISE NOTICE '';

    -- 4. Verificar políticas RLS en la tabla profiles
    RAISE NOTICE '📋 Políticas RLS en profiles:';
    FOR rec IN
        SELECT policyname, cmd, qual
        FROM pg_policies
        WHERE tablename = 'profiles'
    LOOP
        RAISE NOTICE '   • %: %', rec.policyname, rec.cmd;
    END LOOP;

    RAISE NOTICE '';

    -- 5. Mostrar el código de la función handle_new_user
    RAISE NOTICE '📄 Código de handle_new_user():';
    FOR rec IN
        SELECT prosrc
        FROM pg_proc
        WHERE proname = 'handle_new_user'
    LOOP
        RAISE NOTICE '%', rec.prosrc;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE '🎯 RESUMEN:';
    RAISE NOTICE '   Función: % | Trigger: % | Comunidad: %',
        CASE WHEN function_exists THEN '✅' ELSE '❌' END,
        CASE WHEN trigger_exists THEN '✅' ELSE '❌' END,
        CASE WHEN community_count > 0 THEN '✅' ELSE '❌' END;
    RAISE NOTICE '================================================';
END $$;
