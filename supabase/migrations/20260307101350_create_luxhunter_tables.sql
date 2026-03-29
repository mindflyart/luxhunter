/*
  # LuxHunter Website Database Schema

  1. New Tables
    - `free_report_requests`
      - `id` (uuid, primary key)
      - `email` (text, required)
      - `created_at` (timestamptz)
      - Stores email captures from "Get Free Report" CTA
    
    - `contact_submissions`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, required)
      - `phone` (text, optional)
      - `message` (text, required)
      - `preferred_contact` (text, optional) - telegram/whatsapp preference
      - `created_at` (timestamptz)
      - Stores contact form submissions
    
    - `newsletter_subscriptions`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, required, unique)
      - `property_news` (boolean, default false)
      - `personal_loan_updates` (boolean, default false)
      - `commercial_loan_updates` (boolean, default false)
      - `created_at` (timestamptz)
      - Stores newsletter subscription preferences

  2. Security
    - Enable RLS on all tables
    - Add policies for anonymous users to insert data (public forms)
    - Add policies for authenticated users to view all data (admin access)
*/

-- Free Report Requests Table
CREATE TABLE IF NOT EXISTS free_report_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE free_report_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit free report request"
  ON free_report_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view free report requests"
  ON free_report_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Contact Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  preferred_contact text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view contact submissions"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Newsletter Subscriptions Table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  property_news boolean DEFAULT false,
  personal_loan_updates boolean DEFAULT false,
  commercial_loan_updates boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscriptions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view newsletter subscriptions"
  ON newsletter_subscriptions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_free_report_email ON free_report_requests(email);
CREATE INDEX IF NOT EXISTS idx_contact_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_created_at_free_report ON free_report_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_created_at_contact ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_created_at_newsletter ON newsletter_subscriptions(created_at DESC);
