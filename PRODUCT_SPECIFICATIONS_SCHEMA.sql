-- Database schema for the new product specifications system
-- This should be run after your main database migration

-- ============================================================================
-- CLEAN SLATE APPROACH - Remove existing data and constraints
-- ============================================================================

-- Clear existing data to avoid conflicts
TRUNCATE TABLE quote_items CASCADE;
TRUNCATE TABLE quote_requests CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE categories CASCADE;

-- ============================================================================
-- PRODUCTS TABLE UPDATE
-- ============================================================================

-- Update products table to support the new structure
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_name_unique,
ALTER COLUMN image_url DROP NOT NULL,
ADD COLUMN IF NOT EXISTS type text[],
DROP COLUMN IF EXISTS price,
DROP COLUMN IF EXISTS thickness,
DROP COLUMN IF EXISTS length,
DROP COLUMN IF EXISTS width,
DROP COLUMN IF EXISTS diameter,
DROP COLUMN IF EXISTS dimensions,
DROP COLUMN IF EXISTS updated_at;

-- ============================================================================
-- PRODUCT SPECIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    spec_name TEXT NOT NULL, -- e.g. "thickness", "length", "diameter", "dimensions", "type"
    unit TEXT NOT NULL, -- mm, etc.
    min_value NUMERIC,
    max_value NUMERIC,
    notes TEXT, -- e.g. "Standard 6000 mm, custom on request"
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_specs_product_id ON product_specs(product_id);
CREATE INDEX IF NOT EXISTS idx_product_specs_spec_name ON product_specs(spec_name);

-- ============================================================================
-- DROP DEPENDENT VIEWS (to avoid constraint conflicts)
-- ============================================================================

-- Drop existing views that depend on the columns we're modifying
DROP VIEW IF EXISTS quote_details CASCADE;
DROP VIEW IF EXISTS quote_requests_summary CASCADE;
DROP VIEW IF EXISTS quote_requests_with_totals CASCADE;

-- ============================================================================
-- UPDATE QUOTE ITEMS TABLE
-- ============================================================================

-- First, migrate existing data to the new structure
DO $$
BEGIN
    -- Add the new column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'quote_items' AND column_name = 'requested_specs') THEN
        ALTER TABLE quote_items ADD COLUMN requested_specs JSONB;
    END IF;

    -- Migrate existing custom_size and material_type data to requested_specs
    UPDATE quote_items
    SET requested_specs = jsonb_build_object(
        'custom_size', COALESCE(custom_size, ''),
        'material_type', COALESCE(material_type, '')
    )
    WHERE requested_specs IS NULL
    AND (custom_size IS NOT NULL OR material_type IS NOT NULL);
END $$;

-- Now drop the old columns
ALTER TABLE quote_items
DROP COLUMN IF EXISTS custom_size CASCADE,
DROP COLUMN IF EXISTS material_type CASCADE;

-- Create index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_quote_items_requested_specs ON quote_items USING GIN (requested_specs);

-- ============================================================================
-- SAMPLE DATA FOR PRODUCT SPECIFICATIONS
-- ============================================================================

