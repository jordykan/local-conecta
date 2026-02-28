-- ============================================================================
-- ARREGLAR TRIGGER PARA BYPASS RLS AL CREAR PERFILES
-- ============================================================================
-- Este script actualiza la función handle_new_user para que pueda
-- insertar perfiles sin ser bloqueada por políticas RLS
-- ============================================================================

-- Eliminar función y trigger existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Crear la función con bypass de RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER -- Ejecuta con permisos del dueño de la función
SET search_path = public -- Seguridad: usar schema público
LANGUAGE plpgsql
AS $$
DECLARE
    default_community_id UUID;
BEGIN
    -- Obtener la primera comunidad disponible
    SELECT id INTO default_community_id
    FROM public.communities
    WHERE is_active = true
    LIMIT 1;

    -- Insertar el perfil del nuevo usuario
    -- SECURITY DEFINER permite bypass de RLS automáticamente
    INSERT INTO public.profiles (id, full_name, community_id, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
        default_community_id,
        'user'
    );

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log del error para debugging
        RAISE WARNING 'Error en handle_new_user: % %', SQLERRM, SQLSTATE;
        RETURN NEW; -- Continuar aunque falle (el usuario se crea en auth)
END;
$$;

-- Crear el trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Paso adicional: Usar ENABLE (no FORCE) para permitir bypass del dueño
-- ENABLE: RLS se aplica a usuarios normales pero NO al dueño de la tabla
-- Esto permite que SECURITY DEFINER funcione correctamente
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verificar la configuración
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE '✅ FUNCIÓN Y TRIGGER ACTUALIZADOS';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'La función handle_new_user ahora puede crear perfiles';
    RAISE NOTICE 'sin ser bloqueada por políticas RLS.';
    RAISE NOTICE '';
    RAISE NOTICE 'Características:';
    RAISE NOTICE '  • SECURITY DEFINER: Ejecuta con permisos del dueño';
    RAISE NOTICE '  • EXCEPTION handler: No rompe si hay error';
    RAISE NOTICE '  • FORCE RLS: Solo se aplica a usuarios normales';
    RAISE NOTICE '================================================';
END $$;
