-- ============================================
-- Local Conecta — Seed Data
-- ============================================

-- Default community
INSERT INTO communities (name, slug, description, city, state, country) VALUES
  ('Mi Comunidad', 'mi-comunidad', 'Comunidad de prueba para desarrollo local', 'Ciudad de Mexico', 'CDMX', 'MX');

-- Categories (matching the ones in the landing page)
INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Comida y bebidas', 'comida-y-bebidas', 'IconToolsKitchen2', 1),
  ('Salud y bienestar', 'salud-y-bienestar', 'IconHeartbeat', 2),
  ('Belleza', 'belleza', 'IconSparkles', 3),
  ('Servicios del hogar', 'servicios-del-hogar', 'IconHome', 4),
  ('Educacion', 'educacion', 'IconSchool', 5),
  ('Mascotas', 'mascotas', 'IconPaw', 6),
  ('Tecnologia', 'tecnologia', 'IconDevices', 7),
  ('Tiendas', 'tiendas', 'IconShoppingBag', 8);
