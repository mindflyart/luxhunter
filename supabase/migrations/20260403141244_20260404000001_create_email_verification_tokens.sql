/*
  # Email Verification Tokens Table

  1. New Tables
    - `email_verification_tokens`
      - `id` (uuid, primary key) - Unique identifier for the token
      - `email` (text) - Email address to be verified
      - `token` (text, unique) - Unique verification token
      - `lead_data` (jsonb) - Stores lead form data submitted during signup
      - `verified` (boolean) - Tracks if email has been verified
      - `expires_at` (timestamptz) - Token expiration time (24 hours from creation)
      - `created_at` (timestamptz) - Token creation timestamp

  2. Security
    - Enable RLS on `email_verification_tokens` table
    - Add policy for service role to manage all verification tokens
    
  3. Notes
    - Tokens expire after 24 hours for security
    - Service role has full access for email verification workflows
    - Lead data is stored as JSONB for flexible form field storage
*/

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  lead_data jsonb NOT NULL,
  verified boolean DEFAULT false,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage verification tokens"
  ON email_verification_tokens
  FOR ALL
  TO service_role
  USING (true);