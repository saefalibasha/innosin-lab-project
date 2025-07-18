
-- Add editing fields to the products table and populate with all Innosin Lab product variations
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS editable_title TEXT,
ADD COLUMN IF NOT EXISTS editable_description TEXT,
ADD COLUMN IF NOT EXISTS product_series TEXT,
ADD COLUMN IF NOT EXISTS finish_type TEXT DEFAULT 'PC',
ADD COLUMN IF NOT EXISTS orientation TEXT DEFAULT 'None',
ADD COLUMN IF NOT EXISTS drawer_count INTEGER,
ADD COLUMN IF NOT EXISTS door_type TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_series ON public.products(product_series);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- Insert KNEE SPACE series products
INSERT INTO public.products (product_code, name, category, dimensions, editable_title, editable_description, product_series, finish_type, specifications) VALUES
('KS700-PC', 'KS Series Laboratory Bench 700mm', 'Innosin Lab', '700×750×850 mm', 'KS700 Laboratory Bench', 'Professional laboratory bench system with modular design - 700mm width', 'Knee Space', 'PC', '["Modular Design", "Chemical Resistant", "Adjustable Height"]'::jsonb),
('KS750-PC', 'KS Series Laboratory Bench 750mm', 'Innosin Lab', '750×750×850 mm', 'KS750 Laboratory Bench', 'Professional laboratory bench system with modular design - 750mm width', 'Knee Space', 'PC', '["Modular Design", "Chemical Resistant", "Adjustable Height"]'::jsonb),
('KS800-PC', 'KS Series Laboratory Bench 800mm', 'Innosin Lab', '800×750×850 mm', 'KS800 Laboratory Bench', 'Professional laboratory bench system with modular design - 800mm width', 'Knee Space', 'PC', '["Modular Design", "Chemical Resistant", "Adjustable Height"]'::jsonb),
('KS850-PC', 'KS Series Laboratory Bench 850mm', 'Innosin Lab', '850×750×850 mm', 'KS850 Laboratory Bench', 'Professional laboratory bench system with modular design - 850mm width', 'Knee Space', 'PC', '["Modular Design", "Chemical Resistant", "Adjustable Height"]'::jsonb),
('KS900-PC', 'KS Series Laboratory Bench 900mm', 'Innosin Lab', '900×750×850 mm', 'KS900 Laboratory Bench', 'Professional laboratory bench system with modular design - 900mm width', 'Knee Space', 'PC', '["Modular Design", "Chemical Resistant", "Adjustable Height"]'::jsonb),
('KS1000-PC', 'KS Series Laboratory Bench 1000mm', 'Innosin Lab', '1000×750×850 mm', 'KS1000 Laboratory Bench', 'Professional laboratory bench system with modular design - 1000mm width', 'Knee Space', 'PC', '["Modular Design", "Chemical Resistant", "Adjustable Height"]'::jsonb),
('KS1200-PC', 'KS Series Laboratory Bench 1200mm', 'Innosin Lab', '1200×750×850 mm', 'KS1200 Laboratory Bench', 'Professional laboratory bench system with modular design - 1200mm width', 'Knee Space', 'PC', '["Modular Design", "Chemical Resistant", "Adjustable Height"]'::jsonb);

