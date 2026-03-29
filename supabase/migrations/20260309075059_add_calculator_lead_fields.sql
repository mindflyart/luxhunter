/*
  # Add Calculator-Specific Fields to Free Report Requests

  1. Changes
    - Add `lead_source` column (text) - Track whether lead came from 'calculator', 'free_report', or other sources
    - Add `annual_income` column (numeric) - Store calculator input for income
    - Add `deposit_amount` column (numeric) - Store calculator input for deposit
    - Add `loan_term` column (integer) - Store calculator input for loan term in years
    - Add `calculated_borrowing_capacity` column (numeric) - Store calculated result
    - Add `calculated_monthly_repayment` column (numeric) - Store calculated result
    - Add `calculated_stamp_duty` column (numeric) - Store calculated result

  2. Notes
    - These fields enable tracking of calculator-specific lead data
    - Existing records will have null values for new columns
    - lead_source helps differentiate between calculator leads and free report leads
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'free_report_requests' AND column_name = 'lead_source'
  ) THEN
    ALTER TABLE free_report_requests ADD COLUMN lead_source text DEFAULT 'free_report';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'free_report_requests' AND column_name = 'annual_income'
  ) THEN
    ALTER TABLE free_report_requests ADD COLUMN annual_income numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'free_report_requests' AND column_name = 'deposit_amount'
  ) THEN
    ALTER TABLE free_report_requests ADD COLUMN deposit_amount numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'free_report_requests' AND column_name = 'loan_term'
  ) THEN
    ALTER TABLE free_report_requests ADD COLUMN loan_term integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'free_report_requests' AND column_name = 'calculated_borrowing_capacity'
  ) THEN
    ALTER TABLE free_report_requests ADD COLUMN calculated_borrowing_capacity numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'free_report_requests' AND column_name = 'calculated_monthly_repayment'
  ) THEN
    ALTER TABLE free_report_requests ADD COLUMN calculated_monthly_repayment numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'free_report_requests' AND column_name = 'calculated_stamp_duty'
  ) THEN
    ALTER TABLE free_report_requests ADD COLUMN calculated_stamp_duty numeric;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_free_report_lead_source ON free_report_requests(lead_source);
