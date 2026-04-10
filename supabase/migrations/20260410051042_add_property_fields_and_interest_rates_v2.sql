/*
  # Add property fields and create interest_rates table

  ## Changes

  ### 1. featured_properties table — new columns
  - `bedrooms` (integer) — number of bedrooms, nullable
  - `bathrooms` (integer) — number of bathrooms, nullable
  - `property_type` (text) — e.g. House, Apartment, Townhouse, Unit, Land, Other
  - `status` (text) — e.g. For Sale, Sold, Under Contract, Leased

  ### 2. interest_rates table — new columns
  - `lender_name` (text) — name of the lender
  - `rate_type` (text) — Variable / Fixed 1yr / Fixed 2yr / Fixed 3yr / Fixed 5yr
  - `interest_rate` (numeric) — the interest rate percentage
  - `comparison_rate` (numeric) — comparison rate percentage
  - `effective_date` (date) — date rate is effective from
*/

-- Add new columns to featured_properties
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'featured_properties' AND column_name = 'bedrooms') THEN
    ALTER TABLE featured_properties ADD COLUMN bedrooms integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'featured_properties' AND column_name = 'bathrooms') THEN
    ALTER TABLE featured_properties ADD COLUMN bathrooms integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'featured_properties' AND column_name = 'property_type') THEN
    ALTER TABLE featured_properties ADD COLUMN property_type text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'featured_properties' AND column_name = 'status') THEN
    ALTER TABLE featured_properties ADD COLUMN status text DEFAULT 'For Sale';
  END IF;
END $$;

-- Add new columns to interest_rates if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interest_rates' AND column_name = 'lender_name') THEN
    ALTER TABLE interest_rates ADD COLUMN lender_name text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interest_rates' AND column_name = 'rate_type') THEN
    ALTER TABLE interest_rates ADD COLUMN rate_type text NOT NULL DEFAULT 'Variable';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interest_rates' AND column_name = 'interest_rate') THEN
    ALTER TABLE interest_rates ADD COLUMN interest_rate numeric(5,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interest_rates' AND column_name = 'comparison_rate') THEN
    ALTER TABLE interest_rates ADD COLUMN comparison_rate numeric(5,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interest_rates' AND column_name = 'effective_date') THEN
    ALTER TABLE interest_rates ADD COLUMN effective_date date NOT NULL DEFAULT CURRENT_DATE;
  END IF;
END $$;
