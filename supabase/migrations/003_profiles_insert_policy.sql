-- ============================================
-- Allow users to insert their own profile row
-- (needed for safety-net upsert in server actions)
-- ============================================

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