-- Insert Stainless Steel variants for Knee Space
INSERT INTO public.products (product_code, name, category, dimensions, editable_title, editable_description, product_series, finish_type, specifications) VALUES
('KS700-SS', 'KS Series Laboratory Bench 700mm SS', 'Innosin Lab', '700×750×850 mm', 'KS700 Laboratory Bench (Stainless Steel)', 'Professional laboratory bench system with modular design - 700mm width, stainless steel finish', 'Knee Space', 'SS', '["Modular Design", "Chemical Resistant", "Adjustable Height", "Stainless Steel Finish"]'::jsonb),
('KS750-SS', 'KS Series Laboratory Bench 750mm SS', 'Innosin Lab', '750×750×850 mm', 'KS750 Laboratory Bench (Stainless Steel)', 'Professional laboratory bench system with modular design - 750mm width, stainless steel finish', 'Knee Space', 'SS', '["Modular Design", "Chemical Resistant", "Adjustable Height", "Stainless Steel Finish"]'::jsonb),
('KS800-SS', 'KS Series Laboratory Bench 800mm SS', 'Innosin Lab', '800×750×850 mm', 'KS800 Laboratory Bench (Stainless Steel)', 'Professional laboratory bench system with modular design - 800mm width, stainless steel finish', 'Knee Space', 'SS', '["Modular Design", "Chemical Resistant", "Adjustable Height", "Stainless Steel Finish"]'::jsonb),
('KS850-SS', 'KS Series Laboratory Bench 850mm SS', 'Innosin Lab', '850×750×850 mm', 'KS850 Laboratory Bench (Stainless Steel)', 'Professional laboratory bench system with modular design - 850mm width, stainless steel finish', 'Knee Space', 'SS', '["Modular Design", "Chemical Resistant", "Adjustable Height", "Stainless Steel Finish"]'::jsonb),
('KS900-SS', 'KS Series Laboratory Bench 900mm SS', 'Innosin Lab', '900×750×850 mm', 'KS900 Laboratory Bench (Stainless Steel)', 'Professional laboratory bench system with modular design - 900mm width, stainless steel finish', 'Knee Space', 'SS', '["Modular Design", "Chemical Resistant", "Adjustable Height", "Stainless Steel Finish"]'::jsonb),
('KS1000-SS', 'KS Series Laboratory Bench 1000mm SS', 'Innosin Lab', '1000×750×850 mm', 'KS1000 Laboratory Bench (Stainless Steel)', 'Professional laboratory bench system with modular design - 1000mm width, stainless steel finish', 'Knee Space', 'SS', '["Modular Design", "Chemical Resistant", "Adjustable Height", "Stainless Steel Finish"]'::jsonb),
('KS1200-SS', 'KS Series Laboratory Bench 1200mm SS', 'Innosin Lab', '1200×750×850 mm', 'KS1200 Laboratory Bench (Stainless Steel)', 'Professional laboratory bench system with modular design - 1200mm width, stainless steel finish', 'Knee Space', 'SS', '["Modular Design", "Chemical Resistant", "Adjustable Height", "Stainless Steel Finish"]'::jsonb);

-- Insert Mobile Cabinet for 750mm H Bench products
INSERT INTO public.products (product_code, name, category, dimensions, editable_title, editable_description, product_series, finish_type, orientation, specifications) VALUES
-- Combination cabinets
('MC750-COMB-LH-PC', 'Mobile Cabinet 750mm Combination LH', 'Innosin Lab', '500×500×650 mm', 'Mobile Combination Cabinet Left Hand', 'Mobile storage cabinet with combination compartments for 750mm bench height - Left Hand', 'Mobile Cabinet 750mm', 'PC', 'LH', '["Mobile Design", "Locking Casters", "Chemical Resistant", "750mm Bench Compatible"]'::jsonb),
('MC750-COMB-RH-PC', 'Mobile Cabinet 750mm Combination RH', 'Innosin Lab', '500×500×650 mm', 'Mobile Combination Cabinet Right Hand', 'Mobile storage cabinet with combination compartments for 750mm bench height - Right Hand', 'Mobile Cabinet 750mm', 'PC', 'RH', '["Mobile Design", "Locking Casters", "Chemical Resistant", "750mm Bench Compatible"]'::jsonb),
('MC750-COMB-LH-SS', 'Mobile Cabinet 750mm Combination LH SS', 'Innosin Lab', '500×500×650 mm', 'Mobile Combination Cabinet Left Hand (SS)', 'Mobile storage cabinet with combination compartments for 750mm bench height - Left Hand, stainless steel', 'Mobile Cabinet 750mm', 'SS', 'LH', '["Mobile Design", "Locking Casters", "Chemical Resistant", "750mm Bench Compatible", "Stainless Steel"]'::jsonb),
('MC750-COMB-RH-SS', 'Mobile Cabinet 750mm Combination RH SS', 'Innosin Lab', '500×500×650 mm', 'Mobile Combination Cabinet Right Hand (SS)', 'Mobile storage cabinet with combination compartments for 750mm bench height - Right Hand, stainless steel', 'Mobile Cabinet 750mm', 'SS', 'RH', '["Mobile Design", "Locking Casters", "Chemical Resistant", "750mm Bench Compatible", "Stainless Steel"]'::jsonb),

