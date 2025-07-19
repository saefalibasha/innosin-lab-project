
-- First, let's clean up the existing products table by removing redundant entries
-- and then insert the correct product structure as specified

-- Clear existing Innosin Lab products to start fresh
DELETE FROM products WHERE category = 'Innosin Lab';

-- Insert KS Series (Knee Space) products with correct dimensions
INSERT INTO products (
  product_code, name, category, product_series, dimensions, 
  finish_type, orientation, door_type, drawer_count,
  editable_title, editable_description, is_active
) VALUES
-- KS Series
('KS700', 'Laboratory Bench Knee Space 700mm', 'Innosin Lab', 'Laboratory Bench Knee Space Series', '700×550×880 mm', 'PC', 'None', 'None', 0, 'KS700 - Laboratory Bench Knee Space', 'Knee space laboratory bench with 700mm width', true),
('KS750', 'Laboratory Bench Knee Space 750mm', 'Innosin Lab', 'Laboratory Bench Knee Space Series', '750×550×880 mm', 'PC', 'None', 'None', 0, 'KS750 - Laboratory Bench Knee Space', 'Knee space laboratory bench with 750mm width', true),
('KS800', 'Laboratory Bench Knee Space 800mm', 'Innosin Lab', 'Laboratory Bench Knee Space Series', '800×550×880 mm', 'PC', 'None', 'None', 0, 'KS800 - Laboratory Bench Knee Space', 'Knee space laboratory bench with 800mm width', true),
('KS850', 'Laboratory Bench Knee Space 850mm', 'Innosin Lab', 'Laboratory Bench Knee Space Series', '850×550×880 mm', 'PC', 'None', 'None', 0, 'KS850 - Laboratory Bench Knee Space', 'Knee space laboratory bench with 850mm width', true),
('KS900', 'Laboratory Bench Knee Space 900mm', 'Innosin Lab', 'Laboratory Bench Knee Space Series', '900×550×880 mm', 'PC', 'None', 'None', 0, 'KS900 - Laboratory Bench Knee Space', 'Knee space laboratory bench with 900mm width', true),
('KS1000', 'Laboratory Bench Knee Space 1000mm', 'Innosin Lab', 'Laboratory Bench Knee Space Series', '1000×550×880 mm', 'PC', 'None', 'None', 0, 'KS1000 - Laboratory Bench Knee Space', 'Knee space laboratory bench with 1000mm width', true),
('KS1200', 'Laboratory Bench Knee Space 1200mm', 'Innosin Lab', 'Laboratory Bench Knee Space Series', '1200×550×880 mm', 'PC', 'None', 'None', 0, 'KS1200 - Laboratory Bench Knee Space', 'Knee space laboratory bench with 1200mm width', true),

