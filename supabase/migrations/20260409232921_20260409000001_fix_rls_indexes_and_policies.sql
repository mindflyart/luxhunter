/*
  # Fix RLS Policies, Unused Indexes, and Performance Issues

  ## Summary
  This migration addresses all security advisor warnings:

  ## 1. RLS Initialization Performance
  - Fix `calculator_unlocks` SELECT policy to use `(select auth.uid())` instead of `auth.uid()`
    to avoid per-row function re-evaluation.

  ## 2. Unused Indexes Removed
  - Drop all unused indexes on: contact_submissions, newsletter_subscriptions, free_report_requests,
    calculator_unlocks, postcode_ranges, admin_sessions, newsletter_subscribers.

  ## 3. Multiple Permissive Policies on featured_properties
  - Drop the redundant "Authenticated users can view all featured properties" SELECT policy.
    The existing "Anyone can view active featured properties" covers public read.
    A new admin-only policy gates INSERT/UPDATE/DELETE through is_admin().

  ## 4. featured_properties INSERT/UPDATE/DELETE — USING/WITH CHECK (true)
  - Replace permissive authenticated policies with is_admin()-gated policies.

  ## 5. Tables with RLS enabled but no policies
  - Add public SELECT policies for: admin_sessions (none), latest_insights, lvr_limits,
    postcode_ranges, risk_postcodes. Admin-write policies use is_admin().

  ## 6. is_admin() function — mutable search_path
  - Recreate function with SET search_path = public to fix mutable search_path vulnerability.

  ## 7. calculator_unlocks INSERT WITH CHECK (true) for anon
  - This is intentional (public calculator form), left as-is but documented.

  ## 8. contact_submissions / free_report_requests / newsletter_subscribers / newsletter_subscriptions
  - Anonymous INSERT policies WITH CHECK (true) are intentional for public forms; documented.
  - newsletter_subscribers UPDATE policy (authenticated, true) replaced with is_admin()-gated policy.
*/

-- ============================================================
-- 1. Fix is_admin() function to have immutable search_path
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = (SELECT auth.uid())
  );
END;
$$;

-- ============================================================
-- 2. Fix calculator_unlocks SELECT policy (auth RLS init plan)
-- ============================================================
DROP POLICY IF EXISTS "Users can read own calculator unlocks" ON calculator_unlocks;

CREATE POLICY "Users can read own calculator unlocks"
  ON calculator_unlocks
  FOR SELECT
  TO authenticated
  USING ((select auth.uid())::text = id::text);

-- ============================================================
-- 3. Drop unused indexes
-- ============================================================
DROP INDEX IF EXISTS idx_contact_email;
DROP INDEX IF EXISTS idx_created_at_contact;
DROP INDEX IF EXISTS idx_newsletter_email;
DROP INDEX IF EXISTS idx_created_at_newsletter;
DROP INDEX IF EXISTS idx_free_report_email;
DROP INDEX IF EXISTS idx_created_at_free_report;
DROP INDEX IF EXISTS idx_free_report_state;
DROP INDEX IF EXISTS idx_free_report_interest_type;
DROP INDEX IF EXISTS idx_free_report_lead_source;
DROP INDEX IF EXISTS idx_calculator_unlocks_email;
DROP INDEX IF EXISTS idx_calculator_unlocks_created_at;
DROP INDEX IF EXISTS idx_postcode_ranges_state;
DROP INDEX IF EXISTS idx_admin_sessions_token;
DROP INDEX IF EXISTS idx_admin_sessions_expires;
DROP INDEX IF EXISTS idx_newsletter_subscribers_email;
DROP INDEX IF EXISTS idx_newsletter_subscribers_subscribed_at;
DROP INDEX IF EXISTS idx_newsletter_subscribers_active;

-- ============================================================
-- 4. Fix featured_properties — remove duplicate/permissive policies,
--    replace with is_admin()-gated write policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view all featured properties" ON featured_properties;
DROP POLICY IF EXISTS "Authenticated users can insert featured properties" ON featured_properties;
DROP POLICY IF EXISTS "Authenticated users can update featured properties" ON featured_properties;
DROP POLICY IF EXISTS "Authenticated users can delete featured properties" ON featured_properties;

CREATE POLICY "Admins can insert featured properties"
  ON featured_properties
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update featured properties"
  ON featured_properties
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete featured properties"
  ON featured_properties
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================
-- 5. Add missing policies for tables with RLS but no policies
-- ============================================================

-- admin_sessions: only service_role manages sessions; no anon/authenticated access needed
CREATE POLICY "Service role manages admin sessions"
  ON admin_sessions
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- latest_insights: public read, admin write
CREATE POLICY "Anyone can read latest insights"
  ON latest_insights
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert latest insights"
  ON latest_insights
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update latest insights"
  ON latest_insights
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete latest insights"
  ON latest_insights
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- lvr_limits: public read, admin write
CREATE POLICY "Anyone can read lvr limits"
  ON lvr_limits
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can update lvr limits"
  ON lvr_limits
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- postcode_ranges: public read only
CREATE POLICY "Anyone can read postcode ranges"
  ON postcode_ranges
  FOR SELECT
  USING (true);

-- risk_postcodes: public read, admin write
CREATE POLICY "Anyone can read risk postcodes"
  ON risk_postcodes
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert risk postcodes"
  ON risk_postcodes
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update risk postcodes"
  ON risk_postcodes
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete risk postcodes"
  ON risk_postcodes
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================
-- 6. Fix newsletter_subscribers UPDATE policy (was USING (true))
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can update subscribers" ON newsletter_subscribers;

CREATE POLICY "Admins can update newsletter subscribers"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
