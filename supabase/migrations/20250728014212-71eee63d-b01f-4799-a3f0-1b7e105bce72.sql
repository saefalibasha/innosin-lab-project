
-- Add sample Emergency Shower products with proper variant fields
INSERT INTO products (
  product_code, name, category, dimensions, description, full_description,
  product_series, company_tags, mounting_type, finish_type, is_active
) VALUES
-- Broen-Lab Emergency Shower Series - Eye Wash Stations
('ES-EW-001', 'Emergency Eye Wash Station - Wall Mounted', 'Emergency Safety', '300x200x150 mm', 'Wall-mounted emergency eye wash station', 'Professional emergency eye wash station designed for laboratory safety compliance. Features dual spray heads with flow control and activation lever.', 'Emergency Shower', ARRAY['Broen-Lab'], 'wall-mounted', 'stainless-steel', true),
('ES-EW-002', 'Emergency Eye Wash Station - Deck Mounted', 'Emergency Safety', '350x250x200 mm', 'Deck-mounted emergency eye wash station', 'Deck-mounted emergency eye wash station with integrated basin and dual spray heads for comprehensive eye irrigation.', 'Emergency Shower', ARRAY['Broen-Lab'], 'deck-mounted', 'stainless-steel', true),

-- Body Shower Stations
('ES-BS-001', 'Emergency Body Shower - Ceiling Mounted', 'Emergency Safety', '200x200x2500 mm', 'Ceiling-mounted emergency body shower', 'Full-body emergency shower with overhead spray head and pull-chain activation. Meets ANSI Z358.1 standards.', 'Emergency Shower', ARRAY['Broen-Lab'], 'ceiling-mounted', 'stainless-steel', true),
('ES-BS-002', 'Emergency Body Shower - Floor Mounted', 'Emergency Safety', '400x400x2200 mm', 'Floor-mounted emergency body shower', 'Floor-mounted emergency body shower with stable base and overhead spray head for laboratory safety.', 'Emergency Shower', ARRAY['Broen-Lab'], 'floor-mounted', 'stainless-steel', true),

-- Combination Units
('ES-CB-001', 'Emergency Combination Unit - Eye Wash + Body Shower', 'Emergency Safety', '600x400x2200 mm', 'Combined eye wash and body shower station', 'Complete emergency safety station combining eye wash and body shower functionality in one unit.', 'Emergency Shower', ARRAY['Broen-Lab'], 'floor-mounted', 'stainless-steel', true),
('ES-CB-002', 'Emergency Combination Unit - Compact', 'Emergency Safety', '500x350x2000 mm', 'Compact emergency combination unit', 'Space-saving emergency combination unit with both eye wash and body shower capabilities.', 'Emergency Shower', ARRAY['Broen-Lab'], 'floor-mounted', 'powder-coat', true),

-- Add TANGERINE Series Bio Safety Cabinet variants with proper types
('BSC-TG-A2-001', 'TANGERINE Bio Safety Cabinet - Class A2 - 4ft', 'Bio Safety Cabinet', '1200x750x2000 mm', 'Class A2 Bio Safety Cabinet - 4ft width', 'Class A2 biological safety cabinet with HEPA filtration and digital display. Suitable for BSL-1 and BSL-2 applications.', 'TANGERINE Series', ARRAY['TANGERINE'], 'bench-mounted', 'powder-coat', true),
('BSC-TG-A2-002', 'TANGERINE Bio Safety Cabinet - Class A2 - 6ft', 'Bio Safety Cabinet', '1800x750x2000 mm', 'Class A2 Bio Safety Cabinet - 6ft width', 'Class A2 biological safety cabinet with extended work surface and dual HEPA filtration system.', 'TANGERINE Series', ARRAY['TANGERINE'], 'bench-mounted', 'powder-coat', true),
('BSC-TG-B2-001', 'TANGERINE Bio Safety Cabinet - Class B2 - 4ft', 'Bio Safety Cabinet', '1200x750x2000 mm', 'Class B2 Bio Safety Cabinet - 4ft width', 'Class B2 biological safety cabinet with 100% exhaust and total containment for hazardous materials.', 'TANGERINE Series', ARRAY['TANGERINE'], 'bench-mounted', 'stainless-steel', true),
('BSC-TG-B2-002', 'TANGERINE Bio Safety Cabinet - Class B2 - 6ft', 'Bio Safety Cabinet', '1800x750x2000 mm', 'Class B2 Bio Safety Cabinet - 6ft width', 'Class B2 biological safety cabinet with extended work area and enhanced containment features.', 'TANGERINE Series', ARRAY['TANGERINE'], 'bench-mounted', 'stainless-steel', true),