-- Function to add product specs easily
CREATE OR REPLACE FUNCTION add_product_spec(
    p_product_name TEXT,
    p_spec_name TEXT,
    p_unit TEXT,
    p_min_value NUMERIC DEFAULT NULL,
    p_max_value NUMERIC DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    product_id_var UUID;
BEGIN
    -- Get product ID by name
    SELECT id INTO product_id_var FROM products WHERE name = p_product_name;

    IF product_id_var IS NOT NULL THEN
        INSERT INTO product_specs (product_id, spec_name, unit, min_value, max_value, notes)
        VALUES (product_id_var, p_spec_name, p_unit, p_min_value, p_max_value, p_notes);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SETUP BASE CATEGORIES AND PRODUCTS
-- ============================================================================

-- Insert basic categories first
INSERT INTO categories (name, icon, description) VALUES
('Welded Pipes', '🔧', 'Various types of welded pipes and tubes'),
('Flat Sheets', '📋', 'Flat metal sheets in various sizes'),
('Guard Rails', '🛡️', 'Safety guard rails and barriers'),
('Metal Profiles', '📏', 'Various metal profiles and shapes')
ON CONFLICT (name) DO NOTHING;

-- Add constraint after we're done with insertions
ALTER TABLE products
ADD CONSTRAINT products_name_unique UNIQUE (name);

-- First, insert or update the product
INSERT INTO products (name, type, category_id)
VALUES ('Round Pipes', ARRAY['Hot Rolled', 'Cold Rolled', 'Galvanized Steel'],
        (SELECT id FROM categories WHERE name = 'Welded Pipes' LIMIT 1))
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type;

-- Add specifications for Round Pipes
SELECT add_product_spec('Round Pipes', 'type', '', NULL, NULL, 'Hot Rolled / Cold Rolled / Galvanized Steel');
SELECT add_product_spec('Round Pipes', 'thickness', 'mm', 0.58, 5, NULL);
SELECT add_product_spec('Round Pipes', 'length', 'mm', NULL, NULL, 'Standard 6000 mm, custom lengths on request');
SELECT add_product_spec('Round Pipes', 'diameter', 'mm', 15, 187.5, NULL);

-- Example: Add specifications for Hot Rolled Sheet
INSERT INTO products (name, type, category_id)
VALUES ('Hot Rolled Sheet', ARRAY['Hot Rolled'],
        (SELECT id FROM categories WHERE name = 'Flat Sheets' LIMIT 1))
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type;

SELECT add_product_spec('Hot Rolled Sheet', 'thickness', 'mm', 0.8, 6, NULL);
SELECT add_product_spec('Hot Rolled Sheet', 'length', 'mm', 1000, 12000, NULL);
SELECT add_product_spec('Hot Rolled Sheet', 'width', 'mm', 1000, 1500, NULL);

-- Example: Add specifications for Square Tubes
INSERT INTO products (name, type, category_id)
VALUES ('Square Tubes', ARRAY['Hot Rolled', 'Cold Rolled', 'Galvanized Steel'],
        (SELECT id FROM categories WHERE name = 'Welded Pipes' LIMIT 1))
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type;

SELECT add_product_spec('Square Tubes', 'type', '', NULL, NULL, 'Hot Rolled / Cold Rolled / Galvanized Steel');
SELECT add_product_spec('Square Tubes', 'thickness', 'mm', 0.58, 5, NULL);
SELECT add_product_spec('Square Tubes', 'length', 'mm', NULL, NULL, 'Standard 6000 mm, custom lengths on request');
SELECT add_product_spec('Square Tubes', 'dimensions', 'mm', NULL, NULL, '12×12 – 150×150 mm');

-- Example: Add specifications for Capusta (Hand Rail)
INSERT INTO products (name, type, category_id)
VALUES ('Capusta (Hand Rail)', NULL,
        (SELECT id FROM categories WHERE name = 'Welded Pipes' LIMIT 1))
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type;

SELECT add_product_spec('Capusta (Hand Rail)', 'thickness', 'mm', 1.2, 2, NULL);
SELECT add_product_spec('Capusta (Hand Rail)', 'length', 'mm', NULL, NULL, 'Standard 6000 mm, custom lengths on request');
SELECT add_product_spec('Capusta (Hand Rail)', 'dimensions', 'mm', NULL, NULL, '63×32 or 63×27 mm');

-- Example: Add specifications for Guard Rail (W Shape)
INSERT INTO products (name, type, category_id)
VALUES ('Guard Rail (W Shape)', ARRAY['Hot-dip Galvanized'],
        (SELECT id FROM categories WHERE name = 'Guard Rails' LIMIT 1))
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type;

SELECT add_product_spec('Guard Rail (W Shape)', 'type', '', NULL, NULL, 'Hot-dip Galvanized');
SELECT add_product_spec('Guard Rail (W Shape)', 'thickness', 'mm', 2.74, 3.58, NULL);
SELECT add_product_spec('Guard Rail (W Shape)', 'length', 'mm', 2000, 5500, '4130 mm standard, custom: 2000 – 5500 mm');
SELECT add_product_spec('Guard Rail (W Shape)', 'dimensions', 'mm', NULL, NULL, '311 mm');

-- ============================================================================
-- HELPER VIEWS (Recreate the dropped views with new structure)
-- ============================================================================

-- View to see products with their specifications
CREATE OR REPLACE VIEW products_with_specs AS
SELECT
    p.id,
    p.name,
    p.type,
    p.image_url,
    p.category_id,
    c.name as category_name,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'spec_name', ps.spec_name,
                'unit', ps.unit,
                'min_value', ps.min_value,
                'max_value', ps.max_value,
                'notes', ps.notes
            ) ORDER BY ps.spec_name
        ) FILTER (WHERE ps.id IS NOT NULL),
        '[]'::json
    ) as specifications
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN product_specs ps ON p.id = ps.product_id
GROUP BY p.id, p.name, p.type, p.image_url, p.category_id, c.name
ORDER BY p.name;