-- Double door cabinets
('MC750-DD-PC', 'Mobile Cabinet 750mm Double Door', 'Innosin Lab', '750×500×650 mm', 'Mobile Double Door Cabinet', 'Mobile storage cabinet with double door access for 750mm bench height', 'Mobile Cabinet 750mm', 'PC', 'None', '["Mobile Design", "Locking Casters", "Chemical Resistant", "750mm Bench Compatible", "Double Door"]'::jsonb),
('MC750-DD-SS', 'Mobile Cabinet 750mm Double Door SS', 'Innosin Lab', '750×500×650 mm', 'Mobile Double Door Cabinet (SS)', 'Mobile storage cabinet with double door access for 750mm bench height, stainless steel', 'Mobile Cabinet 750mm', 'SS', 'None', '["Mobile Design", "Locking Casters", "Chemical Resistant", "750mm Bench Compatible", "Double Door", "Stainless Steel"]'::jsonb),

-- Drawer cabinets
('MC750-3DWR-PC', 'Mobile Cabinet 750mm 3 Drawers', 'Innosin Lab', '500×500×650 mm', 'Mobile 3-Drawer Cabinet', 'Mobile storage cabinet with 3 drawers for 750mm bench height', 'Mobile Cabinet 750mm', 'PC', 'None', '["Mobile Design", "Locking Casters", "Chemical Resistant", "750mm Bench Compatible", "3 Drawers"]'::jsonb),
('MC750-3DWR-SS', 'Mobile Cabinet 750mm 3 Drawers SS', 'Innosin Lab', '500×500×650 mm', 'Mobile 3-Drawer Cabinet (SS)', 'Mobile storage cabinet with 3 drawers for 750mm bench height, stainless steel', 'Mobile Cabinet 750mm', 'SS', 'None', '["Mobile Design", "Locking Casters", "Chemical Resistant", "750mm Bench Compatible", "3 Drawers", "Stainless Steel"]'::jsonb),
('MC750-4DWR-PC', 'Mobile Cabinet 750mm 4 Drawers Wide', 'Innosin Lab', '900×500×650 mm', 'Mobile 4-Drawer Cabinet Wide', 'Mobile storage cabinet with 4 drawers for 750mm bench height - wide configuration', 'Mobile Cabinet 750mm', 'PC', 'None', '["Mobile Design", "Locking Casters", "Chemical Resistant", "750mm Bench Compatible", "4 Drawers", "Wide"]'::jsonb),
('MC750-4DWR-SS', 'Mobile Cabinet 750mm 4 Drawers Wide SS', 'Innosin Lab', '900×500×650 mm', 'Mobile 4-Drawer Cabinet Wide (SS)', 'Mobile storage cabinet with 4 drawers for 750mm bench height - wide configuration, stainless steel', 'Mobile Cabinet 750mm', 'SS', 'None', '["Mobile Design", "Locking Casters", "Chemical Resistant", "750mm Bench Compatible", "4 Drawers", "Wide", "Stainless Steel"]'::jsonb),
('MC750-6DWR-PC', 'Mobile Cabinet 750mm 6 Drawers Wide', 'Innosin Lab', '900×500×650 mm', 'Mobile 6-Drawer Cabinet Wide', 'Mobile storage cabinet with 6 drawers for 750mm bench height - wide configuration', 'Mobile Cabinet 750mm', 'PC', 'None', '["Mobile Design", "Locking Casters", "Chemical Resistant", "750mm Bench Compatible", "6 Drawers", "Wide"]'::jsonb),
('MC750-6DWR-SS', 'Mobile Cabinet 750mm 6 Drawers Wide SS', 'Innosin Lab', '900×500×650 mm', 'Mobile 6-Drawer Cabinet Wide (SS)', 'Mobile storage cabinet with 6 drawers for 750mm bench height - wide configuration, stainless steel', 'Mobile Cabinet 750mm', 'SS', 'None', '["Mobile Design", "Locking Casters", "Chemical Resistant", "750mm Bench Compatible", "6 Drawers", "Wide", "Stainless Steel"]'::jsonb),