-- Add NOCE Series Fume Hood variants
('FH-NOCE-001', 'NOCE Fume Hood - 4ft Standard', 'Fume Hood', '1200x750x2400 mm', 'Standard 4ft NOCE series fume hood', 'High-performance fume hood with variable air volume control and safety monitoring systems.', 'NOCE Series', ARRAY['NOCE'], 'bench-mounted', 'powder-coat', true),
('FH-NOCE-002', 'NOCE Fume Hood - 6ft Standard', 'Fume Hood', '1800x750x2400 mm', 'Standard 6ft NOCE series fume hood', 'Extended work surface fume hood with advanced airflow management and digital controls.', 'NOCE Series', ARRAY['NOCE'], 'bench-mounted', 'powder-coat', true),
('FH-NOCE-003', 'NOCE Fume Hood - 8ft Standard', 'Fume Hood', '2400x750x2400 mm', 'Standard 8ft NOCE series fume hood', 'Large work area fume hood suitable for extensive laboratory operations and equipment.', 'NOCE Series', ARRAY['NOCE'], 'bench-mounted', 'stainless-steel', true),

-- Add more UNIFLEX Series variants with proper mixing and handle types
('TAP-UF-MIX-001', 'UNIFLEX Mixing Tap - Polypropylene Handle', 'Laboratory Tap', '150x100x300 mm', 'Mixing tap with polypropylene handle', 'Laboratory mixing tap with chemical-resistant polypropylene handle and precise flow control.', 'UNIFLEX Series', ARRAY['Broen-Lab'], 'deck-mounted', 'stainless-steel', true),
('TAP-UF-MIX-002', 'UNIFLEX Mixing Tap - Wrist Action Lever', 'Laboratory Tap', '150x100x300 mm', 'Mixing tap with wrist action lever', 'Laboratory mixing tap with ergonomic wrist action lever for hands-free operation.', 'UNIFLEX Series', ARRAY['Broen-Lab'], 'deck-mounted', 'stainless-steel', true),
('TAP-UF-NONMIX-001', 'UNIFLEX Non-Mix Tap - Polypropylene Handle', 'Laboratory Tap', '150x100x300 mm', 'Non-mixing tap with polypropylene handle', 'Laboratory non-mixing tap with chemical-resistant polypropylene handle and single water supply.', 'UNIFLEX Series', ARRAY['Broen-Lab'], 'deck-mounted', 'stainless-steel', true),
('TAP-UF-NONMIX-002', 'UNIFLEX Non-Mix Tap - Wrist Action Lever', 'Laboratory Tap', '150x100x300 mm', 'Non-mixing tap with wrist action lever', 'Laboratory non-mixing tap with ergonomic wrist action lever for contamination-free operation.', 'UNIFLEX Series', ARRAY['Broen-Lab'], 'deck-mounted', 'stainless-steel', true);

-- Update existing products to have proper variant fields
UPDATE products 
SET mixing_type = 'mix', handle_type = 'polypropylene' 
WHERE product_code = 'TAP-UF-MIX-001';

UPDATE products 
SET mixing_type = 'mix', handle_type = 'wrist-action' 
WHERE product_code = 'TAP-UF-MIX-002';

UPDATE products 
SET mixing_type = 'non-mix', handle_type = 'polypropylene' 
WHERE product_code = 'TAP-UF-NONMIX-001';

UPDATE products 
SET mixing_type = 'non-mix', handle_type = 'wrist-action' 
WHERE product_code = 'TAP-UF-NONMIX-002';

-- Add variant type for Emergency Shower products
ALTER TABLE products ADD COLUMN IF NOT EXISTS emergency_shower_type TEXT;

-- Update Emergency Shower products with proper types
UPDATE products SET emergency_shower_type = 'eye-wash' WHERE product_code LIKE 'ES-EW-%';
UPDATE products SET emergency_shower_type = 'body-shower' WHERE product_code LIKE 'ES-BS-%';
UPDATE products SET emergency_shower_type = 'combination' WHERE product_code LIKE 'ES-CB-%';

-- Add variant type for TANGERINE series
ALTER TABLE products ADD COLUMN IF NOT EXISTS cabinet_class TEXT;

-- Update TANGERINE series with proper cabinet classes
UPDATE products SET cabinet_class = 'A2' WHERE product_code LIKE 'BSC-TG-A2-%';
UPDATE products SET cabinet_class = 'B2' WHERE product_code LIKE 'BSC-TG-B2-%';
