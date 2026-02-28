-- ============================================================================
-- CONFIGURACIÓN DESPUÉS DE LIMPIAR LA BASE DE DATOS
-- ============================================================================
-- Este script configura todo lo necesario después de limpiar la BD
-- Ejecutar en: Supabase SQL Editor
-- ============================================================================

-- PASO 1: Crear comunidad por defecto
-- ============================================================================
INSERT INTO communities (name, slug, description, city, state, country, is_active)
VALUES (
  'Pomuch',
  'pomuch',
  'Comunidad local para conectar negocios y vecinos',
  'Pomuch',
  'Campeche',
  'México',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- PASO 2: Configurar trigger para crear perfiles automáticamente
-- ============================================================================

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Crear la función que maneja nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_community_id UUID;
BEGIN
    -- Obtener la primera comunidad disponible
    SELECT id INTO default_community_id
    FROM public.communities
    WHERE is_active = true
    LIMIT 1;

    -- Insertar el perfil del nuevo usuario
    INSERT INTO public.profiles (id, full_name, community_id, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
        default_community_id,
        'user'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- PASO 3: Verificar configuración
-- ============================================================================
DO $$
DECLARE
    community_count INTEGER;
    community_id UUID;
    community_name TEXT;
    trigger_exists BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE '🎉 CONFIGURACIÓN COMPLETADA';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';

    -- Verificar comunidad
    SELECT COUNT(*) INTO community_count FROM communities;
    IF community_count > 0 THEN
        SELECT id, name INTO community_id, community_name FROM communities LIMIT 1;
        RAISE NOTICE '✅ Comunidad creada:';
        RAISE NOTICE '   ID: %', community_id;
        RAISE NOTICE '   Nombre: %', community_name;
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '❌ No se encontraron comunidades';
        RAISE NOTICE '';
    END IF;

    -- Verificar trigger
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'on_auth_user_created'
    ) INTO trigger_exists;

    IF trigger_exists THEN
        RAISE NOTICE '✅ Trigger configurado:';
        RAISE NOTICE '   Nombre: on_auth_user_created';
        RAISE NOTICE '   Función: handle_new_user()';
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '❌ Trigger no encontrado';
        RAISE NOTICE '';
    END IF;

    RAISE NOTICE '================================================';
    RAISE NOTICE '🚀 TODO LISTO! Ahora puedes:';
    RAISE NOTICE '   1. Registrar nuevos usuarios';
    RAISE NOTICE '   2. Los perfiles se crearán automáticamente';
    RAISE NOTICE '   3. Se asignarán a la comunidad por defecto';
    RAISE NOTICE '================================================';
END $$;
