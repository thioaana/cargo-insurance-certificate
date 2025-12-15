-- ============================================
-- CARGO INSURANCE CERTIFICATE - FULL DATABASE SETUP
-- ============================================
-- Run these SQL statements in Supabase SQL Editor in order.
-- This script creates all tables, policies, and demo data.
--
-- IMPORTANT: After running sections 1-3, you must create demo users
-- in Supabase Authentication before running section 4 (demo data).
-- ============================================

-- ============================================
-- SECTION 1: CREATE TABLES
-- ============================================

-- 1.1 Create user role enum
CREATE TYPE user_role AS ENUM ('admin', 'broker');

-- 1.2 Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'broker',
  broker_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.3 Create contracts table
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number TEXT NOT NULL UNIQUE,
  insured_name TEXT NOT NULL,
  coverage_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  broker_code TEXT NOT NULL,
  sum_insured DECIMAL(15,2) NOT NULL,
  additional_si_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.4 Create certificates table
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number TEXT NOT NULL UNIQUE,
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  insured_name TEXT NOT NULL,
  cargo_description TEXT NOT NULL,
  departure_country TEXT NOT NULL,
  arrival_country TEXT NOT NULL,
  transport_means TEXT NOT NULL,
  loading_date DATE NOT NULL,
  currency TEXT NOT NULL,
  value_local DECIMAL(15,2) NOT NULL,
  value_euro DECIMAL(15,2) NOT NULL,
  exchange_rate DECIMAL(10,6) NOT NULL,
  issue_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.5 Create indexes for performance
CREATE INDEX idx_contracts_broker_code ON contracts(broker_code);
CREATE INDEX idx_certificates_contract_id ON certificates(contract_id);
CREATE INDEX idx_certificates_created_by ON certificates(created_by);
CREATE INDEX idx_profiles_broker_code ON profiles(broker_code);

-- ============================================
-- SECTION 2: CREATE TRIGGERS
-- ============================================

-- 2.1 Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER certificates_updated_at
  BEFORE UPDATE ON certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2.2 Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role, broker_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'broker',
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- SECTION 3: ROW LEVEL SECURITY (RLS)
-- ============================================

-- 3.1 Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- 3.2 Profiles policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3.3 Contracts policies
-- Admins have full access to contracts
CREATE POLICY "Admins can manage contracts"
  ON contracts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Brokers can view contracts matching their broker_code
CREATE POLICY "Brokers can view own contracts"
  ON contracts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND broker_code = contracts.broker_code
    )
  );

-- 3.4 Certificates policies
-- Admins have full access to certificates
CREATE POLICY "Admins can manage certificates"
  ON certificates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Brokers can view certificates for their contracts
CREATE POLICY "Brokers can view own certificates"
  ON certificates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contracts c
      JOIN profiles p ON p.broker_code = c.broker_code
      WHERE c.id = certificates.contract_id AND p.id = auth.uid()
    )
  );

-- Brokers can create certificates for their contracts
CREATE POLICY "Brokers can create certificates for own contracts"
  ON certificates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contracts c
      JOIN profiles p ON p.broker_code = c.broker_code
      WHERE c.id = contract_id AND p.id = auth.uid()
    )
  );

-- Brokers can update their own certificates
CREATE POLICY "Brokers can update own certificates"
  ON certificates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM contracts c
      JOIN profiles p ON p.broker_code = c.broker_code
      WHERE c.id = certificates.contract_id AND p.id = auth.uid()
    )
  );

-- Brokers can delete their own certificates
CREATE POLICY "Brokers can delete own certificates"
  ON certificates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM contracts c
      JOIN profiles p ON p.broker_code = c.broker_code
      WHERE c.id = certificates.contract_id AND p.id = auth.uid()
    )
  );

-- ============================================
-- SECTION 4: DEMO DATA
-- ============================================
-- IMPORTANT: Before running this section, create the following users
-- in Supabase Authentication (Authentication > Users > Add user):
--
-- 1. Admin user:
--    Email: admin@demo.com
--    Password: demo123456
--
-- 2. Broker user:
--    Email: broker@demo.com
--    Password: demo123456
--
-- After creating users, get their UUIDs from the Authentication panel
-- and replace the placeholders below:
--   - ADMIN_USER_UUID: Replace with admin@demo.com user ID
--   - BROKER_USER_UUID: Replace with broker@demo.com user ID
-- ============================================

-- 4.1 Update profiles for demo users (run after creating users in Auth)
-- Replace 'ADMIN_USER_UUID' and 'BROKER_USER_UUID' with actual UUIDs

/*
-- Uncomment and run after creating users and replacing UUIDs:

UPDATE profiles
SET
  full_name = 'Demo Admin',
  role = 'admin',
  broker_code = NULL
WHERE id = 'ADMIN_USER_UUID';

UPDATE profiles
SET
  full_name = 'Demo Broker',
  role = 'broker',
  broker_code = 'BRK001'
WHERE id = 'BROKER_USER_UUID';
*/

-- 4.2 Insert demo contracts
INSERT INTO contracts (id, contract_number, insured_name, coverage_type, start_date, end_date, broker_code, sum_insured, additional_si_percentage) VALUES
  ('11111111-1111-1111-1111-111111111111', 'CTR-2025-001', 'Acme Trading Co.', 'All Risks', '2025-01-01', '2025-12-31', 'BRK001', 500000.00, 10.00),
  ('22222222-2222-2222-2222-222222222222', 'CTR-2025-002', 'Global Imports Ltd.', 'Named Perils', '2025-01-01', '2025-12-31', 'BRK001', 250000.00, 15.00),
  ('33333333-3333-3333-3333-333333333333', 'CTR-2025-003', 'Maritime Freight Inc.', 'All Risks', '2025-06-01', '2026-05-31', 'BRK002', 1000000.00, 10.00);

-- 4.3 Insert demo certificates (requires a valid created_by user UUID)
-- Uncomment and run after setting up users:

/*
INSERT INTO certificates (certificate_number, contract_id, insured_name, cargo_description, departure_country, arrival_country, transport_means, loading_date, currency, value_local, value_euro, exchange_rate, issue_date, created_by) VALUES
  ('CERT-2025-0001', '11111111-1111-1111-1111-111111111111', 'Acme Trading Co.', 'Electronic Components - 500 units', 'China', 'Greece', 'Sea Freight', '2025-02-15', 'USD', 45000.00, 41500.00, 1.0843, '2025-02-10', 'BROKER_USER_UUID'),
  ('CERT-2025-0002', '11111111-1111-1111-1111-111111111111', 'Acme Trading Co.', 'Machinery Parts - 20 pallets', 'Germany', 'Greece', 'Road', '2025-03-01', 'EUR', 28000.00, 28000.00, 1.0000, '2025-02-25', 'BROKER_USER_UUID'),
  ('CERT-2025-0003', '22222222-2222-2222-2222-222222222222', 'Global Imports Ltd.', 'Textile Materials - Container', 'Turkey', 'Greece', 'Sea Freight', '2025-03-10', 'USD', 75000.00, 69200.00, 1.0838, '2025-03-05', 'BROKER_USER_UUID');
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the setup:

-- Check tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check policies
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Check demo contracts
-- SELECT * FROM contracts;

-- Check profiles
-- SELECT * FROM profiles;
