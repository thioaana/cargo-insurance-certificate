-- Enable Row Level Security on all tables
-- Run this migration in Supabase SQL Editor

-- ============================================
-- PROFILES TABLE
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- NOTE: Admin access to other profiles is handled at application level
-- in lib/services/profiles.ts using service role or by querying own profile first

-- ============================================
-- CONTRACTS TABLE
-- ============================================
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

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

-- ============================================
-- CERTIFICATES TABLE
-- ============================================
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

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