-- Single door cabinets
('MC750-SD-LH-PC', 'Mobile Cabinet 750mm Single Door LH', 'Innosin Lab', '500×500×650 mm', 'Mobile Single Door Cabinet Left Hand', 'Mobile storage cabinet with single door for 750mm bench height - Left Hand', 'Mobile Cabinet 750mm', 'PC', 'LH', '["Mobile Design", "Locking Casters", "Chemical Resistant", "750mm Bench Compatible", "Single Door"]'::jsonb),
('MC750-SD-RH-PC', 'Mobile Cabinet 750mm Single Door RH', 'Innosin Lab', '500×500×650 mm', 'Mobile Single Door Cabinet Right Hand', 'Mobile storage cabinet with single door for 750mm bench height - Right Hand', 'Mobile Cabinet 750mm', 'PC', 'RH', '["Mobile Design", "Locking Casters", "Chemical Resistant", "750mm Bench Compatible", "Single Door"]'::jsonb),
('MC750-SD-LH-SS', 'Mobile Cabinet 750mm Single Door LH SS', 'Innosin Lab', '500×500×650 mm', 'Mobile Single Door Cabinet Left Hand (SS)', 'Mobile storage cabinet with single door for 750mm bench height - Left Hand, stainless steel', 'Mobile Cabinet 750mm', 'SS', 'LH', '["Mobile Design", "Locking Casters", "Chemical Resistant", "750mm Bench Compatible", "Single Door", "Stainless Steel"]'::jsonb),
('MC750-SD-RH-SS', 'Mobile Cabinet 750mm Single Door RH SS', 'Innosin Lab', '500×500×650 mm', 'Mobile Single Door Cabinet Right Hand (SS)', 'Mobile storage cabinet with single door for 750mm bench height - Right Hand, stainless steel', 'Mobile Cabinet 750mm', 'SS', 'RH', '["Mobile Design", "Locking Casters", "Chemical Resistant", "750mm Bench Compatible", "Single Door", "Stainless Steel"]'::jsonb);

-- Insert Mobile Cabinet for 900mm H Bench products (sample - continuing the pattern)
INSERT INTO public.products (product_code, name, category, dimensions, editable_title, editable_description, product_series, finish_type, orientation, drawer_count, specifications) VALUES
-- 900mm Combination cabinets
('MC900-COMB-750-PC', 'Mobile Cabinet 900mm Combination 750mm', 'Innosin Lab', '750×500×800 mm', 'Mobile Combination Cabinet 750mm Wide', 'Mobile storage cabinet with combination compartments for 900mm bench height - 750mm width', 'Mobile Cabinet 900mm', 'PC', 'None', NULL, '["Mobile Design", "Locking Casters", "Chemical Resistant", "900mm Bench Compatible", "Enhanced Height"]'::jsonb),
('MC900-COMB-LH-PC', 'Mobile Cabinet 900mm Combination LH', 'Innosin Lab', '500×500×800 mm', 'Mobile Combination Cabinet Left Hand', 'Mobile storage cabinet with combination compartments for 900mm bench height - Left Hand', 'Mobile Cabinet 900mm', 'PC', 'LH', NULL, '["Mobile Design", "Locking Casters", "Chemical Resistant", "900mm Bench Compatible", "Enhanced Height"]'::jsonb),
('MC900-COMB-RH-PC', 'Mobile Cabinet 900mm Combination RH', 'Innosin Lab', '500×500×800 mm', 'Mobile Combination Cabinet Right Hand', 'Mobile storage cabinet with combination compartments for 900mm bench height - Right Hand', 'Mobile Cabinet 900mm', 'PC', 'RH', NULL, '["Mobile Design", "Locking Casters", "Chemical Resistant", "900mm Bench Compatible", "Enhanced Height"]'::jsonb),

