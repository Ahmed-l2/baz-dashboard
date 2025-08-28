# Product Specifications Implementation Guide

## Overview
This implementation adds a flexible product specification system to your quote management application. It replaces the rigid text fields with a dynamic system that can handle any type of product specification with validation.

## Key Features Implemented

### 1. Dynamic Product Specifications
- **Flexible Schema**: Each product can have different specifications (thickness, length, diameter, dimensions, etc.)
- **Range Validation**: Min/max values ensure user input is within acceptable ranges
- **Unit Support**: Each specification includes units (mm, etc.)
- **Type Constraints**: Dropdown selections for material types
- **Custom Notes**: Additional information for each specification

### 2. Enhanced Database Structure
```sql
products (
  id, name, type[], image_url, category_id, created_at
)

product_specs (
  id, product_id, spec_name, unit, min_value, max_value, notes, created_at
)

quote_items (
  id, quote_request_id, product_id, quantity,
  requested_specs (JSONB), -- Dynamic specifications
  unit_price, total_price, notes, created_at, updated_at
)
```

### 3. Smart UI Components
- **ProductSpecsForm**: Dynamic form that shows only relevant specifications
- **Validation**: Real-time validation against product constraints
- **Type-Aware Inputs**: Different input types for different specifications
- **Error Handling**: Clear feedback when values are out of range

## Product Categories Supported

### Welded Pipes
- **Round Pipes**: Type, thickness (0.58-5mm), length (standard 6000mm), diameter (15-187.5mm)
- **Square Tubes**: Type, thickness (0.58-5mm), length (standard 6000mm), dimensions (12×12 – 150×150mm)
- **Rectangular Tubes**: Type, thickness (0.58-5mm), length (standard 6000mm), dimensions (25×10 – 200×100mm)
- **Capusta (Hand Rail)**: Thickness (1.2-2mm), length (standard 6000mm), dimensions (63×32 or 63×27mm)

### Flat Sheets
- **Hot Rolled Sheet**: Thickness (0.8-6mm), length (1000-12000mm), width (1000-1500mm)
- **Cold Rolled Sheet**: Thickness (0.5-1.20mm), length (1000-12000mm), width (1000-1500mm)
- **Galvanized Sheet**: Thickness (0.35-4mm), length (1000-12000mm), width (1000-1500mm)

### Guard Rails
- **Guard Rail (W Shape)**: Type (Hot-dip Galvanized), thickness (2.74-3.58mm), length (2000-5500mm), dimensions (311mm)
- **Post Beam (U Shape)**: Type (Hot-dip Galvanized), thickness (5mm), length (1830mm), dimensions (100×150×100mm)

### Metal Profiles
- **Studs**: Thickness (0.45-1.50mm), length (1500-6000mm), dimensions (42-200mm)
- **Omega Channel**: Length (2500-6000mm), dimensions (35×22×11mm)

## Implementation Steps

### Step 1: Database Migration
```bash
# Run the product specifications schema
psql -d your_database -f PRODUCT_SPECIFICATIONS_SCHEMA.sql
```

### Step 2: Code Updates
The following files have been updated:
- `hooks/useProducts.ts` - Added specification support
- `hooks/useQuoteRequests.ts` - Updated for new data structure
- `components/ProductSpecsForm.tsx` - New dynamic form component
- `pages/QuoteRequests.tsx` - Integrated new specification system

### Step 3: Data Migration (if you have existing data)
```sql
-- Migrate existing quote items
UPDATE quote_items
SET requested_specs = jsonb_build_object(
    'custom_size', custom_size,
    'material_type', material_type
)
WHERE custom_size IS NOT NULL OR material_type IS NOT NULL;
```

## Usage Examples

### Creating a Quote Request
1. User selects a product (e.g., "Round Pipes")
2. System automatically loads relevant specifications:
   - Type dropdown (Hot Rolled/Cold Rolled/Galvanized Steel)
   - Thickness input (0.58-5mm range)
   - Length input (with note about standard 6000mm)
   - Diameter input (15-187.5mm range)
3. User fills in values, system validates in real-time
4. Specifications are saved as JSON: `{"type": "Hot Rolled", "thickness": 2.5, "length": 6000, "diameter": 50}`

### Viewing Quote Items
- Specifications are displayed in a formatted way
- Easy to read layout showing all relevant product details
- Historical data is preserved and displayed consistently

## Benefits

### For Administrators
- **Flexible Product Management**: Easy to add new products with different specifications
- **Data Consistency**: Standardized specification names and units
- **Better Quotes**: More detailed and accurate quote requests

### For Customers (Mobile App)
- **Guided Input**: Only see relevant fields for selected products
- **Validation**: Can't enter invalid values
- **Clear Requirements**: Understand exactly what information is needed

### For Development
- **Maintainable**: Easy to add new product types and specifications
- **Scalable**: System grows with business needs
- **Type-Safe**: TypeScript ensures data integrity

## Validation Rules

### Numeric Specifications
```typescript
// Example: Thickness validation for Round Pipes
{
  spec_name: "thickness",
  unit: "mm",
  min_value: 0.58,
  max_value: 5,
  notes: null
}
// User input: 2.5 ✓ Valid
// User input: 0.3 ✗ Invalid (below minimum)
// User input: 6.0 ✗ Invalid (above maximum)
```

### Type Specifications
```typescript
// Example: Material type for steel products
{
  spec_name: "type",
  unit: "",
  min_value: null,
  max_value: null,
  notes: "Hot Rolled / Cold Rolled / Galvanized Steel"
}
// Dropdown options: ["Hot Rolled", "Cold Rolled", "Galvanized Steel"]
```

## Testing Checklist

### Database
- [ ] Product specifications are properly seeded
- [ ] Quote items save requested_specs as valid JSON
- [ ] Views return correct data
- [ ] Indexes are created for performance

### Frontend
- [ ] ProductSpecsForm shows correct inputs for each product
- [ ] Validation works for all specification types
- [ ] Quote creation includes specifications
- [ ] Quote viewing displays specifications properly
- [ ] PDF generation includes specification details

### Integration
- [ ] Create quote request with specifications
- [ ] View quote request details
- [ ] Respond to quote (pricing still works)
- [ ] Generate PDF with new specification format

## Future Enhancements

### Short Term
- **Specification Templates**: Pre-fill common combinations
- **Bulk Upload**: Import product specifications from CSV
- **Search & Filter**: Find products by specifications

### Long Term
- **Pricing Rules**: Automatic pricing based on specifications
- **Stock Integration**: Check availability for specific specs
- **Customer Preferences**: Remember frequently used specifications

## Troubleshooting

### Common Issues
1. **Specifications not showing**: Check if product_specs exist for the product
2. **Validation errors**: Verify min/max values in product_specs table
3. **Save errors**: Ensure requested_specs column exists and accepts JSONB

### Debug Queries
```sql
-- Check product specifications
SELECT * FROM products_with_specs WHERE name = 'Round Pipes';

-- Check quote item specifications
SELECT * FROM quote_items_with_specs WHERE quote_request_id = 'your-id';

-- Verify specification data
SELECT
    p.name,
    ps.spec_name,
    ps.min_value,
    ps.max_value,
    ps.unit
FROM products p
JOIN product_specs ps ON p.id = ps.product_id
WHERE p.name = 'Round Pipes';
```
