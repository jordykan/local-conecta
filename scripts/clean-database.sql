-- ============================================================================
-- SCRIPT DE LIMPIEZA DE BASE DE DATOS
-- ============================================================================
-- ADVERTENCIA: Este script eliminará TODOS los datos excepto las categorías
-- Ejecutar en: Supabase SQL Editor
-- ============================================================================

-- Mostrar información antes de la limpieza
DO $$
DECLARE
    total_records INTEGER := 0;
    table_count INTEGER;
BEGIN
    RAISE NOTICE '🧹 INICIANDO LIMPIEZA DE BASE DE DATOS';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';

    -- Contar registros en cada tabla
    SELECT COUNT(*) INTO table_count FROM favorites;
    RAISE NOTICE 'Favoritos: % registros', table_count;
    total_records := total_records + table_count;

    SELECT COUNT(*) INTO table_count FROM reviews;
    RAISE NOTICE 'Reseñas: % registros', table_count;
    total_records := total_records + table_count;

    SELECT COUNT(*) INTO table_count FROM messages;
    RAISE NOTICE 'Mensajes: % registros', table_count;
    total_records := total_records + table_count;

    SELECT COUNT(*) INTO table_count FROM bookings;
    RAISE NOTICE 'Reservas: % registros', table_count;
    total_records := total_records + table_count;

    SELECT COUNT(*) INTO table_count FROM promotions;
    RAISE NOTICE 'Promociones: % registros', table_count;
    total_records := total_records + table_count;

    SELECT COUNT(*) INTO table_count FROM products_services;
    RAISE NOTICE 'Productos/Servicios: % registros', table_count;
    total_records := total_records + table_count;

    SELECT COUNT(*) INTO table_count FROM business_hours;
    RAISE NOTICE 'Horarios: % registros', table_count;
    total_records := total_records + table_count;

    SELECT COUNT(*) INTO table_count FROM businesses;
    RAISE NOTICE 'Negocios: % registros', table_count;
    total_records := total_records + table_count;

    SELECT COUNT(*) INTO table_count FROM profiles;
    RAISE NOTICE 'Perfiles: % registros', table_count;
    total_records := total_records + table_count;

    SELECT COUNT(*) INTO table_count FROM communities;
    RAISE NOTICE 'Comunidades: % registros', table_count;
    total_records := total_records + table_count;

    SELECT COUNT(*) INTO table_count FROM auth.users;
    RAISE NOTICE 'Usuarios Auth: % registros', table_count;
    total_records := total_records + table_count;

    SELECT COUNT(*) INTO table_count FROM categories;
    RAISE NOTICE 'Categorías: % registros (SE PRESERVARÁN ✅)', table_count;

    RAISE NOTICE '';
    RAISE NOTICE 'Total de registros a eliminar: %', total_records;
    RAISE NOTICE '================================================';
END $$;

-- Eliminar todos los registros (respetando foreign keys)
BEGIN;

-- 1. Eliminar favoritos (depende de businesses y profiles)
DELETE FROM favorites;

-- 2. Eliminar reseñas (depende de businesses y profiles)
DELETE FROM reviews;

-- 3. Eliminar mensajes (depende de businesses y profiles)
DELETE FROM messages;

-- 4. Eliminar reservas (depende de products_services y profiles)
DELETE FROM bookings;

-- 5. Eliminar promociones (depende de businesses)
DELETE FROM promotions;

-- 6. Eliminar productos/servicios (depende de businesses)
DELETE FROM products_services;

-- 7. Eliminar horarios de negocios (depende de businesses)
DELETE FROM business_hours;

-- 8. Eliminar vistas de perfil (depende de profiles)
DELETE FROM profile_views;

-- 9. Eliminar suscripciones push (depende de profiles)
DELETE FROM push_subscriptions;

-- 10. Eliminar preferencias de notificaciones (depende de profiles)
DELETE FROM notification_preferences;

-- 11. Eliminar negocios (depende de profiles, communities, categories)
DELETE FROM businesses;

-- 12. Eliminar perfiles (depende de communities)
DELETE FROM profiles;

-- 13. Eliminar comunidades
DELETE FROM communities;

-- 14. Eliminar usuarios de autenticación (auth.users)
-- IMPORTANTE: Esto eliminará todas las cuentas de usuario
DELETE FROM auth.users;

-- NO eliminar categorías ✅
-- DELETE FROM categories; -- Comentado para preservar

COMMIT;

-- Mostrar resumen después de la limpieza
DO $$
DECLARE
    category_count INTEGER;
    total_remaining INTEGER := 0;
    table_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE '✨ LIMPIEZA COMPLETADA';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';

    -- Verificar que todas las tablas estén vacías
    SELECT COUNT(*) INTO table_count FROM favorites;
    RAISE NOTICE 'Favoritos restantes: %', table_count;

    SELECT COUNT(*) INTO table_count FROM reviews;
    RAISE NOTICE 'Reseñas restantes: %', table_count;

    SELECT COUNT(*) INTO table_count FROM messages;
    RAISE NOTICE 'Mensajes restantes: %', table_count;

    SELECT COUNT(*) INTO table_count FROM bookings;
    RAISE NOTICE 'Reservas restantes: %', table_count;

    SELECT COUNT(*) INTO table_count FROM promotions;
    RAISE NOTICE 'Promociones restantes: %', table_count;

    SELECT COUNT(*) INTO table_count FROM products_services;
    RAISE NOTICE 'Productos/Servicios restantes: %', table_count;

    SELECT COUNT(*) INTO table_count FROM business_hours;
    RAISE NOTICE 'Horarios restantes: %', table_count;

    SELECT COUNT(*) INTO table_count FROM businesses;
    RAISE NOTICE 'Negocios restantes: %', table_count;

    SELECT COUNT(*) INTO table_count FROM profiles;
    RAISE NOTICE 'Perfiles restantes: %', table_count;

    SELECT COUNT(*) INTO table_count FROM communities;
    RAISE NOTICE 'Comunidades restantes: %', table_count;

    SELECT COUNT(*) INTO table_count FROM auth.users;
    RAISE NOTICE 'Usuarios Auth restantes: %', table_count;

    RAISE NOTICE '';

    SELECT COUNT(*) INTO category_count FROM categories;
    RAISE NOTICE '✅ CATEGORÍAS PRESERVADAS: %', category_count;

    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE '🎉 Base de datos limpia y lista para usar!';
    RAISE NOTICE '================================================';
END $$;