-- 900mm Drawer configurations
('MC900-3DWR-PC', 'Mobile Cabinet 900mm 3 Drawers', 'Innosin Lab', '500×500×800 mm', 'Mobile 3-Drawer Cabinet Enhanced Height', 'Mobile storage cabinet with 3 drawers for 900mm bench height', 'Mobile Cabinet 900mm', 'PC', 'None', 3, '["Mobile Design", "Locking Casters", "Chemical Resistant", "900mm Bench Compatible", "Enhanced Height", "3 Drawers"]'::jsonb),
('MC900-2DWR-PC', 'Mobile Cabinet 900mm 2 Drawers Wide', 'Innosin Lab', '900×500×800 mm', 'Mobile 2-Drawer Cabinet Wide', 'Mobile storage cabinet with 2 drawers for 900mm bench height - wide configuration', 'Mobile Cabinet 900mm', 'PC', 'None', 2, '["Mobile Design", "Locking Casters", "Chemical Resistant", "900mm Bench Compatible", "Enhanced Height", "2 Drawers", "Wide"]'::jsonb),
('MC900-4DWR-PC', 'Mobile Cabinet 900mm 4 Drawers Wide', 'Innosin Lab', '900×500×800 mm', 'Mobile 4-Drawer Cabinet Wide Enhanced', 'Mobile storage cabinet with 4 drawers for 900mm bench height - wide configuration', 'Mobile Cabinet 900mm', 'PC', 'None', 4, '["Mobile Design", "Locking Casters", "Chemical Resistant", "900mm Bench Compatible", "Enhanced Height", "4 Drawers", "Wide"]'::jsonb),
('MC900-6DWR-PC', 'Mobile Cabinet 900mm 6 Drawers Wide', 'Innosin Lab', '900×500×800 mm', 'Mobile 6-Drawer Cabinet Wide Enhanced', 'Mobile storage cabinet with 6 drawers for 900mm bench height - wide configuration', 'Mobile Cabinet 900mm', 'PC', 'None', 6, '["Mobile Design", "Locking Casters", "Chemical Resistant", "900mm Bench Compatible", "Enhanced Height", "6 Drawers", "Wide"]'::jsonb),
('MC900-8DWR-PC', 'Mobile Cabinet 900mm 8 Drawers Wide', 'Innosin Lab', '900×500×800 mm', 'Mobile 8-Drawer Cabinet Wide Enhanced', 'Mobile storage cabinet with 8 drawers for 900mm bench height - wide configuration', 'Mobile Cabinet 900mm', 'PC', 'None', 8, '["Mobile Design", "Locking Casters", "Chemical Resistant", "900mm Bench Compatible", "Enhanced Height", "8 Drawers", "Wide"]'::jsonb);

-- Insert sample Modular Cabinet products
INSERT INTO public.products (product_code, name, category, dimensions, editable_title, editable_description, product_series, finish_type, door_type, specifications) VALUES
-- Modular Combination Cabinet
('MOD-COMB-DD-750-PC', 'Modular Combination Double Door 750mm', 'Innosin Lab', '750×550×900 mm', 'Modular Double Door Cabinet 750mm', 'Modular cabinet system with double door configuration - 750mm width', 'Modular Cabinet', 'PC', 'Double Door', '["Modular System", "Chemical Resistant", "Double Door Access", "750mm Width"]'::jsonb),
('MOD-COMB-DD-900-PC', 'Modular Combination Double Door 900mm', 'Innosin Lab', '900×550×900 mm', 'Modular Double Door Cabinet 900mm', 'Modular cabinet system with double door configuration - 900mm width', 'Modular Cabinet', 'PC', 'Double Door', '["Modular System", "Chemical Resistant", "Double Door Access", "900mm Width"]'::jsonb),

-- Modular Single Door Cabinet
('MOD-SD-450-LH-PC', 'Modular Single Door 450mm LH', 'Innosin Lab', '450×550×900 mm', 'Modular Single Door Cabinet 450mm LH', 'Modular cabinet system with single door - 450mm width, Left Hand', 'Modular Cabinet', 'PC', 'Single Door', '["Modular System", "Chemical Resistant", "Single Door", "450mm Width", "Left Hand"]'::jsonb),
('MOD-SD-500-LH-PC', 'Modular Single Door 500mm LH', 'Innosin Lab', '500×550×900 mm', 'Modular Single Door Cabinet 500mm LH', 'Modular cabinet system with single door - 500mm width, Left Hand', 'Modular Cabinet', 'PC', 'Single Door', '["Modular System", "Chemical Resistant", "Single Door", "500mm Width", "Left Hand"]'::jsonb),
('MOD-SD-550-LH-PC', 'Modular Single Door 550mm LH', 'Innosin Lab', '550×550×900 mm', 'Modular Single Door Cabinet 550mm LH', 'Modular cabinet system with single door - 550mm width, Left Hand', 'Modular Cabinet', 'PC', 'Single Door', '["Modular System", "Chemical Resistant", "Single Door", "550mm Width", "Left Hand"]'::jsonb),
('MOD-SD-600-LH-PC', 'Modular Single Door 600mm LH', 'Innosin Lab', '600×550×900 mm', 'Modular Single Door Cabinet 600mm LH', 'Modular cabinet system with single door - 600mm width, Left Hand', 'Modular Cabinet', 'PC', 'Single Door', '["Modular System", "Chemical Resistant", "Single Door", "600mm Width", "Left Hand"]'::jsonb);