-- Mobile Cabinet for 750mm H Bench Series
('MC-750-COMB-LH', 'Mobile Cabinet Combination Left Hand', 'Innosin Lab', 'Mobile Cabinet for 750mm H Bench', '500×500×650 mm', 'PC', 'LH', 'Combination', 0, 'Mobile Cabinet - Combination Left Hand', 'Mobile combination cabinet for 750mm height bench - Left Hand', true),
('MC-750-COMB-RH', 'Mobile Cabinet Combination Right Hand', 'Innosin Lab', 'Mobile Cabinet for 750mm H Bench', '500×500×650 mm', 'PC', 'RH', 'Combination', 0, 'Mobile Cabinet - Combination Right Hand', 'Mobile combination cabinet for 750mm height bench - Right Hand', true),
('MC-750-DD', 'Mobile Cabinet Double Door', 'Innosin Lab', 'Mobile Cabinet for 750mm H Bench', '750×500×650 mm', 'PC', 'None', 'Double Door', 0, 'Mobile Cabinet - Double Door', 'Mobile double door cabinet for 750mm height bench', true),
('MC-750-DWR3', 'Mobile Cabinet 3 Drawers', 'Innosin Lab', 'Mobile Cabinet for 750mm H Bench', '500×500×650 mm', 'PC', 'None', 'None', 3, 'Mobile Cabinet - 3 Drawers', 'Mobile cabinet with 3 drawers for 750mm height bench', true),
('MC-750-DWR4', 'Mobile Cabinet 4 Drawers', 'Innosin Lab', 'Mobile Cabinet for 750mm H Bench', '900×500×650 mm', 'PC', 'None', 'None', 4, 'Mobile Cabinet - 4 Drawers', 'Mobile cabinet with 4 drawers for 750mm height bench', true),
('MC-750-DWR6', 'Mobile Cabinet 6 Drawers', 'Innosin Lab', 'Mobile Cabinet for 750mm H Bench', '900×500×650 mm', 'PC', 'None', 'None', 6, 'Mobile Cabinet - 6 Drawers', 'Mobile cabinet with 6 drawers for 750mm height bench', true),
('MC-750-SD-LH', 'Mobile Cabinet Single Door Left Hand', 'Innosin Lab', 'Mobile Cabinet for 750mm H Bench', '500×500×650 mm', 'PC', 'LH', 'Single Door', 0, 'Mobile Cabinet - Single Door Left Hand', 'Mobile single door cabinet for 750mm height bench - Left Hand', true),
('MC-750-SD-RH', 'Mobile Cabinet Single Door Right Hand', 'Innosin Lab', 'Mobile Cabinet for 750mm H Bench', '500×500×650 mm', 'PC', 'RH', 'Single Door', 0, 'Mobile Cabinet - Single Door Right Hand', 'Mobile single door cabinet for 750mm height bench - Right Hand', true),

-- Mobile Cabinet for 900mm H Bench Series
('MC-900-COMB-750', 'Mobile Cabinet Combination 750mm', 'Innosin Lab', 'Mobile Cabinet for 900mm H Bench', '750×500×800 mm', 'PC', 'None', 'Combination', 0, 'Mobile Cabinet - Combination 750mm', 'Mobile combination cabinet 750mm for 900mm height bench', true),
('MC-900-COMB-LH', 'Mobile Cabinet Combination Left Hand', 'Innosin Lab', 'Mobile Cabinet for 900mm H Bench', '500×500×800 mm', 'PC', 'LH', 'Combination', 0, 'Mobile Cabinet - Combination Left Hand', 'Mobile combination cabinet for 900mm height bench - Left Hand', true),
('MC-900-COMB-RH', 'Mobile Cabinet Combination Right Hand', 'Innosin Lab', 'Mobile Cabinet for 900mm H Bench', '500×500×800 mm', 'PC', 'RH', 'Combination', 0, 'Mobile Cabinet - Combination Right Hand', 'Mobile combination cabinet for 900mm height bench - Right Hand', true),
('MC-900-DD', 'Mobile Cabinet Double Door', 'Innosin Lab', 'Mobile Cabinet for 900mm H Bench', '750×500×800 mm', 'PC', 'None', 'Double Door', 0, 'Mobile Cabinet - Double Door', 'Mobile double door cabinet for 900mm height bench', true),
('MC-900-DWR3', 'Mobile Cabinet 3 Drawers', 'Innosin Lab', 'Mobile Cabinet for 900mm H Bench', '500×500×800 mm', 'PC', 'None', 'None', 3, 'Mobile Cabinet - 3 Drawers', 'Mobile cabinet with 3 drawers for 900mm height bench', true),
('MC-900-DWR2', 'Mobile Cabinet 2 Drawers', 'Innosin Lab', 'Mobile Cabinet for 900mm H Bench', '900×500×800 mm', 'PC', 'None', 'None', 2, 'Mobile Cabinet - 2 Drawers', 'Mobile cabinet with 2 drawers for 900mm height bench', true),
('MC-900-DWR4', 'Mobile Cabinet 4 Drawers', 'Innosin Lab', 'Mobile Cabinet for 900mm H Bench', '900×500×800 mm', 'PC', 'None', 'None', 4, 'Mobile Cabinet - 4 Drawers', 'Mobile cabinet with 4 drawers for 900mm height bench', true),
('MC-900-DWR6', 'Mobile Cabinet 6 Drawers', 'Innosin Lab', 'Mobile Cabinet for 900mm H Bench', '900×500×800 mm', 'PC', 'None', 'None', 6, 'Mobile Cabinet - 6 Drawers', 'Mobile cabinet with 6 drawers for 900mm height bench', true),
('MC-900-DWR8', 'Mobile Cabinet 8 Drawers', 'Innosin Lab', 'Mobile Cabinet for 900mm H Bench', '900×500×800 mm', 'PC', 'None', 'None', 8, 'Mobile Cabinet - 8 Drawers', 'Mobile cabinet with 8 drawers for 900mm height bench', true),
('MC-900-SD-LH', 'Mobile Cabinet Single Door Left Hand', 'Innosin Lab', 'Mobile Cabinet for 900mm H Bench', '500×500×800 mm', 'PC', 'LH', 'Single Door', 0, 'Mobile Cabinet - Single Door Left Hand', 'Mobile single door cabinet for 900mm height bench - Left Hand', true),
('MC-900-SD-RH', 'Mobile Cabinet Single Door Right Hand', 'Innosin Lab', 'Mobile Cabinet for 900mm H Bench', '500×500×800 mm', 'PC', 'RH', 'Single Door', 0, 'Mobile Cabinet - Single Door Right Hand', 'Mobile single door cabinet for 900mm height bench - Right Hand', true),

