-- ============================================
-- Local Conecta — Initial Schema
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. COMMUNITIES
-- ============================================
CREATE TABLE communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  city text,
  state text,
  country text DEFAULT 'MX',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "communities_read_public" ON communities
  FOR SELECT USING (is_active = true);

-- ============================================
-- 2. PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  phone text,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'business_owner', 'community_admin', 'super_admin')),
  community_id uuid REFERENCES communities(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read_public" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. CATEGORIES
-- ============================================
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  sort_order int DEFAULT 0
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_read_public" ON categories
  FOR SELECT USING (true);

-- ============================================
-- 4. BUSINESSES
-- ============================================
CREATE TABLE businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES communities(id),
  category_id uuid NOT NULL REFERENCES categories(id),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  logo_url text,
  cover_url text,
  phone text,
  whatsapp text,
  email text,
  address text,
  latitude decimal,
  longitude decimal,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_businesses_community_status ON businesses(community_id, status);
CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_businesses_category ON businesses(category_id);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "businesses_read_active" ON businesses
  FOR SELECT USING (status = 'active' OR owner_id = auth.uid());

CREATE POLICY "businesses_insert_auth" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "businesses_update_owner" ON businesses
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "businesses_delete_owner" ON businesses
  FOR DELETE USING (auth.uid() = owner_id);

-- ============================================
-- 5. BUSINESS HOURS
-- ============================================
CREATE TABLE business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time time,
  close_time time,
  is_closed boolean DEFAULT false,
  UNIQUE(business_id, day_of_week)
);

ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "business_hours_read_public" ON business_hours
  FOR SELECT USING (true);

CREATE POLICY "business_hours_write_owner" ON business_hours
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- ============================================
-- 6. PRODUCTS & SERVICES
-- ============================================
CREATE TABLE products_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('product', 'service')),
  name text NOT NULL,
  description text,
  price decimal,
  price_type text DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'starting_at', 'per_hour', 'quote')),
  image_url text,
  is_available boolean DEFAULT true,
  is_bookable boolean DEFAULT false,
  stock int,
  duration_minutes int,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_products_business ON products_services(business_id);

ALTER TABLE products_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_read_public" ON products_services
  FOR SELECT USING (true);

CREATE POLICY "products_write_owner" ON products_services
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- ============================================
-- 7. BOOKINGS
-- ============================================
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_service_id uuid NOT NULL REFERENCES products_services(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  booking_date date NOT NULL,
  booking_time time,
  quantity int DEFAULT 1,
  notes text,
  cancellation_reason text,
  confirmed_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_bookings_user ON bookings(user_id, status);
CREATE INDEX idx_bookings_business ON bookings(business_id, status);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_read_own" ON bookings
  FOR SELECT USING (
    auth.uid() = user_id
    OR business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "bookings_insert_auth" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookings_update_involved" ON bookings
  FOR UPDATE USING (
    auth.uid() = user_id
    OR business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- ============================================
-- 8. PROMOTIONS
-- ============================================
CREATE TABLE promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text,
  discount_type text CHECK (discount_type IN ('percentage', 'fixed', 'bogo', 'freeform')),
  discount_value decimal,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promotions_read_active" ON promotions
  FOR SELECT USING (
    is_active = true AND (ends_at IS NULL OR ends_at > now())
    OR business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "promotions_write_owner" ON promotions
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- ============================================
-- 9. MESSAGES
-- ============================================
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_read_involved" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id
    OR business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "messages_insert_auth" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update_business_owner" ON messages
  FOR UPDATE USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- ============================================
-- 10. FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_businesses
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_products_services
  BEFORE UPDATE ON products_services
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Helper: check business ownership
CREATE OR REPLACE FUNCTION public.is_business_owner(b_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM businesses
    WHERE id = b_id AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
