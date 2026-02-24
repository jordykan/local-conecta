-- =====================================================================
-- Local Conecta — Datos de prueba (seed demo)
-- =====================================================================
-- INSTRUCCIONES:
--   1. Ejecuta este archivo en el SQL Editor de Supabase Dashboard
--   2. Los usuarios de prueba se crean con contraseña: Demo1234!
--
-- USUARIOS DE PRUEBA:
--   demo1@localconecta.com / Demo1234!  → La Cocina de María (restaurante)
--   demo2@localconecta.com / Demo1234!  → Barbería Don Carlos (barbería)
--   demo3@localconecta.com / Demo1234!  → Tech Fix Express (reparaciones)
--   demo4@localconecta.com / Demo1234!  → Veterinaria Patitas (veterinaria)
--   demo5@localconecta.com / Demo1234!  → Dulcería La Abuela (dulcería)
--   demo6@localconecta.com / Demo1234!  → Estilo Urbano (salón belleza)
--   demo7@localconecta.com / Demo1234!  → Tutorías STEM (educación)
--   demo8@localconecta.com / Demo1234!  → Plomería Express (servicios hogar)
-- =====================================================================

-- Get community id
DO $$
DECLARE
  v_community_id uuid;
  v_cat_comida uuid;
  v_cat_salud uuid;
  v_cat_belleza uuid;
  v_cat_hogar uuid;
  v_cat_educacion uuid;
  v_cat_mascotas uuid;
  v_cat_tecnologia uuid;
  v_cat_tiendas uuid;
  -- users
  v_user1 uuid;
  v_user2 uuid;
  v_user3 uuid;
  v_user4 uuid;
  v_user5 uuid;
  v_user6 uuid;
  v_user7 uuid;
  v_user8 uuid;
  -- businesses
  v_biz1 uuid;
  v_biz2 uuid;
  v_biz3 uuid;
  v_biz4 uuid;
  v_biz5 uuid;
  v_biz6 uuid;
  v_biz7 uuid;
  v_biz8 uuid;