-- Modular Cabinet Series
('MOD-COMB-DD-750', 'Modular Combination Double Door 750mm', 'Innosin Lab', 'Modular Cabinet', '750×550×900 mm', 'PC', 'None', 'Double Door', 0, 'Modular Combination - Double Door 750mm', 'Modular combination cabinet with double door 750mm', true),
('MOD-COMB-DD-900', 'Modular Combination Double Door 900mm', 'Innosin Lab', 'Modular Cabinet', '900×550×900 mm', 'PC', 'None', 'Double Door', 0, 'Modular Combination - Double Door 900mm', 'Modular combination cabinet with double door 900mm', true),
('MOD-COMB-DD-100', 'Modular Combination Double Door 100mm', 'Innosin Lab', 'Modular Cabinet', '100×550×900 mm', 'PC', 'None', 'Double Door', 0, 'Modular Combination - Double Door 100mm', 'Modular combination cabinet with double door 100mm (special variant)', true),
('MOD-COMB-SD-450-LH', 'Modular Combination Single Door 450mm LH', 'Innosin Lab', 'Modular Cabinet', '450×550×900 mm', 'PC', 'LH', 'Single Door', 0, 'Modular Combination - Single Door 450mm LH', 'Modular combination cabinet with single door 450mm Left Hand', true),
('MOD-COMB-SD-450-RH', 'Modular Combination Single Door 450mm RH', 'Innosin Lab', 'Modular Cabinet', '450×550×900 mm', 'PC', 'RH', 'Single Door', 0, 'Modular Combination - Single Door 450mm RH', 'Modular combination cabinet with single door 450mm Right Hand', true),
('MOD-COMB-SD-500-LH', 'Modular Combination Single Door 500mm LH', 'Innosin Lab', 'Modular Cabinet', '500×550×900 mm', 'PC', 'LH', 'Single Door', 0, 'Modular Combination - Single Door 500mm LH', 'Modular combination cabinet with single door 500mm Left Hand', true),
('MOD-COMB-SD-500-RH', 'Modular Combination Single Door 500mm RH', 'Innosin Lab', 'Modular Cabinet', '500×550×900 mm', 'PC', 'RH', 'Single Door', 0, 'Modular Combination - Single Door 500mm RH', 'Modular combination cabinet with single door 500mm Right Hand', true),
('MOD-COMB-SD-550-LH', 'Modular Combination Single Door 550mm LH', 'Innosin Lab', 'Modular Cabinet', '550×550×900 mm', 'PC', 'LH', 'Single Door', 0, 'Modular Combination - Single Door 550mm LH', 'Modular combination cabinet with single door 550mm Left Hand', true),
('MOD-COMB-SD-550-RH', 'Modular Combination Single Door 550mm RH', 'Innosin Lab', 'Modular Cabinet', '550×550×900 mm', 'PC', 'RH', 'Single Door', 0, 'Modular Combination - Single Door 550mm RH', 'Modular combination cabinet with single door 550mm Right Hand', true),
('MOD-COMB-SD-600-LH', 'Modular Combination Single Door 600mm LH', 'Innosin Lab', 'Modular Cabinet', '600×550×900 mm', 'PC', 'LH', 'Single Door', 0, 'Modular Combination - Single Door 600mm LH', 'Modular combination cabinet with single door 600mm Left Hand', true),
('MOD-COMB-SD-600-RH', 'Modular Combination Single Door 600mm RH', 'Innosin Lab', 'Modular Cabinet', '600×550×900 mm', 'PC', 'RH', 'Single Door', 0, 'Modular Combination - Single Door 600mm RH', 'Modular combination cabinet with single door 600mm Right Hand', true),

