
-- Insert sample Safe Aire II Fume Hood products with proper variants
INSERT INTO products (
  name, category, dimensions, description, product_series, 
  mounting_type, finish_type, company_tags, thumbnail_path, is_active
) VALUES 
-- Safe Aire II Fume Hoods
('Safe Aire II Fume Hood - 4ft Bench Mounted', 'Fume Hood', '4ft x 2.5ft x 3ft', 'Hamilton Safe Aire II fume hood with bench mounting', 'Safe Aire II', 'bench-mounted', 'powder-coat', ARRAY['Hamilton Laboratory Solutions'], 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop', true),
('Safe Aire II Fume Hood - 6ft Bench Mounted', 'Fume Hood', '6ft x 2.5ft x 3ft', 'Hamilton Safe Aire II fume hood with bench mounting', 'Safe Aire II', 'bench-mounted', 'powder-coat', ARRAY['Hamilton Laboratory Solutions'], 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop', true),
('Safe Aire II Fume Hood - 4ft Floor Mounted', 'Fume Hood', '4ft x 2.5ft x 8ft', 'Hamilton Safe Aire II fume hood with floor mounting', 'Safe Aire II', 'floor-mounted', 'stainless-steel', ARRAY['Hamilton Laboratory Solutions'], 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop', true),
('Safe Aire II Fume Hood - 6ft Floor Mounted', 'Fume Hood', '6ft x 2.5ft x 8ft', 'Hamilton Safe Aire II fume hood with floor mounting', 'Safe Aire II', 'floor-mounted', 'stainless-steel', ARRAY['Hamilton Laboratory Solutions'], 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop', true),

-- NOCE Series Fume Hoods
('NOCE Series Fume Hood - Compact', 'Fume Hood', '4ft x 2ft x 3ft', 'Oriental Giken NOCE Series compact fume hood', 'NOCE Series', 'bench-mounted', 'powder-coat', ARRAY['Oriental Giken Inc.'], 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop', true),
('NOCE Series Fume Hood - Standard', 'Fume Hood', '6ft x 2.5ft x 3ft', 'Oriental Giken NOCE Series standard fume hood', 'NOCE Series', 'bench-mounted', 'stainless-steel', ARRAY['Oriental Giken Inc.'], 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop', true),

-- TANGERINE Series Bio Safety Cabinets
('TANGERINE Bio Safety Cabinet - Type A2', 'Bio Safety Cabinet', '4ft x 2ft x 6ft', 'Oriental Giken TANGERINE Series Type A2 bio safety cabinet', 'TANGERINE Series', 'floor-mounted', 'stainless-steel', ARRAY['Oriental Giken Inc.'], 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop', true),
('TANGERINE Bio Safety Cabinet - Type B2', 'Bio Safety Cabinet', '6ft x 2ft x 6ft', 'Oriental Giken TANGERINE Series Type B2 bio safety cabinet', 'TANGERINE Series', 'floor-mounted', 'stainless-steel', ARRAY['Oriental Giken Inc.'], 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop', true),

-- Broen-Lab UNIFLEX Series Taps
('UNIFLEX Single Way Tap - Non-Mix Polypropylene', 'Laboratory Tap', 'Standard', 'Broen-Lab UNIFLEX single way tap with non-mix valve and polypropylene handle', 'UNIFLEX Series', NULL, 'stainless-steel', ARRAY['Broen-Lab'], 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop', true),
('UNIFLEX Single Way Tap - Non-Mix Wrist Action', 'Laboratory Tap', 'Standard', 'Broen-Lab UNIFLEX single way tap with non-mix valve and wrist action lever', 'UNIFLEX Series', NULL, 'stainless-steel', ARRAY['Broen-Lab'], 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop', true),
('UNIFLEX Single Way Tap - Mix Polypropylene', 'Laboratory Tap', 'Standard', 'Broen-Lab UNIFLEX single way tap with mixing valve and polypropylene handle', 'UNIFLEX Series', NULL, 'stainless-steel', ARRAY['Broen-Lab'], 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop', true),
('UNIFLEX Single Way Tap - Mix Wrist Action', 'Laboratory Tap', 'Standard', 'Broen-Lab UNIFLEX single way tap with mixing valve and wrist action lever', 'UNIFLEX Series', NULL, 'stainless-steel', ARRAY['Broen-Lab'], 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop', true);

-- Update the UNIFLEX products with proper variant fields
UPDATE products 
SET mixing_type = CASE 
  WHEN name ILIKE '%non-mix%' THEN 'non-mix'
  WHEN name ILIKE '%mix%' AND name NOT ILIKE '%non-mix%' THEN 'mix'
  ELSE 'non-mix'
END,
handle_type = CASE 
  WHEN name ILIKE '%wrist%' OR name ILIKE '%action%' THEN 'wrist-action'
  WHEN name ILIKE '%polypropylene%' THEN 'polypropylene'
  ELSE 'polypropylene'
END
WHERE product_series = 'UNIFLEX Series';
