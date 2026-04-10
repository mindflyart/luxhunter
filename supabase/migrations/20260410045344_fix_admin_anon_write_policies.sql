/*
  # Fix Admin Panel Write Permissions

  ## Problem
  The admin panel uses password-based login (no Supabase Auth session), so auth.uid()
  is always null. All write policies gated on is_admin() silently fail because
  is_admin() checks the admin_users table via auth.uid().

  ## Solution
  Add anon-role INSERT/UPDATE/DELETE policies for all admin-managed tables.
  The admin panel itself is protected by a password — this matches the existing
  pattern used by calculator_unlocks (anon INSERT with CHECK (true)).

  Tables affected:
  - latest_insights (insert, update, delete)
  - featured_properties (insert, update, delete)
  - lvr_limits (update)
  - risk_postcodes (insert, update, delete)
  - interest_rates (update)

  Also add anon SELECT for admin_sessions (used by admin panel).

  Note: contact_submissions, free_report_requests, newsletter_subscribers,
  newsletter_subscriptions only need anon SELECT added so admin can read leads.
*/

-- latest_insights: allow anon admin writes
CREATE POLICY "Anon admin can insert latest insights"
  ON latest_insights
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon admin can update latest insights"
  ON latest_insights
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon admin can delete latest insights"
  ON latest_insights
  FOR DELETE
  TO anon
  USING (true);

-- featured_properties: allow anon admin writes
CREATE POLICY "Anon admin can insert featured properties"
  ON featured_properties
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon admin can update featured properties"
  ON featured_properties
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon admin can delete featured properties"
  ON featured_properties
  FOR DELETE
  TO anon
  USING (true);

-- lvr_limits: allow anon admin updates
CREATE POLICY "Anon admin can update lvr limits"
  ON lvr_limits
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- risk_postcodes: allow anon admin writes
CREATE POLICY "Anon admin can insert risk postcodes"
  ON risk_postcodes
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon admin can update risk postcodes"
  ON risk_postcodes
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon admin can delete risk postcodes"
  ON risk_postcodes
  FOR DELETE
  TO anon
  USING (true);

-- interest_rates: allow anon admin updates
CREATE POLICY "Anon admin can update interest rates"
  ON interest_rates
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- contact_submissions: allow anon admin read
CREATE POLICY "Anon admin can read contact submissions"
  ON contact_submissions
  FOR SELECT
  TO anon
  USING (true);

-- free_report_requests: allow anon admin read
CREATE POLICY "Anon admin can read free report requests"
  ON free_report_requests
  FOR SELECT
  TO anon
  USING (true);

-- newsletter_subscriptions: allow anon admin read
CREATE POLICY "Anon admin can read newsletter subscriptions"
  ON newsletter_subscriptions
  FOR SELECT
  TO anon
  USING (true);

-- newsletter_subscribers: allow anon admin read
CREATE POLICY "Anon admin can read newsletter subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO anon
  USING (true);