-- Open Rack Series
('OR-600-450-180', 'Open Rack 600×450×180', 'Innosin Lab', 'Open Rack', '600×450×180 mm', 'PC', 'None', 'None', 0, 'Open Rack - 600×450×180mm', 'Open rack storage system 600×450×180mm', true),
('OR-600-450-200', 'Open Rack 600×450×200', 'Innosin Lab', 'Open Rack', '600×450×200 mm', 'PC', 'None', 'None', 0, 'Open Rack - 600×450×200mm', 'Open rack storage system 600×450×200mm', true),
('OR-600-450-210', 'Open Rack 600×450×210', 'Innosin Lab', 'Open Rack', '600×450×210 mm', 'PC', 'None', 'None', 0, 'Open Rack - 600×450×210mm', 'Open rack storage system 600×450×210mm', true),
('OR-600-500-180', 'Open Rack 600×500×180', 'Innosin Lab', 'Open Rack', '600×500×180 mm', 'PC', 'None', 'None', 0, 'Open Rack - 600×500×180mm', 'Open rack storage system 600×500×180mm', true),
('OR-600-500-200', 'Open Rack 600×500×200', 'Innosin Lab', 'Open Rack', '600×500×200 mm', 'PC', 'None', 'None', 0, 'Open Rack - 600×500×200mm', 'Open rack storage system 600×500×200mm', true),
('OR-600-500-210', 'Open Rack 600×500×210', 'Innosin Lab', 'Open Rack', '600×500×210 mm', 'PC', 'None', 'None', 0, 'Open Rack - 600×500×210mm', 'Open rack storage system 600×500×210mm', true),
('OR-600-550-180', 'Open Rack 600×550×180', 'Innosin Lab', 'Open Rack', '600×550×180 mm', 'PC', 'None', 'None', 0, 'Open Rack - 600×550×180mm', 'Open rack storage system 600×550×180mm', true),
('OR-600-550-200', 'Open Rack 600×550×200', 'Innosin Lab', 'Open Rack', '600×550×200 mm', 'PC', 'None', 'None', 0, 'Open Rack - 600×550×200mm', 'Open rack storage system 600×550×200mm', true),
('OR-600-550-210', 'Open Rack 600×550×210', 'Innosin Lab', 'Open Rack', '600×550×210 mm', 'PC', 'None', 'None', 0, 'Open Rack - 600×550×210mm', 'Open rack storage system 600×550×210mm', true),

