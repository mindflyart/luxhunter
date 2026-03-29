/*
  # Create Newsletter Subscribers Table

  1. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key) - Unique identifier
      - `email` (text, required, unique) - Subscriber email address
      - `name` (text) - Subscriber name
      - `preferences` (jsonb) - Subscription preferences
      - `subscribed_at` (timestamptz) - Timestamp of subscription
      - `is_active` (boolean) - Whether subscription is active
      - `unsubscribed_at` (timestamptz) - When unsubscribed (if applicable)

  2. Security
    - Enable RLS on `newsletter_subscribers` table
    - Allow public insert (for new subscriptions)
    - Restrict read/update/delete to authenticated users

  3. Indexes
    - Index on email for faster lookups
    - Index on subscribed_at for chronological queries
*/

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  preferences jsonb DEFAULT '{}'::jsonb,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  unsubscribed_at timestamptz
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update subscribers"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at ON newsletter_subscribers(subscribed_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(is_active);
