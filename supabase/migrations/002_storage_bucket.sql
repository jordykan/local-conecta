-- ============================================
-- Storage bucket para imagenes de negocios
-- ============================================

-- Crear bucket publico
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Politica: cualquiera puede ver archivos (bucket es publico)
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'public');

-- Politica: usuarios autenticados pueden subir archivos
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'public');

-- Politica: usuarios autenticados pueden actualizar sus archivos
CREATE POLICY "Authenticated users can update own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'public' AND owner_id = auth.uid()::text);

-- Politica: usuarios autenticados pueden eliminar sus archivos
CREATE POLICY "Authenticated users can delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'public' AND owner_id = auth.uid()::text);
