/*
  # Create featured_properties table

  1. New Tables
    - `featured_properties`
      - `id` (uuid, primary key) - Unique identifier for each property
      - `title` (text) - Property title/name
      - `location` (text) - Property location/address
      - `state` (text) - Australian state (NSW, VIC, QLD, etc.)
      - `price` (text) - Display price (formatted string like "$2.5M")
      - `description` (text) - Property description
      - `image_url` (text) - URL to property image
      - `tag` (text) - Tag label (e.g., "Premium Location", "Investment Opportunity")
      - `display_order` (integer) - Sort order for displaying properties (lower numbers first)
      - `is_active` (boolean) - Whether property should be displayed on frontend
      - `created_at` (timestamptz) - Timestamp when property was added

  2. Security
    - Enable RLS on `featured_properties` table
    - Add policy for public read access (anyone can view active properties)
    - Add policy for authenticated admin users to manage properties
*/

CREATE TABLE IF NOT EXISTS featured_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  location text NOT NULL,
  state text NOT NULL,
  price text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  tag text DEFAULT '',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE featured_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active featured properties"
  ON featured_properties
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all featured properties"
  ON featured_properties
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert featured properties"
  ON featured_properties
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update featured properties"
  ON featured_properties
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete featured properties"
  ON featured_properties
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_featured_properties_active_order 
  ON featured_properties(is_active, display_order);