-- View to see quote items with formatted specifications
CREATE OR REPLACE VIEW quote_items_with_specs AS
SELECT
    qi.*,
    p.name as product_name,
    p.type as product_type,
    CASE
        WHEN qi.requested_specs IS NOT NULL
        THEN (
            SELECT STRING_AGG(
                CONCAT(key, ': ', value),
                ', '
                ORDER BY key
            )
            FROM jsonb_each_text(qi.requested_specs)
        )
        ELSE 'No specifications'
    END as formatted_specs
FROM quote_items qi
LEFT JOIN products p ON qi.product_id = p.id;

-- Recreate the original views with updated structure
CREATE OR REPLACE VIEW quote_requests_summary AS
SELECT
    qr.*,
    COUNT(qi.id) as item_count,
    SUM(qi.quantity) as total_quantity,
    SUM(qi.total_price) as estimated_total,
    CASE
        WHEN qr.status = 'draft' THEN 'Draft'
        WHEN qr.status = 'submitted' THEN 'Submitted'
        WHEN qr.status = 'quoted' THEN 'Quoted'
        WHEN qr.status = 'accepted' THEN 'Accepted'
        WHEN qr.status = 'rejected' THEN 'Rejected'
        ELSE 'Pending'
    END as status_display
FROM quote_requests qr
LEFT JOIN quote_items qi ON qr.id = qi.quote_request_id
GROUP BY qr.id, qr.user_id, qr.customer_name, qr.customer_email,
         qr.customer_phone, qr.customer_company, qr.project_name,
         qr.notes, qr.status, qr.created_at, qr.submitted_at,
         qr.quoted_at, qr.updated_at;

CREATE OR REPLACE VIEW quote_requests_with_totals AS
SELECT
    qr.*,
    COUNT(qi.id) as item_count,
    SUM(qi.quantity) as total_quantity,
    SUM(qi.total_price) as estimated_total,
    qr.status as current_status
FROM quote_requests qr
LEFT JOIN quote_items qi ON qr.id = qi.quote_request_id
GROUP BY qr.id, qr.user_id, qr.customer_name, qr.customer_email,
         qr.customer_phone, qr.customer_company, qr.project_name,
         qr.notes, qr.status, qr.created_at, qr.submitted_at,
         qr.quoted_at, qr.updated_at;

CREATE OR REPLACE VIEW quote_details AS
SELECT
    qr.id as quote_id,
    qr.created_at,
    qr.submitted_at,
    qr.customer_name,
    qr.customer_email,
    qr.customer_phone,
    qr.customer_company,
    qr.project_name,
    qr.notes as quote_notes,
    qr.status,

    qi.id as item_id,
    qi.quantity,
    qi.unit_price,
    qi.total_price,
    qi.requested_specs,
    qi.notes as item_notes,

    p.name as product_name,
    p.type as product_type,
    p.image_url as product_image
FROM quote_requests qr
LEFT JOIN quote_items qi ON qr.id = qi.quote_request_id
LEFT JOIN products p ON qi.product_id = p.id;

-- ============================================================================
-- CLEANUP FUNCTION
-- ============================================================================

-- Drop the helper function after setup
DROP FUNCTION IF EXISTS add_product_spec(TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check products with their specifications
-- SELECT * FROM products_with_specs;

-- Check quote items with formatted specifications
-- SELECT * FROM quote_items_with_specs;