-- Sink Cabinet Series
('SC-DD-120', 'Sink Cabinet Double Door 120mm', 'Innosin Lab', 'Sink Cabinet', '120×550×900 mm', 'PC', 'None', 'Double Door', 0, 'Sink Cabinet - Double Door 120mm', 'Sink cabinet with double door 120mm', true),
('SC-DD-600', 'Sink Cabinet Double Door 600mm', 'Innosin Lab', 'Sink Cabinet', '600×550×900 mm', 'PC', 'None', 'Double Door', 0, 'Sink Cabinet - Double Door 600mm', 'Sink cabinet with double door 600mm', true),
('SC-DD-650', 'Sink Cabinet Double Door 650mm', 'Innosin Lab', 'Sink Cabinet', '650×550×900 mm', 'PC', 'None', 'Double Door', 0, 'Sink Cabinet - Double Door 650mm', 'Sink cabinet with double door 650mm', true),
('SC-DD-750', 'Sink Cabinet Double Door 750mm', 'Innosin Lab', 'Sink Cabinet', '750×550×900 mm', 'PC', 'None', 'Double Door', 0, 'Sink Cabinet - Double Door 750mm', 'Sink cabinet with double door 750mm', true),
('SC-DD-900', 'Sink Cabinet Double Door 900mm', 'Innosin Lab', 'Sink Cabinet', '900×550×900 mm', 'PC', 'None', 'Double Door', 0, 'Sink Cabinet - Double Door 900mm', 'Sink cabinet with double door 900mm', true),
('SC-SD-600-LH', 'Sink Cabinet Single Door 600mm LH', 'Innosin Lab', 'Sink Cabinet', '600×550×900 mm', 'PC', 'LH', 'Single Door', 0, 'Sink Cabinet - Single Door 600mm LH', 'Sink cabinet with single door 600mm Left Hand', true),
('SC-SD-600-RH', 'Sink Cabinet Single Door 600mm RH', 'Innosin Lab', 'Sink Cabinet', '600×550×900 mm', 'PC', 'RH', 'Single Door', 0, 'Sink Cabinet - Single Door 600mm RH', 'Sink cabinet with single door 600mm Right Hand', true),
('SC-SD-650-LH', 'Sink Cabinet Single Door 650mm LH', 'Innosin Lab', 'Sink Cabinet', '650×550×900 mm', 'PC', 'LH', 'Single Door', 0, 'Sink Cabinet - Single Door 650mm LH', 'Sink cabinet with single door 650mm Left Hand', true),
('SC-SD-650-RH', 'Sink Cabinet Single Door 650mm RH', 'Innosin Lab', 'Sink Cabinet', '650×550×900 mm', 'PC', 'RH', 'Single Door', 0, 'Sink Cabinet - Single Door 650mm RH', 'Sink cabinet with single door 650mm Right Hand', true),

-- Tall Cabinet Glass Door Series
('TC-GD-750-400-180', 'Tall Cabinet Glass Door 750×400×180', 'Innosin Lab', 'Tall Cabinet Glass Door', '750×400×180 mm', 'PC', 'None', 'Glass Door', 0, 'Tall Cabinet - Glass Door 750×400×180mm', 'Tall cabinet with glass door 750×400×180mm', true),
('TC-GD-750-400-210', 'Tall Cabinet Glass Door 750×400×210', 'Innosin Lab', 'Tall Cabinet Glass Door', '750×400×210 mm', 'PC', 'None', 'Glass Door', 0, 'Tall Cabinet - Glass Door 750×400×210mm', 'Tall cabinet with glass door 750×400×210mm', true),
('TC-GD-750-450-180', 'Tall Cabinet Glass Door 750×450×180', 'Innosin Lab', 'Tall Cabinet Glass Door', '750×450×180 mm', 'PC', 'None', 'Glass Door', 0, 'Tall Cabinet - Glass Door 750×450×180mm', 'Tall cabinet with glass door 750×450×180mm', true),
('TC-GD-750-450-210', 'Tall Cabinet Glass Door 750×450×210', 'Innosin Lab', 'Tall Cabinet Glass Door', '750×450×210 mm', 'PC', 'None', 'Glass Door', 0, 'Tall Cabinet - Glass Door 750×450×210mm', 'Tall cabinet with glass door 750×450×210mm', true),
('TC-GD-750-500-180', 'Tall Cabinet Glass Door 750×500×180', 'Innosin Lab', 'Tall Cabinet Glass Door', '750×500×180 mm', 'PC', 'None', 'Glass Door', 0, 'Tall Cabinet - Glass Door 750×500×180mm', 'Tall cabinet with glass door 750×500×180mm', true),
('TC-GD-750-500-210', 'Tall Cabinet Glass Door 750×500×210', 'Innosin Lab', 'Tall Cabinet Glass Door', '750×500×210 mm', 'PC', 'None', 'Glass Door', 0, 'Tall Cabinet - Glass Door 750×500×210mm', 'Tall cabinet with glass door 750×500×210mm', true),
('TC-GD-750-550-180', 'Tall Cabinet Glass Door 750×550×180', 'Innosin Lab', 'Tall Cabinet Glass Door', '750×550×180 mm', 'PC', 'None', 'Glass Door', 0, 'Tall Cabinet - Glass Door 750×550×180mm', 'Tall cabinet with glass door 750×550×180mm', true),
('TC-GD-750-550-210', 'Tall Cabinet Glass Door 750×550×210', 'Innosin Lab', 'Tall Cabinet Glass Door', '750×550×210 mm', 'PC', 'None', 'Glass Door', 0, 'Tall Cabinet - Glass Door 750×550×210mm', 'Tall cabinet with glass door 750×550×210mm', true),

