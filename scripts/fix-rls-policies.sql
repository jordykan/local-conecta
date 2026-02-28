-- ============================================================================
-- ARREGLAR POLÍTICAS RLS PARA PERMITIR CREACIÓN DE PERFILES
-- ============================================================================
-- Este script configura las políticas RLS correctamente para que el trigger
-- pueda crear perfiles automáticamente
-- ============================================================================

-- Paso 1: Eliminar políticas existentes que puedan estar bloqueando
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Paso 2: Crear políticas RLS correctas
-- ============================================================================

-- Permitir que los usuarios vean todos los perfiles (necesario para el directorio)
CREATE POLICY "Anyone can view profiles"
ON profiles FOR SELECT
USING (true);

-- Permitir que los usuarios actualicen su propio perfil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- CRÍTICO: Permitir INSERT desde el trigger (authenticated users)
-- Esta política permite que el trigger cree el perfil cuando se registra un usuario
CREATE POLICY "Enable insert for new users"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Paso 3: Verificar que RLS esté habilitado
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Paso 4: Mostrar las políticas creadas
-- ============================================================================
SELECT
    tablename,
    policyname,
    cmd as comando,
    CASE
        WHEN cmd = 'SELECT' THEN 'Lectura (todos)'
        WHEN cmd = 'INSERT' THEN 'Inserción (usuario propio)'
        WHEN cmd = 'UPDATE' THEN 'Actualización (usuario propio)'
        ELSE cmd
    END as descripcion
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd;
