-- ============================================================================
-- CREAR COMUNIDAD POR DEFECTO
-- ============================================================================
-- Este script crea una comunidad por defecto para poder registrar usuarios
-- ============================================================================

INSERT INTO communities (name, slug, description, city, state, country, is_active)
VALUES (
  'Mi Comunidad',
  'mi-comunidad',
  'Comunidad local para conectar negocios y vecinos',
  'Ciudad',
  'Estado',
  'México',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- Verificar que se creó
DO $$
DECLARE
    community_count INTEGER;
    community_id UUID;
    community_name TEXT;
BEGIN
    SELECT COUNT(*) INTO community_count FROM communities;

    IF community_count > 0 THEN
        SELECT id, name INTO community_id, community_name FROM communities LIMIT 1;
        RAISE NOTICE '';
        RAISE NOTICE '✅ COMUNIDAD CREADA EXITOSAMENTE';
        RAISE NOTICE '================================================';
        RAISE NOTICE 'ID: %', community_id;
        RAISE NOTICE 'Nombre: %', community_name;
        RAISE NOTICE 'Total de comunidades: %', community_count;
        RAISE NOTICE '================================================';
        RAISE NOTICE '';
        RAISE NOTICE '🎉 Ahora puedes registrar nuevos usuarios!';
    ELSE
        RAISE NOTICE '❌ No se pudo crear la comunidad';
    END IF;
END $$;
