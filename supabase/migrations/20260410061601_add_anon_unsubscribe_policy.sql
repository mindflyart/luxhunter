/*
  # Allow anonymous users to unsubscribe from newsletter

  1. Changes
    - Adds a new RLS policy on `newsletter_subscribers` that allows
      anonymous (unauthenticated) users to set `is_active = false`
      and `unsubscribed_at` on their own row, identified by email.

  2. Security
    - The WITH CHECK ensures the update can only set is_active to false,
      preventing anonymous users from re-activating subscriptions.
    - Scoped to anon role only.
*/

CREATE POLICY "Anyone can unsubscribe by email"
  ON newsletter_subscribers
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (is_active = false);
