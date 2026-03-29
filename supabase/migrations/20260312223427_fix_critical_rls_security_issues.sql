/*
  # Fix Critical RLS Security Vulnerabilities

  ## Critical Issues Fixed
  
  1. **admin_sessions**: Wide open policies allowing anyone to create and read sessions (CRITICAL)
  2. **Multiple tables with `USING (true)`**: Several policies use `true` without proper authentication checks
  3. **Overly permissive authenticated policies**: Multiple tables allow any authenticated user to modify data
  4. **Duplicate policies**: Several tables have redundant policies
  
  ## Changes Made
  
  1. **Remove insecure admin_sessions policies**
     - Remove "Anyone can create session" - too permissive
     - Remove "Anyone can read own session" with `USING (true)` - no actual ownership check
  
  2. **Remove insecure policies with USING (true) for authenticated users**
     - These policies allow ANY authenticated user to modify critical data
     - Tables affected: lvr_limits, risk_postcodes, postcode_ranges, interest_rates
  
  3. **Remove duplicate policies**
     - latest_insights has 4 duplicate SELECT policies
     - lvr_limits, postcode_ranges, risk_postcodes have duplicate policies
  
  4. **Keep only admin-gated policies**
     - Only policies checking `is_admin()` function remain for modifications
     - Public read access remains for public-facing data
  
  ## Security Notes
  
  - All admin modification policies now require `is_admin()` check
  - No authenticated user can modify data without admin verification
  - Public tables remain readable but not writable
  - Form submissions remain open for anonymous users (by design)
*/

-- Drop all insecure admin_sessions policies
DROP POLICY IF EXISTS "Anyone can create session" ON admin_sessions;
DROP POLICY IF EXISTS "Anyone can read own session" ON admin_sessions;

-- Drop overly permissive authenticated policies (keep only admin-gated ones)
DROP POLICY IF EXISTS "Authenticated users can modify lvr limits" ON lvr_limits;
DROP POLICY IF EXISTS "Admin users can read lvr_limits" ON lvr_limits;

DROP POLICY IF EXISTS "Authenticated users can modify risk postcodes" ON risk_postcodes;
DROP POLICY IF EXISTS "Admin users can read risk_postcodes" ON risk_postcodes;

DROP POLICY IF EXISTS "Authenticated users can modify postcode ranges" ON postcode_ranges;

DROP POLICY IF EXISTS "Authenticated users can modify interest rates" ON interest_rates;

-- Drop duplicate policies on latest_insights
DROP POLICY IF EXISTS "Anyone can read latest_insights" ON latest_insights;
DROP POLICY IF EXISTS "Anyone can view insights" ON latest_insights;
DROP POLICY IF EXISTS "Authenticated users can insert articles" ON latest_insights;
DROP POLICY IF EXISTS "Authenticated users can update articles" ON latest_insights;
DROP POLICY IF EXISTS "Authenticated users can delete articles" ON latest_insights;

-- Drop duplicate read policies
DROP POLICY IF EXISTS "Anyone can read lvr limits" ON lvr_limits;
DROP POLICY IF EXISTS "Anyone can read risk postcodes" ON risk_postcodes;
DROP POLICY IF EXISTS "Anyone can read postcode ranges" ON postcode_ranges;
DROP POLICY IF EXISTS "Anyone can read postcode_ranges" ON postcode_ranges;

-- Ensure is_admin() function exists (it should be created already, but check)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  -- Check if user is in admin_users table
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify final policies are secure:
-- 1. Public read access for public data (lvr_limits, risk_postcodes, postcode_ranges, interest_rates, latest_insights)
-- 2. Admin-only modification access (via is_admin())
-- 3. Anonymous insert for forms (contact_submissions, free_report_requests, newsletter_subscribers, calculator_unlocks)
-- 4. No policies with USING (true) for modifications
