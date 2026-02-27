# Checklist para Despliegue a Producción

## Sistema de Notificaciones Push

### Antes de desplegar:

- [ ] **Aplicar migración 006**
  ```bash
  # Dashboard de Supabase → SQL Editor
  # O con CLI:
  cd supabase
  supabase db push
  ```

- [ ] **Eliminar o proteger página de test**
  - Opción A: Eliminar `app/test-notifications/` completamente
  - Opción B: Agregar middleware de protección (solo admin)
  - Opción C: Mantener solo en desarrollo (`npm run dev`)

- [ ] **Verificar variables de entorno**
  ```bash
  NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_clave_publica
  VAPID_PRIVATE_KEY=tu_clave_privada (Supabase Dashboard)
  SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
  ```

- [ ] **Testing en dispositivo real**
  - [ ] Instalar PWA en iPhone
  - [ ] Aceptar permisos de notificaciones
  - [ ] Crear reserva → Verificar notificación
  - [ ] Dejar reseña → Verificar notificación
  - [ ] Publicar promoción → Verificar notificación (favoritos)

- [ ] **Verificar configuración de notificaciones**
  - [ ] Acceder a `/dashboard/settings/notifications`
  - [ ] Cambiar preferencias
  - [ ] Verificar que se respetan las preferencias

### Después de desplegar:

- [ ] Monitorear logs de Edge Functions
- [ ] Verificar que las notificaciones llegan
- [ ] Verificar que no hay errores en consola

---

## URLs de la App

- Producción: `/dashboard/settings/notifications` (configuración)
- Desarrollo: `/test-notifications` (página de pruebas - eliminar antes de prod)

---

## Notas

- Las notificaciones push solo funcionan en PWA instalada (iOS)
- Formato RFC 8188 requerido para iOS
- Multi-dispositivo: usuarios reciben notificaciones en todos sus dispositivos