-- Tall Cabinet Solid Door Series
('TC-SD-750-400-180', 'Tall Cabinet Solid Door 750×400×180', 'Innosin Lab', 'Tall Cabinet Solid Door', '750×400×180 mm', 'PC', 'None', 'Solid Door', 0, 'Tall Cabinet - Solid Door 750×400×180mm', 'Tall cabinet with solid door 750×400×180mm', true),
('TC-SD-750-400-210', 'Tall Cabinet Solid Door 750×400×210', 'Innosin Lab', 'Tall Cabinet Solid Door', '750×400×210 mm', 'PC', 'None', 'Solid Door', 0, 'Tall Cabinet - Solid Door 750×400×210mm', 'Tall cabinet with solid door 750×400×210mm', true),
('TC-SD-750-450-180', 'Tall Cabinet Solid Door 750×450×180', 'Innosin Lab', 'Tall Cabinet Solid Door', '750×450×180 mm', 'PC', 'None', 'Solid Door', 0, 'Tall Cabinet - Solid Door 750×450×180mm', 'Tall cabinet with solid door 750×450×180mm', true),
('TC-SD-750-450-210', 'Tall Cabinet Solid Door 750×450×210', 'Innosin Lab', 'Tall Cabinet Solid Door', '750×450×210 mm', 'PC', 'None', 'Solid Door', 0, 'Tall Cabinet - Solid Door 750×450×210mm', 'Tall cabinet with solid door 750×450×210mm', true),
('TC-SD-750-500-180', 'Tall Cabinet Solid Door 750×500×180', 'Innosin Lab', 'Tall Cabinet Solid Door', '750×500×180 mm', 'PC', 'None', 'Solid Door', 0, 'Tall Cabinet - Solid Door 750×500×180mm', 'Tall cabinet with solid door 750×500×180mm', true),
('TC-SD-750-500-210', 'Tall Cabinet Solid Door 750×500×210', 'Innosin Lab', 'Tall Cabinet Solid Door', '750×500×210 mm', 'PC', 'None', 'Solid Door', 0, 'Tall Cabinet - Solid Door 750×500×210mm', 'Tall cabinet with solid door 750×500×210mm', true),
('TC-SD-750-550-180', 'Tall Cabinet Solid Door 750×550×180', 'Innosin Lab', 'Tall Cabinet Solid Door', '750×550×180 mm', 'PC', 'None', 'Solid Door', 0, 'Tall Cabinet - Solid Door 750×550×180mm', 'Tall cabinet with solid door 750×550×180mm', true),
('TC-SD-750-550-210', 'Tall Cabinet Solid Door 750×550×210', 'Innosin Lab', 'Tall Cabinet Solid Door', '750×550×210 mm', 'PC', 'None', 'Solid Door', 0, 'Tall Cabinet - Solid Door 750×550×210mm', 'Tall cabinet with solid door 750×550×210mm', true),

