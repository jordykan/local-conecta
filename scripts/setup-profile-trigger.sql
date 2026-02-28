-- ============================================================================
-- CONFIGURAR TRIGGER PARA CREAR PERFILES AUTOMÁTICAMENTE
-- ============================================================================
-- Este trigger crea automáticamente un perfil cuando se registra un usuario
-- ============================================================================

-- Primero, eliminar el trigger existente si existe
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

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ TRIGGER CONFIGURADO EXITOSAMENTE';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Trigger: on_auth_user_created';
    RAISE NOTICE 'Función: handle_new_user()';
    RAISE NOTICE '';
    RAISE NOTICE 'Los nuevos usuarios ahora:';
    RAISE NOTICE '  • Se crearán con perfil automáticamente';
    RAISE NOTICE '  • Se asignarán a la primera comunidad activa';
    RAISE NOTICE '  • Tendrán rol de "user" por defecto';
    RAISE NOTICE '================================================';
END $$;