-- Insert sample Open Rack products
INSERT INTO public.products (product_code, name, category, dimensions, editable_title, editable_description, product_series, finish_type, specifications) VALUES
('OR-600-450-180-PC', 'Open Rack 600×450×1800', 'Innosin Lab', '600×450×1800 mm', 'Open Rack System 600×450', 'Open rack storage system for maximum accessibility - 600×450×1800mm', 'Open Rack', 'PC', '["Open Design", "Maximum Accessibility", "Adjustable Shelves", "600mm Width"]'::jsonb),
('OR-600-500-180-PC', 'Open Rack 600×500×1800', 'Innosin Lab', '600×500×1800 mm', 'Open Rack System 600×500', 'Open rack storage system for maximum accessibility - 600×500×1800mm', 'Open Rack', 'PC', '["Open Design", "Maximum Accessibility", "Adjustable Shelves", "600mm Width"]'::jsonb),
('OR-600-550-180-PC', 'Open Rack 600×550×1800', 'Innosin Lab', '600×550×1800 mm', 'Open Rack System 600×550', 'Open rack storage system for maximum accessibility - 600×550×1800mm', 'Open Rack', 'PC', '["Open Design", "Maximum Accessibility", "Adjustable Shelves", "600mm Width"]'::jsonb);

-- Insert sample Wall Cabinet products
INSERT INTO public.products (product_code, name, category, dimensions, editable_title, editable_description, product_series, finish_type, door_type, orientation, specifications) VALUES
-- Glass Wall Cabinets
('WC-GLASS-DD-750-PC', 'Wall Cabinet Glass Double Door 750mm', 'Innosin Lab', '750×330×750 mm', 'Wall Glass Cabinet Double Door 750mm', 'Wall-mounted cabinet with glass double doors - 750mm width', 'Wall Cabinet', 'PC', 'Glass Double Door', 'None', '["Wall Mounted", "Space Efficient", "Glass Doors", "750mm Width"]'::jsonb),
('WC-GLASS-SD-450-LH-PC', 'Wall Cabinet Glass Single Door 450mm LH', 'Innosin Lab', '450×330×750 mm', 'Wall Glass Cabinet Single Door 450mm LH', 'Wall-mounted cabinet with glass single door - 450mm width, Left Hand', 'Wall Cabinet', 'PC', 'Glass Single Door', 'LH', '["Wall Mounted", "Space Efficient", "Glass Door", "450mm Width", "Left Hand"]'::jsonb),
('WC-GLASS-SD-500-RH-PC', 'Wall Cabinet Glass Single Door 500mm RH', 'Innosin Lab', '500×330×750 mm', 'Wall Glass Cabinet Single Door 500mm RH', 'Wall-mounted cabinet with glass single door - 500mm width, Right Hand', 'Wall Cabinet', 'PC', 'Glass Single Door', 'RH', '["Wall Mounted", "Space Efficient", "Glass Door", "500mm Width", "Right Hand"]'::jsonb),

-- Solid Wall Cabinets
('WC-SOLID-DD-750-PC', 'Wall Cabinet Solid Double Door 750mm', 'Innosin Lab', '750×330×750 mm', 'Wall Solid Cabinet Double Door 750mm', 'Wall-mounted cabinet with solid double doors - 750mm width', 'Wall Cabinet', 'PC', 'Solid Double Door', 'None', '["Wall Mounted", "Space Efficient", "Solid Doors", "750mm Width"]'::jsonb),
('WC-SOLID-SD-450-LH-PC', 'Wall Cabinet Solid Single Door 450mm LH', 'Innosin Lab', '450×330×750 mm', 'Wall Solid Cabinet Single Door 450mm LH', 'Wall-mounted cabinet with solid single door - 450mm width, Left Hand', 'Wall Cabinet', 'PC', 'Solid Single Door', 'LH', '["Wall Mounted", "Space Efficient", "Solid Door", "450mm Width", "Left Hand"]'::jsonb);