-- Wall Cabinet Glass Series
('WC-G-DD-750', 'Wall Cabinet Glass Double Door 750mm', 'Innosin Lab', 'Wall Cabinet Glass', '750×330×750 mm', 'PC', 'None', 'Double Door', 0, 'Wall Cabinet Glass - Double Door 750mm', 'Wall cabinet with glass double door 750mm', true),
('WC-G-DD-800', 'Wall Cabinet Glass Double Door 800mm', 'Innosin Lab', 'Wall Cabinet Glass', '800×330×750 mm', 'PC', 'None', 'Double Door', 0, 'Wall Cabinet Glass - Double Door 800mm', 'Wall cabinet with glass double door 800mm', true),
('WC-G-DD-900', 'Wall Cabinet Glass Double Door 900mm', 'Innosin Lab', 'Wall Cabinet Glass', '900×330×750 mm', 'PC', 'None', 'Double Door', 0, 'Wall Cabinet Glass - Double Door 900mm', 'Wall cabinet with glass double door 900mm', true),
('WC-G-SD-450-LH', 'Wall Cabinet Glass Single Door 450mm LH', 'Innosin Lab', 'Wall Cabinet Glass', '450×330×750 mm', 'PC', 'LH', 'Single Door', 0, 'Wall Cabinet Glass - Single Door 450mm LH', 'Wall cabinet with glass single door 450mm Left Hand', true),
('WC-G-SD-450-RH', 'Wall Cabinet Glass Single Door 450mm RH', 'Innosin Lab', 'Wall Cabinet Glass', '450×330×750 mm', 'PC', 'RH', 'Single Door', 0, 'Wall Cabinet Glass - Single Door 450mm RH', 'Wall cabinet with glass single door 450mm Right Hand', true),
('WC-G-SD-500-LH', 'Wall Cabinet Glass Single Door 500mm LH', 'Innosin Lab', 'Wall Cabinet Glass', '500×330×750 mm', 'PC', 'LH', 'Single Door', 0, 'Wall Cabinet Glass - Single Door 500mm LH', 'Wall cabinet with glass single door 500mm Left Hand', true),
('WC-G-SD-500-RH', 'Wall Cabinet Glass Single Door 500mm RH', 'Innosin Lab', 'Wall Cabinet Glass', '500×330×750 mm', 'PC', 'RH', 'Single Door', 0, 'Wall Cabinet Glass - Single Door 500mm RH', 'Wall cabinet with glass single door 500mm Right Hand', true),
('WC-G-SD-550-LH', 'Wall Cabinet Glass Single Door 550mm LH', 'Innosin Lab', 'Wall Cabinet Glass', '550×330×750 mm', 'PC', 'LH', 'Single Door', 0, 'Wall Cabinet Glass - Single Door 550mm LH', 'Wall cabinet with glass single door 550mm Left Hand', true),
('WC-G-SD-550-RH', 'Wall Cabinet Glass Single Door 550mm RH', 'Innosin Lab', 'Wall Cabinet Glass', '550×330×750 mm', 'PC', 'RH', 'Single Door', 0, 'Wall Cabinet Glass - Single Door 550mm RH', 'Wall cabinet with glass single door 550mm Right Hand', true),
('WC-G-SD-600-LH', 'Wall Cabinet Glass Single Door 600mm LH', 'Innosin Lab', 'Wall Cabinet Glass', '600×330×750 mm', 'PC', 'LH', 'Single Door', 0, 'Wall Cabinet Glass - Single Door 600mm LH', 'Wall cabinet with glass single door 600mm Left Hand', true),
('WC-G-SD-600-RH', 'Wall Cabinet Glass Single Door 600mm RH', 'Innosin Lab', 'Wall Cabinet Glass', '600×330×750 mm', 'PC', 'RH', 'Single Door', 0, 'Wall Cabinet Glass - Single Door 600mm RH', 'Wall cabinet with glass single door 600mm Right Hand', true),

