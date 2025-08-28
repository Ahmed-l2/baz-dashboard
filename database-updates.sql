-- Database schema updates for improved Quote Request system
-- Apply these changes to your Supabase database

-- First, let's add missing fields to quote_requests table if they don't exist
ALTER TABLE public.quote_requests
ADD COLUMN IF NOT EXISTS customer_company character varying,
ADD COLUMN IF NOT EXISTS project_name character varying,
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS quoted_at timestamp with time zone;

-- Add a good_until_date field to quote_responses for explicit date tracking
ALTER TABLE public.quote_responses
ADD COLUMN IF NOT EXISTS good_until_date timestamp with time zone;

-- Create or update the quote_response_items table to store per-item pricing
-- This allows us to track individual item prices in responses
CREATE TABLE IF NOT EXISTS public.quote_response_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quote_response_id uuid NOT NULL,
  quote_item_id uuid NOT NULL,
  unit_price numeric,
  total_price numeric,
  response_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quote_response_items_pkey PRIMARY KEY (id),
  CONSTRAINT quote_response_items_quote_response_id_fkey
    FOREIGN KEY (quote_response_id) REFERENCES quote_responses(id) ON DELETE CASCADE,
  CONSTRAINT quote_response_items_quote_item_id_fkey
    FOREIGN KEY (quote_item_id) REFERENCES quote_items(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quote_response_items_quote_response_id
  ON public.quote_response_items(quote_response_id);
CREATE INDEX IF NOT EXISTS idx_quote_response_items_quote_item_id
  ON public.quote_response_items(quote_item_id);

-- Add RLS policies for quote_response_items
ALTER TABLE public.quote_response_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Allow read access to quote response items" ON public.quote_response_items;
DROP POLICY IF EXISTS "Allow insert access to quote response items" ON public.quote_response_items;
DROP POLICY IF EXISTS "Allow update access to quote response items" ON public.quote_response_items;
DROP POLICY IF EXISTS "Allow delete access to quote response items" ON public.quote_response_items;

-- Policy to allow reading quote response items
CREATE POLICY "Allow read access to quote response items" ON public.quote_response_items
  FOR SELECT USING (true);

-- Policy to allow inserting quote response items
CREATE POLICY "Allow insert access to quote response items" ON public.quote_response_items
  FOR INSERT WITH CHECK (true);

-- Policy to allow updating quote response items
CREATE POLICY "Allow update access to quote response items" ON public.quote_response_items
  FOR UPDATE USING (true);

-- Policy to allow deleting quote response items
CREATE POLICY "Allow delete access to quote response items" ON public.quote_response_items
  FOR DELETE USING (true);

-- Update function to automatically set updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for quote_response_items
DROP TRIGGER IF EXISTS update_quote_response_items_updated_at ON public.quote_response_items;
CREATE TRIGGER update_quote_response_items_updated_at
    BEFORE UPDATE ON public.quote_response_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Also ensure we have the trigger for quote_items if not already present
DROP TRIGGER IF EXISTS update_quote_items_updated_at ON public.quote_items;
CREATE TRIGGER update_quote_items_updated_at
    BEFORE UPDATE ON public.quote_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add some useful views for easier querying
CREATE OR REPLACE VIEW public.quote_requests_with_totals AS
SELECT
  qr.*,
  COALESCE(item_stats.item_count, 0) as item_count,
  COALESCE(item_stats.total_quantity, 0) as total_quantity,
  COALESCE(item_stats.estimated_total, 0) as estimated_total,
  CASE
    WHEN qresp.id IS NOT NULL THEN 'responded'
    WHEN qr.status IS NOT NULL THEN qr.status
    ELSE 'pending'
  END as current_status
FROM quote_requests qr
LEFT JOIN (
  SELECT
    quote_request_id,
    COUNT(*) as item_count,
    SUM(quantity) as total_quantity,
    SUM(COALESCE(total_price, 0)) as estimated_total
  FROM quote_items
  GROUP BY quote_request_id
) item_stats ON qr.id = item_stats.quote_request_id
LEFT JOIN quote_responses qresp ON qr.id = qresp.quote_request_id;

-- Grant permissions on the view
GRANT SELECT ON public.quote_requests_with_totals TO authenticated;
GRANT SELECT ON public.quote_requests_with_totals TO anon;
