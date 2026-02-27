-- Migración: Agregar preferencia para notificaciones de promociones
-- Fecha: 2026-02-26
-- Descripción: Agrega campo para notificaciones de promociones en negocios favoritos

-- Agregar columna para notificaciones de promociones
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS notify_new_promotion boolean DEFAULT true;

-- Comentario para documentación
COMMENT ON COLUMN notification_preferences.notify_new_promotion IS 'Notificar al usuario cuando un negocio favorito publica una nueva promoción';
