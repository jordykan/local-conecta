-- Migración: Tablas para Push Notifications (PWA)
-- Fecha: 2026-02-26
-- Descripción: Crea tablas para manejar subscripciones de push notifications y preferencias de usuario

-- =====================================================
-- 1. Tabla: push_subscriptions
-- =====================================================
-- Almacena las subscripciones de Web Push de los usuarios
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para push_subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON push_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint
  ON push_subscriptions((subscription->>'endpoint'));

-- Índice único compuesto para evitar subscripciones duplicadas
-- Usamos un índice único en lugar de constraint porque incluye una expresión JSON
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_subscription
  ON push_subscriptions(user_id, (subscription->>'endpoint'));

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_push_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscription_updated_at();

-- =====================================================
-- 2. Tabla: notification_preferences
-- =====================================================
-- Almacena las preferencias de notificaciones de cada usuario
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Preferencias de notificaciones para negocios
  notify_new_booking boolean DEFAULT true,
  notify_new_message boolean DEFAULT true,
  notify_new_review boolean DEFAULT true,

  -- Preferencias de notificaciones para usuarios
  notify_booking_confirmed boolean DEFAULT true,
  notify_booking_cancelled boolean DEFAULT true,
  notify_review_response boolean DEFAULT true,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Un usuario solo puede tener un registro de preferencias
  CONSTRAINT unique_user_preferences UNIQUE(user_id)
);

-- Índice para notification_preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id
  ON notification_preferences(user_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- =====================================================
-- 3. RLS (Row Level Security) Policies
-- =====================================================

-- Habilitar RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas para push_subscriptions
-- Los usuarios solo pueden ver/editar sus propias subscripciones
CREATE POLICY "Users can view their own push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para notification_preferences
-- Los usuarios solo pueden ver/editar sus propias preferencias
CREATE POLICY "Users can view their own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 4. Función: Crear preferencias por defecto al registrarse
-- =====================================================
-- Cuando un usuario se registra, crear sus preferencias por defecto
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear preferencias al crear perfil
CREATE TRIGGER on_profile_created_create_notification_preferences
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- =====================================================
-- 5. Comentarios para documentación
-- =====================================================
COMMENT ON TABLE push_subscriptions IS 'Almacena las subscripciones de Web Push Notifications de los usuarios';
COMMENT ON TABLE notification_preferences IS 'Preferencias de notificaciones de cada usuario';

COMMENT ON COLUMN push_subscriptions.subscription IS 'Objeto JSON de PushSubscription del navegador';
COMMENT ON COLUMN notification_preferences.notify_new_booking IS 'Notificar al negocio cuando recibe una nueva reserva';
COMMENT ON COLUMN notification_preferences.notify_new_message IS 'Notificar cuando recibe un nuevo mensaje';
COMMENT ON COLUMN notification_preferences.notify_new_review IS 'Notificar al negocio cuando recibe una nueva reseña';
COMMENT ON COLUMN notification_preferences.notify_booking_confirmed IS 'Notificar al usuario cuando su reserva es confirmada';
COMMENT ON COLUMN notification_preferences.notify_booking_cancelled IS 'Notificar al usuario cuando su reserva es cancelada';
COMMENT ON COLUMN notification_preferences.notify_review_response IS 'Notificar al usuario cuando el negocio responde a su reseña';
