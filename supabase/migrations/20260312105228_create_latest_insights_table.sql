/*
  # Create Latest Insights Table

  1. New Tables
    - `latest_insights`
      - `id` (uuid, primary key)
      - `category` (text) - Category of the insight (property, mortgage, investment)
      - `title` (text) - Title of the article
      - `description` (text) - Short description
      - `content` (text) - Full content of the article
      - `published_at` (timestamptz) - Publication timestamp
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `latest_insights` table
    - Add policy for public read access (anyone can view insights)
    - No insert/update/delete policies (admin only via service role)
*/

CREATE TABLE IF NOT EXISTS latest_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE latest_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view insights"
  ON latest_insights
  FOR SELECT
  TO anon, authenticated
  USING (true);
