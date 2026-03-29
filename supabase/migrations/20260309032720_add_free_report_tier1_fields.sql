/*
  # Add Tier 1 Lead Capture Fields to Free Report Requests
  
  1. Changes
    - Add `full_name` column (text, required)
    - Add `phone` column (text, optional)
    - Add `state` column (text, required) - Australian state
    - Add `interest_type` column (text, required) - Property Advisory, Home Loan, or Investment Loan
    - Email column already exists
  
  2. Notes
    - These columns enhance lead quality by capturing more detailed information
    - Existing records will have null values for new columns (handled gracefully)
*/

-- Add new columns to free_report_requests table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'free_report_requests' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE free_report_requests ADD COLUMN full_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'free_report_requests' AND column_name = 'phone'
  ) THEN
    ALTER TABLE free_report_requests ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'free_report_requests' AND column_name = 'state'
  ) THEN
    ALTER TABLE free_report_requests ADD COLUMN state text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'free_report_requests' AND column_name = 'interest_type'
  ) THEN
    ALTER TABLE free_report_requests ADD COLUMN interest_type text;
  END IF;
END $$;

-- Create index for state to enable filtering by location
CREATE INDEX IF NOT EXISTS idx_free_report_state ON free_report_requests(state);
CREATE INDEX IF NOT EXISTS idx_free_report_interest_type ON free_report_requests(interest_type);
