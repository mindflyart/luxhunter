/*
  # Allow anon admin read on calculator_unlocks

  The admin panel uses password-only login (no Supabase Auth session),
  so it runs as the anon role. This adds a SELECT policy so the admin
  can view calculator unlock leads.
*/

CREATE POLICY "Anon admin can read calculator unlocks"
  ON calculator_unlocks
  FOR SELECT
  TO anon
  USING (true);