-- Wall Cabinet Solid Series
('WC-S-DD-750', 'Wall Cabinet Solid Double Door 750mm', 'Innosin Lab', 'Wall Cabinet Solid', '750×330×750 mm', 'PC', 'None', 'Double Door', 0, 'Wall Cabinet Solid - Double Door 750mm', 'Wall cabinet with solid double door 750mm', true),
('WC-S-DD-800', 'Wall Cabinet Solid Double Door 800mm', 'Innosin Lab', 'Wall Cabinet Solid', '800×330×750 mm', 'PC', 'None', 'Double Door', 0, 'Wall Cabinet Solid - Double Door 800mm', 'Wall cabinet with solid double door 800mm', true),
('WC-S-DD-900', 'Wall Cabinet Solid Double Door 900mm', 'Innosin Lab', 'Wall Cabinet Solid', '900×330×750 mm', 'PC', 'None', 'Double Door', 0, 'Wall Cabinet Solid - Double Door 900mm', 'Wall cabinet with solid double door 900mm', true),
('WC-S-SD-450-LH', 'Wall Cabinet Solid Single Door 450mm LH', 'Innosin Lab', 'Wall Cabinet Solid', '450×330×750 mm', 'PC', 'LH', 'Single Door', 0, 'Wall Cabinet Solid - Single Door 450mm LH', 'Wall cabinet with solid single door 450mm Left Hand', true),
('WC-S-SD-450-RH', 'Wall Cabinet Solid Single Door 450mm RH', 'Innosin Lab', 'Wall Cabinet Solid', '450×330×750 mm', 'PC', 'RH', 'Single Door', 0, 'Wall Cabinet Solid - Single Door 450mm RH', 'Wall cabinet with solid single door 450mm Right Hand', true),
('WC-S-SD-500-LH', 'Wall Cabinet Solid Single Door 500mm LH', 'Innosin Lab', 'Wall Cabinet Solid', '500×330×750 mm', 'PC', 'LH', 'Single Door', 0, 'Wall Cabinet Solid - Single Door 500mm LH', 'Wall cabinet with solid single door 500mm Left Hand', true),
('WC-S-SD-500-RH', 'Wall Cabinet Solid Single Door 500mm RH', 'Innosin Lab', 'Wall Cabinet Solid', '500×330×750 mm', 'PC', 'RH', 'Single Door', 0, 'Wall Cabinet Solid - Single Door 500mm RH', 'Wall cabinet with solid single door 500mm Right Hand', true),
('WC-S-SD-550-LH', 'Wall Cabinet Solid Single Door 550mm LH', 'Innosin Lab', 'Wall Cabinet Solid', '550×330×750 mm', 'PC', 'LH', 'Single Door', 0, 'Wall Cabinet Solid - Single Door 550mm LH', 'Wall cabinet with solid single door 550mm Left Hand', true),
('WC-S-SD-550-RH', 'Wall Cabinet Solid Single Door 550mm RH', 'Innosin Lab', 'Wall Cabinet Solid', '550×330×750 mm', 'PC', 'RH', 'Single Door', 0, 'Wall Cabinet Solid - Single Door 550mm RH', 'Wall cabinet with solid single door 550mm Right Hand', true),
('WC-S-SD-600-LH', 'Wall Cabinet Solid Single Door 600mm LH', 'Innosin Lab', 'Wall Cabinet Solid', '600×330×750 mm', 'PC', 'LH', 'Single Door', 0, 'Wall Cabinet Solid - Single Door 600mm LH', 'Wall cabinet with solid single door 600mm Left Hand', true),
('WC-S-SD-600-RH', 'Wall Cabinet Solid Single Door 600mm RH', 'Innosin Lab', 'Wall Cabinet Solid', '600×330×750 mm', 'PC', 'RH', 'Single Door', 0, 'Wall Cabinet Solid - Single Door 600mm RH', 'Wall cabinet with solid single door 600mm Right Hand', true);
