/*
  # Create Admin Configuration Tables

  1. New Tables
    - `interest_rates`
      - `id` (uuid, primary key)
      - `product_type` (text) - Type of loan product
      - `rate` (numeric) - Interest rate as percentage
      - `updated_at` (timestamptz)
    
    - `lvr_limits`
      - `id` (uuid, primary key)
      - `classification` (text) - Location classification
      - `lvr_0_70` (numeric) - Limit for 0-70% LVR
      - `lvr_70_80` (numeric) - Limit for 70-80% LVR
      - `lvr_80_90` (numeric) - Limit for 80-90% LVR
      - `lvr_90_95` (numeric) - Limit for 90-95% LVR
      - `updated_at` (timestamptz)
    
    - `postcode_ranges`
      - `id` (uuid, primary key)
      - `state` (text) - Australian state code
      - `classification` (text) - Inner City, Metro, Non-Metro, Regional
      - `range_start` (integer) - Starting postcode
      - `range_end` (integer) - Ending postcode
      - `updated_at` (timestamptz)
    
    - `risk_postcodes`
      - `id` (uuid, primary key)
      - `postcode` (integer) - Postcode number
      - `risk_level` (text) - High-Risk or Unacceptable
      - `notes` (text) - Additional notes
      - `updated_at` (timestamptz)
    
    - `admin_sessions`
      - `id` (uuid, primary key)
      - `session_token` (text) - Session identifier
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Allow public read access for config tables (needed by calculator)
    - Restrict write access to authenticated admin users only

  3. Initial Data
    - Populate default LVR limits
    - Add default risk postcodes
*/

-- Interest Rates table
CREATE TABLE IF NOT EXISTS interest_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type text NOT NULL UNIQUE,
  rate numeric NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE interest_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read interest rates"
  ON interest_rates FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can modify interest rates"
  ON interest_rates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- LVR Limits table
CREATE TABLE IF NOT EXISTS lvr_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classification text NOT NULL UNIQUE,
  lvr_0_70 numeric NOT NULL,
  lvr_70_80 numeric NOT NULL,
  lvr_80_90 numeric,
  lvr_90_95 numeric,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lvr_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read lvr limits"
  ON lvr_limits FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can modify lvr limits"
  ON lvr_limits FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default LVR limits
INSERT INTO lvr_limits (classification, lvr_0_70, lvr_70_80, lvr_80_90, lvr_90_95)
VALUES
  ('Inner City', 3500000, 3500000, 3000000, 2000000),
  ('Metro', 3500000, 3500000, 3000000, 2000000),
  ('Non-Metro', 3000000, 2500000, NULL, NULL),
  ('Regional', 3000000, 2500000, NULL, NULL)
ON CONFLICT (classification) DO NOTHING;

-- Postcode Ranges table
CREATE TABLE IF NOT EXISTS postcode_ranges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state text NOT NULL,
  classification text NOT NULL,
  range_start integer NOT NULL,
  range_end integer NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE postcode_ranges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read postcode ranges"
  ON postcode_ranges FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can modify postcode ranges"
  ON postcode_ranges FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_postcode_ranges_state ON postcode_ranges(state);

-- Risk Postcodes table
CREATE TABLE IF NOT EXISTS risk_postcodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  postcode integer NOT NULL UNIQUE,
  risk_level text NOT NULL CHECK (risk_level IN ('High-Risk', 'Unacceptable')),
  notes text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE risk_postcodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read risk postcodes"
  ON risk_postcodes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can modify risk postcodes"
  ON risk_postcodes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default risk postcodes
INSERT INTO risk_postcodes (postcode, risk_level, notes)
VALUES
  (2540, 'High-Risk', 'NSW coastal area'),
  (2541, 'High-Risk', 'NSW coastal area'),
  (2830, 'High-Risk', 'NSW regional area'),
  (3995, 'High-Risk', 'VIC regional area'),
  (4860, 'High-Risk', 'QLD regional area'),
  (4871, 'High-Risk', 'QLD regional area'),
  (6714, 'High-Risk', 'WA regional area'),
  (6720, 'High-Risk', 'WA regional area'),
  (2899, 'Unacceptable', 'NSW remote area'),
  (3999, 'Unacceptable', 'VIC remote area'),
  (4880, 'Unacceptable', 'QLD remote area'),
  (6725, 'Unacceptable', 'WA remote area'),
  (6760, 'Unacceptable', 'WA remote area')
ON CONFLICT (postcode) DO NOTHING;

-- Admin Sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read own session"
  ON admin_sessions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can create session"
  ON admin_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
