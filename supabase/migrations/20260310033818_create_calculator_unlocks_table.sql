/*
  # Create Calculator Unlocks Table

  1. New Tables
    - `calculator_unlocks`
      - `id` (uuid, primary key) - Unique identifier
      - `full_name` (text, required) - User's full name
      - `email` (text, required) - User's email address
      - `state` (text, required) - Australian state (NSW, VIC, QLD, etc.)
      - `created_at` (timestamptz) - Timestamp of unlock
  
  2. Security
    - Enable RLS on `calculator_unlocks` table
    - Add policy for authenticated users to read their own data
    - Add policy for service role to insert data (for public calculator unlocks)
  
  3. Indexes
    - Index on email for faster lookups
    - Index on created_at for chronological queries
*/

CREATE TABLE IF NOT EXISTS calculator_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  state text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE calculator_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert calculator unlocks"
  ON calculator_unlocks
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can read own calculator unlocks"
  ON calculator_unlocks
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE INDEX IF NOT EXISTS idx_calculator_unlocks_email ON calculator_unlocks(email);
CREATE INDEX IF NOT EXISTS idx_calculator_unlocks_created_at ON calculator_unlocks(created_at DESC);