BEGIN
  -- Get references
  SELECT id INTO v_community_id FROM communities WHERE slug = 'mi-comunidad';
  SELECT id INTO v_cat_comida FROM categories WHERE slug = 'comida-y-bebidas';
  SELECT id INTO v_cat_salud FROM categories WHERE slug = 'salud-y-bienestar';
  SELECT id INTO v_cat_belleza FROM categories WHERE slug = 'belleza';
  SELECT id INTO v_cat_hogar FROM categories WHERE slug = 'servicios-del-hogar';
  SELECT id INTO v_cat_educacion FROM categories WHERE slug = 'educacion';
  SELECT id INTO v_cat_mascotas FROM categories WHERE slug = 'mascotas';
  SELECT id INTO v_cat_tecnologia FROM categories WHERE slug = 'tecnologia';
  SELECT id INTO v_cat_tiendas FROM categories WHERE slug = 'tiendas';

  -- ================================================================
  -- CREATE USERS (via Supabase auth)
  -- Password: Demo1234! → bcrypt hash
  -- ================================================================

  -- User 1
  v_user1 := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
  VALUES (v_user1, '00000000-0000-0000-0000-000000000000', 'demo1@localconecta.com',
    crypt('Demo1234!', gen_salt('bf')), now(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"María González"}'::jsonb,
    now(), now(), '', '');
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user1, 'demo1@localconecta.com',
    jsonb_build_object('sub', v_user1, 'email', 'demo1@localconecta.com'),
    'email', now(), now(), now());
  UPDATE profiles SET full_name = 'María González', phone = '5512345001' WHERE id = v_user1;

  -- User 2
  v_user2 := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
  VALUES (v_user2, '00000000-0000-0000-0000-000000000000', 'demo2@localconecta.com',
    crypt('Demo1234!', gen_salt('bf')), now(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Carlos Mendoza"}'::jsonb,
    now(), now(), '', '');
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user2, 'demo2@localconecta.com',
    jsonb_build_object('sub', v_user2, 'email', 'demo2@localconecta.com'),
    'email', now(), now(), now());
  UPDATE profiles SET full_name = 'Carlos Mendoza', phone = '5512345002' WHERE id = v_user2;

  -- User 3
  v_user3 := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
  VALUES (v_user3, '00000000-0000-0000-0000-000000000000', 'demo3@localconecta.com',
    crypt('Demo1234!', gen_salt('bf')), now(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Roberto Sánchez"}'::jsonb,
    now(), now(), '', '');
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user3, 'demo3@localconecta.com',
    jsonb_build_object('sub', v_user3, 'email', 'demo3@localconecta.com'),
    'email', now(), now(), now());
  UPDATE profiles SET full_name = 'Roberto Sánchez', phone = '5512345003' WHERE id = v_user3;

  -- User 4
  v_user4 := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
  VALUES (v_user4, '00000000-0000-0000-0000-000000000000', 'demo4@localconecta.com',
    crypt('Demo1234!', gen_salt('bf')), now(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Ana Martínez"}'::jsonb,
    now(), now(), '', '');
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user4, 'demo4@localconecta.com',
    jsonb_build_object('sub', v_user4, 'email', 'demo4@localconecta.com'),
    'email', now(), now(), now());
  UPDATE profiles SET full_name = 'Ana Martínez', phone = '5512345004' WHERE id = v_user4;

  -- User 5
  v_user5 := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
  VALUES (v_user5, '00000000-0000-0000-0000-000000000000', 'demo5@localconecta.com',
    crypt('Demo1234!', gen_salt('bf')), now(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Rosa Hernández"}'::jsonb,
    now(), now(), '', '');
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user5, 'demo5@localconecta.com',
    jsonb_build_object('sub', v_user5, 'email', 'demo5@localconecta.com'),
    'email', now(), now(), now());
  UPDATE profiles SET full_name = 'Rosa Hernández', phone = '5512345005' WHERE id = v_user5;

  -- User 6
  v_user6 := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
  VALUES (v_user6, '00000000-0000-0000-0000-000000000000', 'demo6@localconecta.com',
    crypt('Demo1234!', gen_salt('bf')), now(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Laura Díaz"}'::jsonb,
    now(), now(), '', '');
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user6, 'demo6@localconecta.com',
    jsonb_build_object('sub', v_user6, 'email', 'demo6@localconecta.com'),
    'email', now(), now(), now());
  UPDATE profiles SET full_name = 'Laura Díaz', phone = '5512345006' WHERE id = v_user6;

  -- User 7
  v_user7 := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
  VALUES (v_user7, '00000000-0000-0000-0000-000000000000', 'demo7@localconecta.com',
    crypt('Demo1234!', gen_salt('bf')), now(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Jorge Ramírez"}'::jsonb,
    now(), now(), '', '');
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user7, 'demo7@localconecta.com',
    jsonb_build_object('sub', v_user7, 'email', 'demo7@localconecta.com'),
    'email', now(), now(), now());
  UPDATE profiles SET full_name = 'Jorge Ramírez', phone = '5512345007' WHERE id = v_user7;

  -- User 8
  v_user8 := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
  VALUES (v_user8, '00000000-0000-0000-0000-000000000000', 'demo8@localconecta.com',
    crypt('Demo1234!', gen_salt('bf')), now(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Miguel Torres"}'::jsonb,
    now(), now(), '', '');
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user8, 'demo8@localconecta.com',
    jsonb_build_object('sub', v_user8, 'email', 'demo8@localconecta.com'),
    'email', now(), now(), now());
  UPDATE profiles SET full_name = 'Miguel Torres', phone = '5512345008' WHERE id = v_user8;

  -- ================================================================
  -- BUSINESSES
  -- ================================================================

  -- 1. La Cocina de María (Comida y bebidas)
  v_biz1 := gen_random_uuid();
  INSERT INTO businesses (id, owner_id, community_id, category_id, name, slug, description, short_description, phone, whatsapp, email, address, status, is_featured)
  VALUES (v_biz1, v_user1, v_community_id, v_cat_comida,
    'La Cocina de María', 'la-cocina-de-maria',
    'Restaurante familiar con más de 15 años sirviendo comida casera mexicana. Nuestros platillos están preparados con ingredientes frescos del mercado local y recetas que pasan de generación en generación.',
    'Comida casera mexicana con el sabor de siempre',
    '5587654321', '5587654321', 'maria@lacocinademaria.com',
    'Calle Hidalgo 45, Col. Centro', 'active', true);

  -- 2. Barbería Don Carlos (Belleza)
  v_biz2 := gen_random_uuid();
  INSERT INTO businesses (id, owner_id, community_id, category_id, name, slug, description, short_description, phone, whatsapp, email, address, status, is_featured)
  VALUES (v_biz2, v_user2, v_community_id, v_cat_belleza,
    'Barbería Don Carlos', 'barberia-don-carlos',
    'Barbería clásica y moderna. Ofrecemos cortes de cabello, diseño de barba, afeitado clásico con navaja y tratamientos capilares. Ambiente relajado con servicio de primera.',
    'Cortes clásicos y modernos para caballeros',
    '5543218765', '5543218765', 'carlos@barberiadoncarlos.com',
    'Av. Juárez 120, Col. Centro', 'active', true);

  -- 3. Tech Fix Express (Tecnología)
  v_biz3 := gen_random_uuid();
  INSERT INTO businesses (id, owner_id, community_id, category_id, name, slug, description, short_description, phone, whatsapp, email, address, status, is_featured)
  VALUES (v_biz3, v_user3, v_community_id, v_cat_tecnologia,
    'Tech Fix Express', 'tech-fix-express',
    'Centro de reparación de dispositivos electrónicos. Especializados en celulares, laptops, tablets y consolas de videojuegos. Servicio express en menos de 2 horas para la mayoría de reparaciones.',
    'Reparación express de celulares y laptops',
    '5598765432', '5598765432', 'soporte@techfix.com',
    'Blvd. Reforma 256, Local 3', 'active', true);

  -- 4. Veterinaria Patitas (Mascotas)
  v_biz4 := gen_random_uuid();
  INSERT INTO businesses (id, owner_id, community_id, category_id, name, slug, description, short_description, phone, whatsapp, email, address, status, is_featured)
  VALUES (v_biz4, v_user4, v_community_id, v_cat_mascotas,
    'Veterinaria Patitas', 'veterinaria-patitas',
    'Clínica veterinaria con atención integral para mascotas. Consultas, vacunación, cirugía, estética canina y felina, y venta de alimentos premium. Más de 10 años cuidando a los mejores amigos de la familia.',
    'Cuidado integral para tu mascota',
    '5567891234', '5567891234', 'citas@patitas.com',
    'Calle Morelos 78, Col. Norte', 'active', true);

  -- 5. Dulcería La Abuela (Tiendas)
  v_biz5 := gen_random_uuid();
  INSERT INTO businesses (id, owner_id, community_id, category_id, name, slug, description, short_description, phone, whatsapp, email, address, status, is_featured)
  VALUES (v_biz5, v_user5, v_community_id, v_cat_tiendas,
    'Dulcería La Abuela', 'dulceria-la-abuela',
    'Dulcería artesanal con más de 20 variedades de dulces mexicanos tradicionales. Desde alegrías y palanquetas hasta mazapanes y ate. Todo hecho a mano con recetas originales.',
    'Dulces artesanales mexicanos hechos con amor',
    '5534567890', '5534567890', 'dulces@laabuela.com',
    'Calle 5 de Mayo 33, Col. Centro', 'active', false);

  -- 6. Estilo Urbano (Belleza)
  v_biz6 := gen_random_uuid();
  INSERT INTO businesses (id, owner_id, community_id, category_id, name, slug, description, short_description, phone, whatsapp, email, address, status, is_featured)
  VALUES (v_biz6, v_user6, v_community_id, v_cat_belleza,
    'Estilo Urbano', 'estilo-urbano',
    'Salón de belleza unisex con las últimas tendencias en cortes, tintes, alaciados y tratamientos capilares. Nuestro equipo está certificado y usa productos de alta calidad para garantizar resultados increíbles.',
    'Salón de belleza unisex con estilo moderno',
    '5521098765', '5521098765', 'citas@estilourbano.com',
    'Av. Los Pinos 89, Col. Jardines', 'active', true);

  -- 7. Tutorías STEM (Educación)
  v_biz7 := gen_random_uuid();
  INSERT INTO businesses (id, owner_id, community_id, category_id, name, slug, description, short_description, phone, whatsapp, email, address, status, is_featured)
  VALUES (v_biz7, v_user7, v_community_id, v_cat_educacion,
    'Tutorías STEM', 'tutorias-stem',
    'Centro de tutorías especializadas en matemáticas, física, química y programación. Clases personalizadas para primaria, secundaria y preparatoria. También ofrecemos cursos de robótica y programación para niños.',
    'Clases de matemáticas, ciencias y programación',
    '5576543210', '5576543210', 'info@tutoriasstem.com',
    'Calle Constitución 67, Col. Educativa', 'active', false);

  -- 8. Plomería Express (Servicios del hogar)
  v_biz8 := gen_random_uuid();
  INSERT INTO businesses (id, owner_id, community_id, category_id, name, slug, description, short_description, phone, whatsapp, email, address, status, is_featured)
  VALUES (v_biz8, v_user8, v_community_id, v_cat_hogar,
    'Plomería Express', 'plomeria-express',
    'Servicio profesional de plomería a domicilio. Reparación de fugas, destape de tuberías, instalación de calentadores, mantenimiento de tinacos y cisternas. Atención las 24 horas.',
    'Plomería profesional a domicilio, 24 horas',
    '5589012345', '5589012345', 'servicio@plomeriaexpress.com',
    'Calle Independencia 150, Col. Sur', 'active', false);

  -- ================================================================
  -- BUSINESS HOURS (all businesses Mon-Sat 9-18, closed Sunday)
  -- ================================================================
  -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  -- Biz 1: La Cocina de María (7am-9pm, abierto domingo hasta 3pm)
  INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed) VALUES
    (v_biz1, 0, '08:00', '15:00', false),
    (v_biz1, 1, '07:00', '21:00', false),
    (v_biz1, 2, '07:00', '21:00', false),
    (v_biz1, 3, '07:00', '21:00', false),
    (v_biz1, 4, '07:00', '21:00', false),
    (v_biz1, 5, '07:00', '21:00', false),
    (v_biz1, 6, '07:00', '21:00', false);

  -- Biz 2: Barbería Don Carlos (9am-7pm, cerrado lunes)
  INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed) VALUES
    (v_biz2, 0, null, null, true),
    (v_biz2, 1, null, null, true),
    (v_biz2, 2, '09:00', '19:00', false),
    (v_biz2, 3, '09:00', '19:00', false),
    (v_biz2, 4, '09:00', '19:00', false),
    (v_biz2, 5, '09:00', '19:00', false),
    (v_biz2, 6, '09:00', '17:00', false);

  -- Biz 3: Tech Fix Express (10am-8pm, cerrado domingo)
  INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed) VALUES
    (v_biz3, 0, null, null, true),
    (v_biz3, 1, '10:00', '20:00', false),
    (v_biz3, 2, '10:00', '20:00', false),
    (v_biz3, 3, '10:00', '20:00', false),
    (v_biz3, 4, '10:00', '20:00', false),
    (v_biz3, 5, '10:00', '20:00', false),
    (v_biz3, 6, '10:00', '18:00', false);

  -- Biz 4: Veterinaria Patitas (8am-6pm, cerrado domingo)
  INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed) VALUES
    (v_biz4, 0, null, null, true),
    (v_biz4, 1, '08:00', '18:00', false),
    (v_biz4, 2, '08:00', '18:00', false),
    (v_biz4, 3, '08:00', '18:00', false),
    (v_biz4, 4, '08:00', '18:00', false),
    (v_biz4, 5, '08:00', '18:00', false),
    (v_biz4, 6, '09:00', '14:00', false);

  -- Biz 5: Dulcería La Abuela (9am-7pm, abierto todos los días)
  INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed) VALUES
    (v_biz5, 0, '10:00', '15:00', false),
    (v_biz5, 1, '09:00', '19:00', false),
    (v_biz5, 2, '09:00', '19:00', false),
    (v_biz5, 3, '09:00', '19:00', false),
    (v_biz5, 4, '09:00', '19:00', false),
    (v_biz5, 5, '09:00', '19:00', false),
    (v_biz5, 6, '09:00', '19:00', false);

  -- Biz 6: Estilo Urbano (10am-8pm, cerrado domingo y lunes)
  INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed) VALUES
    (v_biz6, 0, null, null, true),
    (v_biz6, 1, null, null, true),
    (v_biz6, 2, '10:00', '20:00', false),
    (v_biz6, 3, '10:00', '20:00', false),
    (v_biz6, 4, '10:00', '20:00', false),
    (v_biz6, 5, '10:00', '20:00', false),
    (v_biz6, 6, '10:00', '18:00', false);

  -- Biz 7: Tutorías STEM (3pm-8pm, cerrado domingo)
  INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed) VALUES
    (v_biz7, 0, null, null, true),
    (v_biz7, 1, '15:00', '20:00', false),
    (v_biz7, 2, '15:00', '20:00', false),
    (v_biz7, 3, '15:00', '20:00', false),
    (v_biz7, 4, '15:00', '20:00', false),
    (v_biz7, 5, '15:00', '20:00', false),
    (v_biz7, 6, '09:00', '14:00', false);

  -- Biz 8: Plomería Express (24h lun-sab, emergencias domingo)
  INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed) VALUES
    (v_biz8, 0, '08:00', '14:00', false),
    (v_biz8, 1, '07:00', '22:00', false),
    (v_biz8, 2, '07:00', '22:00', false),
    (v_biz8, 3, '07:00', '22:00', false),
    (v_biz8, 4, '07:00', '22:00', false),
    (v_biz8, 5, '07:00', '22:00', false),
    (v_biz8, 6, '07:00', '18:00', false);

  -- ================================================================
  -- PRODUCTS & SERVICES
  -- ================================================================

  -- ── La Cocina de María (comida) ──
  INSERT INTO products_services (business_id, type, name, description, price, price_type, is_available, is_bookable, stock, sort_order) VALUES
    (v_biz1, 'product', 'Enchiladas Verdes', 'Tortillas rellenas de pollo bañadas en salsa verde con crema y queso. Acompañadas de arroz y frijoles.', 85, 'fixed', true, true, null, 1),
    (v_biz1, 'product', 'Chilaquiles Rojos', 'Totopos bañados en salsa roja con pollo, crema, queso y cebolla. El desayuno favorito de la casa.', 70, 'fixed', true, true, null, 2),
    (v_biz1, 'product', 'Pozole Rojo', 'Caldo tradicional con maíz pozolero, carne de cerdo, lechuga, rábano, tostadas y orégano. Solo fines de semana.', 95, 'fixed', true, true, null, 3),
    (v_biz1, 'product', 'Tacos de Guisado', 'Orden de 4 tacos con el guisado de tu elección: chicharrón, mole, picadillo, rajas con crema.', 60, 'fixed', true, false, null, 4),
    (v_biz1, 'product', 'Agua Fresca del Día', 'Vaso grande de agua fresca natural: jamaica, horchata, limón o tamarindo.', 25, 'fixed', true, false, null, 5),
    (v_biz1, 'product', 'Pastel de Tres Leches', 'Rebanada generosa de pastel de tres leches casero con durazno.', 55, 'fixed', true, false, null, 6),
    (v_biz1, 'service', 'Pedido para Evento', 'Preparamos comida para tu evento especial. Menú personalizado con guisados, arroces y postres.', 150, 'per_hour', true, true, null, 7),
    (v_biz1, 'service', 'Comida a Domicilio', 'Entrega a domicilio en la colonia Centro y alrededores. Pedido mínimo $200.', null, 'quote', true, false, null, 8);

  -- ── Barbería Don Carlos (belleza) ──
  INSERT INTO products_services (business_id, type, name, description, price, price_type, is_available, is_bookable, duration_minutes, sort_order) VALUES
    (v_biz2, 'service', 'Corte Clásico', 'Corte de cabello tradicional con tijera y máquina. Incluye lavado y secado.', 120, 'fixed', true, true, 30, 1),
    (v_biz2, 'service', 'Corte + Diseño de Barba', 'Corte de cabello con diseño y perfilado de barba con navaja. El combo más popular.', 200, 'fixed', true, true, 45, 2),
    (v_biz2, 'service', 'Afeitado Clásico', 'Afeitado tradicional con navaja, toalla caliente, espuma artesanal y aftershave.', 150, 'fixed', true, true, 30, 3),
    (v_biz2, 'service', 'Tinte de Cabello', 'Aplicación de tinte para cabello o barba. Incluye consulta de color y lavado.', 250, 'starting_at', true, true, 60, 4),
    (v_biz2, 'service', 'Tratamiento Capilar', 'Masaje craneal con aceites esenciales y mascarilla nutritiva. Ideal para cabello maltratado.', 180, 'fixed', true, true, 40, 5),
    (v_biz2, 'product', 'Cera para Cabello', 'Cera mate de fijación media para peinados con textura natural. 100g.', 180, 'fixed', true, false, null, 6),
    (v_biz2, 'product', 'Aceite para Barba', 'Aceite hidratante con argán y vitamina E para suavizar y dar brillo a la barba. 30ml.', 220, 'fixed', true, false, null, 7),
    (v_biz2, 'service', 'Corte Infantil', 'Corte de cabello para niños menores de 12 años. Ambiente divertido y paciente.', 80, 'fixed', true, true, 20, 8);

  -- ── Tech Fix Express (tecnología) ──
  INSERT INTO products_services (business_id, type, name, description, price, price_type, is_available, is_bookable, duration_minutes, stock, sort_order) VALUES
    (v_biz3, 'service', 'Cambio de Pantalla iPhone', 'Reemplazo de pantalla para iPhone (todos los modelos). Pantalla original con garantía de 6 meses.', 800, 'starting_at', true, true, 60, null, 1),
    (v_biz3, 'service', 'Cambio de Pantalla Samsung', 'Reemplazo de pantalla para Samsung Galaxy. AMOLED original con garantía.', 900, 'starting_at', true, true, 90, null, 2),
    (v_biz3, 'service', 'Cambio de Batería', 'Reemplazo de batería para celulares y tablets. Batería nueva con garantía de 3 meses.', 400, 'starting_at', true, true, 30, null, 3),
    (v_biz3, 'service', 'Reparación de Laptop', 'Diagnóstico y reparación general de laptops: pantalla, teclado, SSD, RAM, sistema operativo.', null, 'quote', true, true, 120, null, 4),
    (v_biz3, 'service', 'Limpieza de Consola', 'Limpieza interna profunda, cambio de pasta térmica y mantenimiento preventivo para PS4/PS5/Xbox.', 500, 'fixed', true, true, 90, null, 5),
    (v_biz3, 'product', 'Funda Uso Rudo', 'Funda protectora antigolpes para iPhone y Samsung. Diseño militar con soporte.', 250, 'starting_at', true, false, null, 30, 6),
    (v_biz3, 'product', 'Mica de Cristal Templado', 'Protector de pantalla de cristal templado 9H. Instalación incluida.', 150, 'fixed', true, false, null, 50, 7),
    (v_biz3, 'product', 'Cable USB-C Reforzado', 'Cable de carga rápida USB-C de 1.5m con trenzado de nylon. Compatible con carga rápida.', 120, 'fixed', true, false, null, 40, 8);

  -- ── Veterinaria Patitas (mascotas) ──
  INSERT INTO products_services (business_id, type, name, description, price, price_type, is_available, is_bookable, duration_minutes, stock, sort_order) VALUES
    (v_biz4, 'service', 'Consulta General', 'Revisión completa de tu mascota: peso, temperatura, auscultación y exploración física.', 350, 'fixed', true, true, 30, null, 1),
    (v_biz4, 'service', 'Vacunación Canina', 'Esquema completo de vacunación para perros. Incluye cartilla y certificado.', 400, 'starting_at', true, true, 20, null, 2),
    (v_biz4, 'service', 'Vacunación Felina', 'Esquema de vacunación para gatos. Triple felina y antirrábica.', 350, 'starting_at', true, true, 20, null, 3),
    (v_biz4, 'service', 'Estética Canina Completa', 'Baño, corte de pelo, limpieza de oídos, corte de uñas y perfume. Para razas pequeñas y medianas.', 400, 'starting_at', true, true, 90, null, 4),
    (v_biz4, 'service', 'Cirugía de Esterilización', 'Esterilización segura con anestesia, monitoreo y medicamento post-operatorio.', 1200, 'starting_at', true, true, 120, null, 5),
    (v_biz4, 'product', 'Croquetas Premium 10kg', 'Alimento premium para perro adulto raza mediana. Alto contenido proteico.', 650, 'fixed', true, false, null, 15, 6),
    (v_biz4, 'product', 'Arena para Gato 10L', 'Arena aglutinante con control de olores. Biodegradable y libre de polvo.', 180, 'fixed', true, false, null, 25, 7),
    (v_biz4, 'product', 'Collar Antipulgas', 'Collar antipulgas y garrapatas con 8 meses de protección. Para perros medianos y grandes.', 350, 'fixed', true, false, null, 20, 8);

  -- ── Dulcería La Abuela (tiendas) ──
  INSERT INTO products_services (business_id, type, name, description, price, price_type, is_available, is_bookable, stock, sort_order) VALUES
    (v_biz5, 'product', 'Caja de Alegrías', 'Caja con 12 alegrías de amaranto artesanales. Sabores: natural, chocolate y fresa.', 80, 'fixed', true, false, 25, 1),
    (v_biz5, 'product', 'Palanqueta de Cacahuate', 'Paquete con 6 palanquetas artesanales de cacahuate y piloncillo.', 50, 'fixed', true, false, 30, 2),
    (v_biz5, 'product', 'Mazapán Artesanal', 'Bolsa con 20 mazapanes de cacahuate hechos a mano. Textura perfecta.', 60, 'fixed', true, false, 40, 3),
    (v_biz5, 'product', 'Ate de Guayaba', 'Rollo de ate de guayaba de 500g. Preparado con fruta natural sin conservadores.', 45, 'fixed', true, false, 20, 4),
    (v_biz5, 'product', 'Cajeta de Celaya', 'Frasco de cajeta artesanal de 350ml. La auténtica de Celaya, Guanajuato.', 90, 'fixed', true, false, 15, 5),
    (v_biz5, 'product', 'Cocadas Surtidas', 'Bolsa con 12 cocadas surtidas: natural, rosa, cajeta y chocolate.', 55, 'fixed', true, false, 35, 6),
    (v_biz5, 'product', 'Obleas con Cajeta', 'Paquete de 8 obleas rellenas de cajeta artesanal.', 40, 'fixed', true, false, 20, 7),
    (v_biz5, 'service', 'Mesa de Dulces para Evento', 'Montamos una mesa de dulces mexicanos para tu evento. Incluye decoración temática y variedad de dulces.', 2500, 'starting_at', true, true, null, 8);

  -- ── Estilo Urbano (belleza) ──
  INSERT INTO products_services (business_id, type, name, description, price, price_type, is_available, is_bookable, duration_minutes, sort_order) VALUES
    (v_biz6, 'service', 'Corte de Cabello Mujer', 'Corte personalizado que incluye lavado, acondicionamiento y secado con pistola.', 250, 'fixed', true, true, 45, 1),
    (v_biz6, 'service', 'Corte de Cabello Hombre', 'Corte moderno con técnica fade o clásica. Incluye lavado y styling.', 150, 'fixed', true, true, 30, 2),
    (v_biz6, 'service', 'Tinte Completo', 'Aplicación de tinte completo con productos profesionales. Incluye lavado y sellado.', 600, 'starting_at', true, true, 120, 3),
    (v_biz6, 'service', 'Mechas/Balayage', 'Técnica de iluminación con mechas o balayage para un look natural y sofisticado.', 1200, 'starting_at', true, true, 180, 4),
    (v_biz6, 'service', 'Alaciado con Keratina', 'Tratamiento de keratina brasileña para alisar y nutrir el cabello. Resultado hasta 4 meses.', 1500, 'starting_at', true, true, 150, 5),
    (v_biz6, 'service', 'Peinado para Evento', 'Peinado completo para bodas, XV años, graduaciones o eventos especiales.', 500, 'starting_at', true, true, 60, 6),
    (v_biz6, 'service', 'Maquillaje Profesional', 'Maquillaje profesional para eventos especiales. Incluye prueba previa.', 800, 'fixed', true, true, 60, 7),
    (v_biz6, 'product', 'Shampoo Sin Sulfatos', 'Shampoo profesional sin sulfatos para cabello teñido. 300ml.', 280, 'fixed', true, false, null, 8);

  -- ── Tutorías STEM (educación) ──
  INSERT INTO products_services (business_id, type, name, description, price, price_type, is_available, is_bookable, duration_minutes, sort_order) VALUES
    (v_biz7, 'service', 'Tutoría de Matemáticas', 'Clase personalizada de matemáticas para primaria, secundaria o preparatoria. Álgebra, cálculo, geometría.', 200, 'per_hour', true, true, 60, 1),
    (v_biz7, 'service', 'Tutoría de Física', 'Clase de física con enfoque práctico. Mecánica, termodinámica, electromagnetismo.', 220, 'per_hour', true, true, 60, 2),
    (v_biz7, 'service', 'Tutoría de Química', 'Clase de química orgánica e inorgánica. Preparación para exámenes.', 220, 'per_hour', true, true, 60, 3),
    (v_biz7, 'service', 'Curso de Programación (Niños)', 'Curso de programación con Scratch y Python para niños de 8-14 años. Aprenden jugando.', 300, 'per_hour', true, true, 90, 4),
    (v_biz7, 'service', 'Curso de Robótica', 'Taller de robótica con kits Arduino. Construyen y programan su propio robot.', 350, 'per_hour', true, true, 120, 5),
    (v_biz7, 'service', 'Preparación Examen Admisión', 'Preparación intensiva para examen de admisión a universidad. Matemáticas, español y razonamiento.', 250, 'per_hour', true, true, 90, 6),
    (v_biz7, 'product', 'Kit de Robótica Básico', 'Kit con Arduino Uno, cables, LEDs, sensores y manual de proyectos.', 850, 'fixed', true, false, null, 7),
    (v_biz7, 'product', 'Guía Examen Admisión UNAM', 'Guía completa actualizada para el examen de admisión UNAM. Incluye ejercicios resueltos.', 350, 'fixed', true, false, null, 8);

  -- ── Plomería Express (servicios del hogar) ──
  INSERT INTO products_services (business_id, type, name, description, price, price_type, is_available, is_bookable, duration_minutes, sort_order) VALUES
    (v_biz8, 'service', 'Reparación de Fugas', 'Detección y reparación de fugas de agua en tuberías, llaves y conexiones.', 350, 'starting_at', true, true, 60, 1),
    (v_biz8, 'service', 'Destape de Drenaje', 'Destape de drenajes y tuberías con equipo especializado. Coladeras, lavabos y WC.', 500, 'starting_at', true, true, 45, 2),
    (v_biz8, 'service', 'Instalación de Calentador', 'Instalación de calentador de agua (gas o solar). Incluye conexiones y prueba de funcionamiento.', 1200, 'starting_at', true, true, 180, 3),
    (v_biz8, 'service', 'Mantenimiento de Tinaco', 'Lavado y desinfección de tinaco o cisterna. Servicio completo con certificado.', 800, 'fixed', true, true, 120, 4),
    (v_biz8, 'service', 'Instalación de WC/Lavabo', 'Instalación o reemplazo de sanitarios, lavabos y accesorios de baño.', 600, 'starting_at', true, true, 90, 5),
    (v_biz8, 'service', 'Emergencia Plomería 24h', 'Servicio de emergencia fuera de horario regular. Llegamos en menos de 1 hora.', 800, 'starting_at', true, true, 60, 6),
    (v_biz8, 'service', 'Revisión General de Tubería', 'Inspección completa del sistema de tuberías con cámara y reporte detallado.', 500, 'fixed', true, true, 120, 7),
    (v_biz8, 'product', 'Kit Reparación Básico', 'Kit con empaques, teflón, pasta selladora y herramienta básica para reparaciones menores.', 250, 'fixed', true, false, null, 8);

  RAISE NOTICE '✅ Seed data inserted: 8 users, 8 businesses, 64 products/services, business hours';
END $$;
