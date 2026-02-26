-- Tabla para trackear visitas a perfiles de negocios
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  visitor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX idx_profile_views_business_id ON profile_views(business_id);
CREATE INDEX idx_profile_views_viewed_at ON profile_views(viewed_at);
CREATE INDEX idx_profile_views_business_viewed ON profile_views(business_id, viewed_at DESC);

-- Índice para detectar vistas duplicadas (mismo visitor/IP en poco tiempo)
CREATE INDEX idx_profile_views_dedup ON profile_views(business_id, visitor_id, ip_address, viewed_at);

-- RLS: Los dueños de negocios solo pueden ver las vistas de su propio negocio
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Política: Insertar vistas (público)
CREATE POLICY "Anyone can insert profile views"
  ON profile_views
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Política: Los dueños pueden ver las vistas de su negocio
CREATE POLICY "Business owners can view their profile views"
  ON profile_views
  FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Comentarios
COMMENT ON TABLE profile_views IS 'Registra cada visita a un perfil público de negocio';
COMMENT ON COLUMN profile_views.business_id IS 'Negocio que fue visitado';
COMMENT ON COLUMN profile_views.visitor_id IS 'Usuario que visitó (NULL si es anónimo)';
COMMENT ON COLUMN profile_views.ip_address IS 'IP del visitante para deduplicación';
COMMENT ON COLUMN profile_views.user_agent IS 'User agent del navegador';