-- Insert sample Tall Cabinet products
INSERT INTO public.products (product_code, name, category, dimensions, editable_title, editable_description, product_series, finish_type, door_type, specifications) VALUES
-- Tall Glass Door Cabinets
('TC-GLASS-750-400-180-PC', 'Tall Cabinet Glass Door 750×400×1800', 'Innosin Lab', '750×400×1800 mm', 'Tall Glass Door Cabinet 750×400', 'Tall storage cabinet with glass door - 750×400×1800mm', 'Tall Cabinet', 'PC', 'Glass Door', '["Maximum Height", "Glass Door Visibility", "Secure Storage", "750mm Width"]'::jsonb),
('TC-GLASS-750-450-180-PC', 'Tall Cabinet Glass Door 750×450×1800', 'Innosin Lab', '750×450×1800 mm', 'Tall Glass Door Cabinet 750×450', 'Tall storage cabinet with glass door - 750×450×1800mm', 'Tall Cabinet', 'PC', 'Glass Door', '["Maximum Height", "Glass Door Visibility", "Secure Storage", "750mm Width"]'::jsonb),

-- Tall Solid Door Cabinets
('TC-SOLID-750-400-180-PC', 'Tall Cabinet Solid Door 750×400×1800', 'Innosin Lab', '750×400×1800 mm', 'Tall Solid Door Cabinet 750×400', 'Tall storage cabinet with solid door - 750×400×1800mm', 'Tall Cabinet', 'PC', 'Solid Door', '["Maximum Height", "Solid Door Security", "Secure Storage", "750mm Width"]'::jsonb),
('TC-SOLID-750-450-180-PC', 'Tall Cabinet Solid Door 750×450×1800', 'Innosin Lab', '750×450×1800 mm', 'Tall Solid Door Cabinet 750×450', 'Tall storage cabinet with solid door - 750×450×1800mm', 'Tall Cabinet', 'PC', 'Solid Door', '["Maximum Height", "Solid Door Security", "Secure Storage", "750mm Width"]'::jsonb);

-- Insert sample Sink Cabinet products
INSERT INTO public.products (product_code, name, category, dimensions, editable_title, editable_description, product_series, finish_type, door_type, orientation, specifications) VALUES
-- Sink Double Door Cabinets
('SC-DD-1200-PC', 'Sink Cabinet Double Door 1200mm', 'Innosin Lab', '1200×550×900 mm', 'Sink Double Door Cabinet 1200mm', 'Sink cabinet with double door access - 1200mm width', 'Sink Cabinet', 'PC', 'Double Door', 'None', '["Sink Integration", "Double Door Access", "Water Resistant", "1200mm Width"]'::jsonb),
('SC-DD-750-PC', 'Sink Cabinet Double Door 750mm', 'Innosin Lab', '750×550×900 mm', 'Sink Double Door Cabinet 750mm', 'Sink cabinet with double door access - 750mm width', 'Sink Cabinet', 'PC', 'Double Door', 'None', '["Sink Integration", "Double Door Access", "Water Resistant", "750mm Width"]'::jsonb),

-- Sink Single Door Cabinets
('SC-SD-600-LH-PC', 'Sink Cabinet Single Door 600mm LH', 'Innosin Lab', '600×550×900 mm', 'Sink Single Door Cabinet 600mm LH', 'Sink cabinet with single door - 600mm width, Left Hand', 'Sink Cabinet', 'PC', 'Single Door', 'LH', '["Sink Integration", "Single Door Access", "Water Resistant", "600mm Width", "Left Hand"]'::jsonb),
('SC-SD-650-RH-PC', 'Sink Cabinet Single Door 650mm RH', 'Innosin Lab', '650×550×900 mm', 'Sink Single Door Cabinet 650mm RH', 'Sink cabinet with single door - 650mm width, Right Hand', 'Sink Cabinet', 'PC', 'Single Door', 'RH', '["Sink Integration", "Single Door Access", "Water Resistant", "650mm Width", "Right Hand"]'::jsonb);
