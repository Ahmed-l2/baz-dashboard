-- Update quote_responses table structure
-- Remove the redundant good_until_date column and ensure expires_at is calculated properly

-- First, backup any existing data (if needed)
-- CREATE TABLE quote_responses_backup AS SELECT * FROM quote_responses;

-- Drop and recreate the table with the new structure
DROP TABLE IF EXISTS quote_responses CASCADE;

CREATE TABLE public.quote_responses (
  id uuid not null default gen_random_uuid(),
  quote_request_id uuid not null,
  total_amount numeric(12,2) null,
  validity_period integer null default 30, -- in days
  expires_at timestamp with time zone null,
  response_notes text null,
  terms_and_conditions text null,
  responded_by text null,
  created_at timestamp with time zone null default now(),
  constraint quote_responses_pkey primary key (id),
  constraint fk_quote_responses_request foreign key (quote_request_id) references quote_requests(id) on delete cascade
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_quote_responses_quote_request_id ON quote_responses(quote_request_id);

-- Create a trigger to automatically calculate expires_at based on validity_period
CREATE OR REPLACE FUNCTION set_expires_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.validity_period IS NOT NULL THEN
    NEW.expires_at = NEW.created_at + (NEW.validity_period || ' days')::interval;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_expires_at
  BEFORE INSERT OR UPDATE ON quote_responses
  FOR EACH ROW
  EXECUTE FUNCTION set_expires_at();
