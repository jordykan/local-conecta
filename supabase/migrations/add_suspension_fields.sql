-- Agregar campos para tracking de suspensiones
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;

-- Comentarios
COMMENT ON COLUMN businesses.suspension_reason IS 'Razón por la cual el negocio fue suspendido';
COMMENT ON COLUMN businesses.suspended_at IS 'Fecha y hora en que el negocio fue suspendido';

-- Trigger para actualizar suspended_at automáticamente cuando cambia el status a suspended
CREATE OR REPLACE FUNCTION update_suspended_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'suspended' AND OLD.status != 'suspended' THEN
    NEW.suspended_at = NOW();
  ELSIF NEW.status != 'suspended' AND OLD.status = 'suspended' THEN
    NEW.suspended_at = NULL;
    NEW.suspension_reason = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER businesses_suspended_at_trigger
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_suspended_at();
