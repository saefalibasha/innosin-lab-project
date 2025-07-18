
-- Add all missing Mobile Cabinet 900mm variants
INSERT INTO public.products (product_code, name, category, product_series, finish_type, orientation, door_type, dimensions, editable_title, editable_description, is_active) VALUES
-- Mobile Cabinet 900mm - Double Door variants
('MC-PC-755080', 'Mobile Cabinet Series for 900mm Bench', 'Innosin Lab', 'Mobile Cabinet', 'PC', 'None', 'Double Door', '750×500×800 mm', 'Mobile Cabinet - Double Door (PC)', 'Double door mobile cabinet for 900mm bench height', true),
('MC-SS-755080', 'Mobile Cabinet Series for 900mm Bench', 'Innosin Lab', 'Mobile Cabinet', 'SS', 'None', 'Double Door', '750×500×800 mm', 'Mobile Cabinet - Double Door (SS)', 'Double door mobile cabinet for 900mm bench height - Stainless Steel', true),

-- Mobile Cabinet 900mm - Single Door LH/RH variants
('MC-PC-LH-505080', 'Mobile Cabinet Series for 900mm Bench', 'Innosin Lab', 'Mobile Cabinet', 'PC', 'LH', 'Single Door', '500×500×800 mm', 'Mobile Cabinet - Single Door LH (PC)', 'Left hand single door mobile cabinet for 900mm bench height', true),
('MC-PC-RH-505080', 'Mobile Cabinet Series for 900mm Bench', 'Innosin Lab', 'Mobile Cabinet', 'PC', 'RH', 'Single Door', '500×500×800 mm', 'Mobile Cabinet - Single Door RH (PC)', 'Right hand single door mobile cabinet for 900mm bench height', true),
('MC-SS-LH-505080', 'Mobile Cabinet Series for 900mm Bench', 'Innosin Lab', 'Mobile Cabinet', 'SS', 'LH', 'Single Door', '500×500×800 mm', 'Mobile Cabinet - Single Door LH (SS)', 'Left hand single door mobile cabinet for 900mm bench height - Stainless Steel', true),
('MC-SS-RH-505080', 'Mobile Cabinet Series for 900mm Bench', 'Innosin Lab', 'Mobile Cabinet', 'SS', 'RH', 'Single Door', '500×500×800 mm', 'Mobile Cabinet - Single Door RH (SS)', 'Right hand single door mobile cabinet for 900mm bench height - Stainless Steel', true),

-- Mobile Cabinet 900mm - Missing drawer variants
('MC-PC-DWR2-905080', 'Mobile Cabinet Series for 900mm Bench', 'Innosin Lab', 'Mobile Cabinet', 'PC', 'None', 'Drawer', '900×500×800 mm', 'Mobile Cabinet - 2 Drawers (PC)', '2 drawer mobile cabinet for 900mm bench height', true),
('MC-SS-DWR2-905080', 'Mobile Cabinet Series for 900mm Bench', 'Innosin Lab', 'Mobile Cabinet', 'SS', 'None', 'Drawer', '900×500×800 mm', 'Mobile Cabinet - 2 Drawers (SS)', '2 drawer mobile cabinet for 900mm bench height - Stainless Steel', true);

-- Add missing SS finishes for existing Mobile Cabinet variants
INSERT INTO public.products (product_code, name, category, product_series, finish_type, orientation, door_type, drawer_count, dimensions, editable_title, editable_description, is_active) VALUES
-- 750mm variants with SS finish
('MC-SS-755065', 'Mobile Cabinet Series for 750mm Bench', 'Innosin Lab', 'Mobile Cabinet', 'SS', 'None', 'Single Door', 0, '750×500×650 mm', 'Mobile Cabinet - Single Door (SS)', 'Single door mobile cabinet for 750mm bench height - Stainless Steel', true),
('MC-SS-LH-505065', 'Mobile Cabinet Series for 750mm Bench', 'Innosin Lab', 'Mobile Cabinet', 'SS', 'LH', 'Single Door', 0, '500×500×650 mm', 'Mobile Cabinet - Single Door LH (SS)', 'Left hand single door mobile cabinet for 750mm bench height - Stainless Steel', true),
('MC-SS-RH-505065', 'Mobile Cabinet Series for 750mm Bench', 'Innosin Lab', 'Mobile Cabinet', 'SS', 'RH', 'Single Door', 0, '500×500×650 mm', 'Mobile Cabinet - Single Door RH (SS)', 'Right hand single door mobile cabinet for 750mm bench height - Stainless Steel', true),
('MC-SS-DWR3-505065', 'Mobile Cabinet Series for 750mm Bench', 'Innosin Lab', 'Mobile Cabinet', 'SS', 'None', 'Drawer', 3, '500×500×650 mm', 'Mobile Cabinet - 3 Drawers (SS)', '3 drawer mobile cabinet for 750mm bench height - Stainless Steel', true),

-- 900mm drawer variants with SS finish
('MC-SS-DWR3-505080', 'Mobile Cabinet Series for 900mm Bench', 'Innosin Lab', 'Mobile Cabinet', 'SS', 'None', 'Drawer', 3, '500×500×800 mm', 'Mobile Cabinet - 3 Drawers (SS)', '3 drawer mobile cabinet for 900mm bench height - Stainless Steel', true),
('MC-SS-DWR4-505080', 'Mobile Cabinet Series for 900mm Bench', 'Innosin Lab', 'Mobile Cabinet', 'SS', 'None', 'Drawer', 4, '500×500×800 mm', 'Mobile Cabinet - 4 Drawers (SS)', '4 drawer mobile cabinet for 900mm bench height - Stainless Steel', true),
('MC-SS-DWR6-905080', 'Mobile Cabinet Series for 900mm Bench', 'Innosin Lab', 'Mobile Cabinet', 'SS', 'None', 'Drawer', 6, '900×500×800 mm', 'Mobile Cabinet - 6 Drawers (SS)', '6 drawer mobile cabinet for 900mm bench height - Stainless Steel', true),
('MC-SS-DWR8-905080', 'Mobile Cabinet Series for 900mm Bench', 'Innosin Lab', 'Mobile Cabinet', 'SS', 'None', 'Drawer', 8, '900×500×800 mm', 'Mobile Cabinet - 8 Drawers (SS)', '8 drawer mobile cabinet for 900mm bench height - Stainless Steel', true);

-- Add Modular Cabinet comprehensive series
INSERT INTO public.products (product_code, name, category, product_series, finish_type, orientation, door_type, drawer_count, dimensions, editable_title, editable_description, is_active) VALUES
-- Modular Double Door variants
('MDC-PC-1005590', 'Modular Double Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'None', 'Double Door', 0, '1000×550×900 mm', 'Modular Cabinet - Double Door 1000mm (PC)', '1000mm double door modular cabinet', true),
('MDC-SS-1005590', 'Modular Double Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'None', 'Double Door', 0, '1000×550×900 mm', 'Modular Cabinet - Double Door 1000mm (SS)', '1000mm double door modular cabinet - Stainless Steel', true),
('MDC-PC-1205590', 'Modular Double Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'None', 'Double Door', 0, '1200×550×900 mm', 'Modular Cabinet - Double Door 1200mm (PC)', '1200mm double door modular cabinet', true),
('MDC-SS-1205590', 'Modular Double Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'None', 'Double Door', 0, '1200×550×900 mm', 'Modular Cabinet - Double Door 1200mm (SS)', '1200mm double door modular cabinet - Stainless Steel', true),

-- Modular Single Door variants (missing sizes)
('MSC-PC-LH-4505590', 'Modular Single Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'LH', 'Single Door', 0, '450×550×900 mm', 'Modular Cabinet - Single Door 450mm LH (PC)', '450mm left hand single door modular cabinet', true),
('MSC-PC-RH-4505590', 'Modular Single Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'RH', 'Single Door', 0, '450×550×900 mm', 'Modular Cabinet - Single Door 450mm RH (PC)', '450mm right hand single door modular cabinet', true),
('MSC-SS-LH-4505590', 'Modular Single Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'LH', 'Single Door', 0, '450×550×900 mm', 'Modular Cabinet - Single Door 450mm LH (SS)', '450mm left hand single door modular cabinet - Stainless Steel', true),
('MSC-SS-RH-4505590', 'Modular Single Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'RH', 'Single Door', 0, '450×550×900 mm', 'Modular Cabinet - Single Door 450mm RH (SS)', '450mm right hand single door modular cabinet - Stainless Steel', true),

('MSC-PC-LH-5505590', 'Modular Single Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'LH', 'Single Door', 0, '550×550×900 mm', 'Modular Cabinet - Single Door 550mm LH (PC)', '550mm left hand single door modular cabinet', true),
('MSC-PC-RH-5505590', 'Modular Single Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'RH', 'Single Door', 0, '550×550×900 mm', 'Modular Cabinet - Single Door 550mm RH (PC)', '550mm right hand single door modular cabinet', true),
('MSC-SS-LH-5505590', 'Modular Single Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'LH', 'Single Door', 0, '550×550×900 mm', 'Modular Cabinet - Single Door 550mm LH (SS)', '550mm left hand single door modular cabinet - Stainless Steel', true),
('MSC-SS-RH-5505590', 'Modular Single Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'RH', 'Single Door', 0, '550×550×900 mm', 'Modular Cabinet - Single Door 550mm RH (SS)', '550mm right hand single door modular cabinet - Stainless Steel', true),

('MSC-PC-LH-6005590', 'Modular Single Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'LH', 'Single Door', 0, '600×550×900 mm', 'Modular Cabinet - Single Door 600mm LH (PC)', '600mm left hand single door modular cabinet', true),
('MSC-PC-RH-6005590', 'Modular Single Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'RH', 'Single Door', 0, '600×550×900 mm', 'Modular Cabinet - Single Door 600mm RH (PC)', '600mm right hand single door modular cabinet', true),
('MSC-SS-LH-6005590', 'Modular Single Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'LH', 'Single Door', 0, '600×550×900 mm', 'Modular Cabinet - Single Door 600mm LH (SS)', '600mm left hand single door modular cabinet - Stainless Steel', true),
('MSC-SS-RH-6005590', 'Modular Single Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'RH', 'Single Door', 0, '600×550×900 mm', 'Modular Cabinet - Single Door 600mm RH (SS)', '600mm right hand single door modular cabinet - Stainless Steel', true),

('MSC-PC-LH-6505590', 'Modular Single Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'LH', 'Single Door', 0, '650×550×900 mm', 'Modular Cabinet - Single Door 650mm LH (PC)', '650mm left hand single door modular cabinet', true),
('MSC-PC-RH-6505590', 'Modular Single Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'RH', 'Single Door', 0, '650×550×900 mm', 'Modular Cabinet - Single Door 650mm RH (PC)', '650mm right hand single door modular cabinet', true),
('MSC-SS-LH-6505590', 'Modular Single Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'LH', 'Single Door', 0, '650×550×900 mm', 'Modular Cabinet - Single Door 650mm LH (SS)', '650mm left hand single door modular cabinet - Stainless Steel', true),
('MSC-SS-RH-6505590', 'Modular Single Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'RH', 'Single Door', 0, '650×550×900 mm', 'Modular Cabinet - Single Door 650mm RH (SS)', '650mm right hand single door modular cabinet - Stainless Steel', true);

-- Add Modular Drawer Cabinets (comprehensive range)
INSERT INTO public.products (product_code, name, category, product_series, finish_type, orientation, door_type, drawer_count, dimensions, editable_title, editable_description, is_active) VALUES
('MDR-PC-4-5005590', 'Modular Drawer Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'None', 'Drawer', 4, '500×550×900 mm', 'Modular Cabinet - 4 Drawers 500mm (PC)', '500mm modular cabinet with 4 drawers', true),
('MDR-SS-4-5005590', 'Modular Drawer Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'None', 'Drawer', 4, '500×550×900 mm', 'Modular Cabinet - 4 Drawers 500mm (SS)', '500mm modular cabinet with 4 drawers - Stainless Steel', true),
('MDR-PC-4-5505590', 'Modular Drawer Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'None', 'Drawer', 4, '550×550×900 mm', 'Modular Cabinet - 4 Drawers 550mm (PC)', '550mm modular cabinet with 4 drawers', true),
('MDR-SS-4-5505590', 'Modular Drawer Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'None', 'Drawer', 4, '550×550×900 mm', 'Modular Cabinet - 4 Drawers 550mm (SS)', '550mm modular cabinet with 4 drawers - Stainless Steel', true),
('MDR-PC-4-6005590', 'Modular Drawer Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'None', 'Drawer', 4, '600×550×900 mm', 'Modular Cabinet - 4 Drawers 600mm (PC)', '600mm modular cabinet with 4 drawers', true),
('MDR-SS-4-6005590', 'Modular Drawer Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'None', 'Drawer', 4, '600×550×900 mm', 'Modular Cabinet - 4 Drawers 600mm (SS)', '600mm modular cabinet with 4 drawers - Stainless Steel', true),

('MDR-PC-3-7505590', 'Modular Drawer Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'None', 'Drawer', 3, '750×550×900 mm', 'Modular Cabinet - 3 Drawers 750mm (PC)', '750mm modular cabinet with 3 drawers', true),
('MDR-SS-3-7505590', 'Modular Drawer Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'None', 'Drawer', 3, '750×550×900 mm', 'Modular Cabinet - 3 Drawers 750mm (SS)', '750mm modular cabinet with 3 drawers - Stainless Steel', true),
('MDR-PC-4-7505590', 'Modular Drawer Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'None', 'Drawer', 4, '750×550×900 mm', 'Modular Cabinet - 4 Drawers 750mm (PC)', '750mm modular cabinet with 4 drawers', true),
('MDR-SS-4-7505590', 'Modular Drawer Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'None', 'Drawer', 4, '750×550×900 mm', 'Modular Cabinet - 4 Drawers 750mm (SS)', '750mm modular cabinet with 4 drawers - Stainless Steel', true),

('MDR-PC-3-9005590', 'Modular Drawer Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'None', 'Drawer', 3, '900×550×900 mm', 'Modular Cabinet - 3 Drawers 900mm (PC)', '900mm modular cabinet with 3 drawers', true),
('MDR-SS-3-9005590', 'Modular Drawer Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'None', 'Drawer', 3, '900×550×900 mm', 'Modular Cabinet - 3 Drawers 900mm (SS)', '900mm modular cabinet with 3 drawers - Stainless Steel', true),
('MDR-PC-4-9005590', 'Modular Drawer Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'None', 'Drawer', 4, '900×550×900 mm', 'Modular Cabinet - 4 Drawers 900mm (PC)', '900mm modular cabinet with 4 drawers', true),
('MDR-SS-4-9005590', 'Modular Drawer Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'None', 'Drawer', 4, '900×550×900 mm', 'Modular Cabinet - 4 Drawers 900mm (SS)', '900mm modular cabinet with 4 drawers - Stainless Steel', true),
('MDR-PC-6-9005590', 'Modular Drawer Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'None', 'Drawer', 6, '900×550×900 mm', 'Modular Cabinet - 6 Drawers 900mm (PC)', '900mm modular cabinet with 6 drawers', true),
('MDR-SS-6-9005590', 'Modular Drawer Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'None', 'Drawer', 6, '900×550×900 mm', 'Modular Cabinet - 6 Drawers 900mm (SS)', '900mm modular cabinet with 6 drawers - Stainless Steel', true),
('MDR-PC-8-9005590', 'Modular Drawer Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'None', 'Drawer', 8, '900×550×900 mm', 'Modular Cabinet - 8 Drawers 900mm (PC)', '900mm modular cabinet with 8 drawers', true),
('MDR-SS-8-9005590', 'Modular Drawer Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'None', 'Drawer', 8, '900×550×900 mm', 'Modular Cabinet - 8 Drawers 900mm (SS)', '900mm modular cabinet with 8 drawers - Stainless Steel', true);

-- Add Modular Three Door Cabinet
INSERT INTO public.products (product_code, name, category, product_series, finish_type, orientation, door_type, dimensions, editable_title, editable_description, is_active) VALUES
('MTC-PC-1205590', 'Modular Three Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'PC', 'None', 'Triple Door', '1200×550×900 mm', 'Modular Cabinet - Three Doors 1200mm (PC)', '1200mm modular cabinet with three doors', true),
('MTC-SS-1205590', 'Modular Three Door Cabinet', 'Innosin Lab', 'Modular Cabinet', 'SS', 'None', 'Triple Door', '1200×550×900 mm', 'Modular Cabinet - Three Doors 1200mm (SS)', '1200mm modular cabinet with three doors - Stainless Steel', true);

-- Add comprehensive Open Rack variants
INSERT INTO public.products (product_code, name, category, product_series, finish_type, orientation, door_type, dimensions, editable_title, editable_description, is_active) VALUES
-- 600×450 variants
('OR-PC-6045180', 'Open Rack Series', 'Innosin Lab', 'Open Rack', 'PC', 'None', 'Open', '600×450×1800 mm', 'Open Rack 600×450×1800 (PC)', 'Open rack with 600mm width, 450mm depth, 1800mm height', true),
('OR-SS-6045180', 'Open Rack Series', 'Innosin Lab', 'Open Rack', 'SS', 'None', 'Open', '600×450×1800 mm', 'Open Rack 600×450×1800 (SS)', 'Open rack with 600mm width, 450mm depth, 1800mm height - Stainless Steel', true),
('OR-PC-6045200', 'Open Rack Series', 'Innosin Lab', 'Open Rack', 'PC', 'None', 'Open', '600×450×2000 mm', 'Open Rack 600×450×2000 (PC)', 'Open rack with 600mm width, 450mm depth, 2000mm height', true),
('OR-SS-6045200', 'Open Rack Series', 'Innosin Lab', 'Open Rack', 'SS', 'None', 'Open', '600×450×2000 mm', 'Open Rack 600×450×2000 (SS)', 'Open rack with 600mm width, 450mm depth, 2000mm height - Stainless Steel', true),
('OR-PC-6045210', 'Open Rack Series', 'Innosin Lab', 'Open Rack', 'PC', 'None', 'Open', '600×450×2100 mm', 'Open Rack 600×450×2100 (PC)', 'Open rack with 600mm width, 450mm depth, 2100mm height', true),
('OR-SS-6045210', 'Open Rack Series', 'Innosin Lab', 'Open Rack', 'SS', 'None', 'Open', '600×450×2100 mm', 'Open Rack 600×450×2100 (SS)', 'Open rack with 600mm width, 450mm depth, 2100mm height - Stainless Steel', true),

-- 600×500 variants
('OR-PC-6050180', 'Open Rack Series', 'Innosin Lab', 'Open Rack', 'PC', 'None', 'Open', '600×500×1800 mm', 'Open Rack 600×500×1800 (PC)', 'Open rack with 600mm width, 500mm depth, 1800mm height', true),
('OR-SS-6050180', 'Open Rack Series', 'Innosin Lab', 'Open Rack', 'SS', 'None', 'Open', '600×500×1800 mm', 'Open Rack 600×500×1800 (SS)', 'Open rack with 600mm width, 500mm depth, 1800mm height - Stainless Steel', true),
('OR-PC-6050200', 'Open Rack Series', 'Innosin Lab', 'Open Rack', 'PC', 'None', 'Open', '600×500×2000 mm', 'Open Rack 600×500×2000 (PC)', 'Open rack with 600mm width, 500mm depth, 2000mm height', true),
('OR-SS-6050200', 'Open Rack Series', 'Innosin Lab', 'Open Rack', 'SS', 'None', 'Open', '600×500×2000 mm', 'Open Rack 600×500×2000 (SS)', 'Open rack with 600mm width, 500mm depth, 2000mm height - Stainless Steel', true),
('OR-PC-6050210', 'Open Rack Series', 'Innosin Lab', 'Open Rack', 'PC', 'None', 'Open', '600×500×2100 mm', 'Open Rack 600×500×2100 (PC)', 'Open rack with 600mm width, 500mm depth, 2100mm height', true),
('OR-SS-6050210', 'Open Rack Series', 'Innosin Lab', 'Open Rack', 'SS', 'None', 'Open', '600×500×2100 mm', 'Open Rack 600×500×2100 (SS)', 'Open rack with 600mm width, 500mm depth, 2100mm height - Stainless Steel', true),

-- 600×550 variants
('OR-PC-6055180', 'Open Rack Series', 'Innosin Lab', 'Open Rack', 'PC', 'None', 'Open', '600×550×1800 mm', 'Open Rack 600×550×1800 (PC)', 'Open rack with 600mm width, 550mm depth, 1800mm height', true),
('OR-SS-6055180', 'Open Rack Series', 'Innosin Lab', 'Open Rack', 'SS', 'None', 'Open', '600×550×1800 mm', 'Open Rack 600×550×1800 (SS)', 'Open rack with 600mm width, 550mm depth, 1800mm height - Stainless Steel', true),
('OR-PC-6055200', 'Open Rack Series', 'Innosin Lab', 'Open Rack', 'PC', 'None', 'Open', '600×550×2000 mm', 'Open Rack 600×550×2000 (PC)', 'Open rack with 600mm width, 550mm depth, 2000mm height', true),
('OR-SS-6055200', 'Open Rack Series', 'Innosin Lab', 'Open Rack', 'SS', 'None', 'Open', '600×550×2000 mm', 'Open Rack 600×550×2000 (SS)', 'Open rack with 600mm width, 550mm depth, 2000mm height - Stainless Steel', true),
('OR-PC-6055210', 'Open Rack Series', 'Innosin Lab', 'Open Rack', 'PC', 'None', 'Open', '600×550×2100 mm', 'Open Rack 600×550×2100 (PC)', 'Open rack with 600mm width, 550mm depth, 2100mm height', true),
('OR-SS-6055210', 'Open Rack Series', 'Innosin Lab', 'Open Rack', 'SS', 'None', 'Open', '600×550×2100 mm', 'Open Rack 600×550×2100 (SS)', 'Open rack with 600mm width, 550mm depth, 2100mm height - Stainless Steel', true);

-- Add comprehensive Wall Cabinet variants
INSERT INTO public.products (product_code, name, category, product_series, finish_type, orientation, door_type, dimensions, editable_title, editable_description, is_active) VALUES
-- Wall Cabinet Glass - Double Door variants (missing sizes)
('WCG-PC-8033075', 'Wall Cabinet Glass Series', 'Innosin Lab', 'Wall Cabinet', 'PC', 'None', 'Double Door', '800×330×750 mm', 'Wall Cabinet Glass - Double Door 800mm (PC)', '800mm double door glass wall cabinet', true),
('WCG-SS-8033075', 'Wall Cabinet Glass Series', 'Innosin Lab', 'Wall Cabinet', 'SS', 'None', 'Double Door', '800×330×750 mm', 'Wall Cabinet Glass - Double Door 800mm (SS)', '800mm double door glass wall cabinet - Stainless Steel', true),
('WCG-PC-9033075', 'Wall Cabinet Glass Series', 'Innosin Lab', 'Wall Cabinet', 'PC', 'None', 'Double Door', '900×330×750 mm', 'Wall Cabinet Glass - Double Door 900mm (PC)', '900mm double door glass wall cabinet', true),
('WCG-SS-9033075', 'Wall Cabinet Glass Series', 'Innosin Lab', 'Wall Cabinet', 'SS', 'None', 'Double Door', '900×330×750 mm', 'Wall Cabinet Glass - Double Door 900mm (SS)', '900mm double door glass wall cabinet - Stainless Steel', true),

-- Wall Cabinet Glass - Single Door variants (missing sizes and orientations)
('WCG-PC-LH-5533075', 'Wall Cabinet Glass Series', 'Innosin Lab', 'Wall Cabinet', 'PC', 'LH', 'Single Door', '550×330×750 mm', 'Wall Cabinet Glass - Single Door 550mm LH (PC)', '550mm left hand single door glass wall cabinet', true),
('WCG-PC-RH-5533075', 'Wall Cabinet Glass Series', 'Innosin Lab', 'Wall Cabinet', 'PC', 'RH', 'Single Door', '550×330×750 mm', 'Wall Cabinet Glass - Single Door 550mm RH (PC)', '550mm right hand single door glass wall cabinet', true),
('WCG-SS-LH-5533075', 'Wall Cabinet Glass Series', 'Innosin Lab', 'Wall Cabinet', 'SS', 'LH', 'Single Door', '550×330×750 mm', 'Wall Cabinet Glass - Single Door 550mm LH (SS)', '550mm left hand single door glass wall cabinet - Stainless Steel', true),
('WCG-SS-RH-5533075', 'Wall Cabinet Glass Series', 'Innosin Lab', 'Wall Cabinet', 'SS', 'RH', 'Single Door', '550×330×750 mm', 'Wall Cabinet Glass - Single Door 550mm RH (SS)', '550mm right hand single door glass wall cabinet - Stainless Steel', true),

('WCG-PC-LH-6033075', 'Wall Cabinet Glass Series', 'Innosin Lab', 'Wall Cabinet', 'PC', 'LH', 'Single Door', '600×330×750 mm', 'Wall Cabinet Glass - Single Door 600mm LH (PC)', '600mm left hand single door glass wall cabinet', true),
('WCG-PC-RH-6033075', 'Wall Cabinet Glass Series', 'Innosin Lab', 'Wall Cabinet', 'PC', 'RH', 'Single Door', '600×330×750 mm', 'Wall Cabinet Glass - Single Door 600mm RH (PC)', '600mm right hand single door glass wall cabinet', true),
('WCG-SS-LH-6033075', 'Wall Cabinet Glass Series', 'Innosin Lab', 'Wall Cabinet', 'SS', 'LH', 'Single Door', '600×330×750 mm', 'Wall Cabinet Glass - Single Door 600mm LH (SS)', '600mm left hand single door glass wall cabinet - Stainless Steel', true),
('WCG-SS-RH-6033075', 'Wall Cabinet Glass Series', 'Innosin Lab', 'Wall Cabinet', 'SS', 'RH', 'Single Door', '600×330×750 mm', 'Wall Cabinet Glass - Single Door 600mm RH (SS)', '600mm right hand single door glass wall cabinet - Stainless Steel', true);

-- Add comprehensive Sink Cabinet variants
INSERT INTO public.products (product_code, name, category, product_series, finish_type, orientation, door_type, dimensions, editable_title, editable_description, is_active) VALUES
-- Sink Cabinet Double Door variants (missing sizes)
('SC-PC-6005590', 'Sink Cabinet Series', 'Innosin Lab', 'Sink Cabinet', 'PC', 'None', 'Double Door', '600×550×900 mm', 'Sink Cabinet - Double Door 600mm (PC)', '600mm double door sink cabinet', true),
('SC-SS-6005590', 'Sink Cabinet Series', 'Innosin Lab', 'Sink Cabinet', 'SS', 'None', 'Double Door', '600×550×900 mm', 'Sink Cabinet - Double Door 600mm (SS)', '600mm double door sink cabinet - Stainless Steel', true),
('SC-PC-6505590', 'Sink Cabinet Series', 'Innosin Lab', 'Sink Cabinet', 'PC', 'None', 'Double Door', '650×550×900 mm', 'Sink Cabinet - Double Door 650mm (PC)', '650mm double door sink cabinet', true),
('SC-SS-6505590', 'Sink Cabinet Series', 'Innosin Lab', 'Sink Cabinet', 'SS', 'None', 'Double Door', '650×550×900 mm', 'Sink Cabinet - Double Door 650mm (SS)', '650mm double door sink cabinet - Stainless Steel', true),
('SC-PC-9005590', 'Sink Cabinet Series', 'Innosin Lab', 'Sink Cabinet', 'PC', 'None', 'Double Door', '900×550×900 mm', 'Sink Cabinet - Double Door 900mm (PC)', '900mm double door sink cabinet', true),
('SC-SS-9005590', 'Sink Cabinet Series', 'Innosin Lab', 'Sink Cabinet', 'SS', 'None', 'Double Door', '900×550×900 mm', 'Sink Cabinet - Double Door 900mm (SS)', '900mm double door sink cabinet - Stainless Steel', true),

-- Sink Cabinet Single Door variants (missing orientations and SS finishes)
('SC-PC-LH-6505590', 'Sink Cabinet Series', 'Innosin Lab', 'Sink Cabinet', 'PC', 'LH', 'Single Door', '650×550×900 mm', 'Sink Cabinet - Single Door 650mm LH (PC)', '650mm left hand single door sink cabinet', true),
('SC-PC-RH-6505590', 'Sink Cabinet Series', 'Innosin Lab', 'Sink Cabinet', 'PC', 'RH', 'Single Door', '650×550×900 mm', 'Sink Cabinet - Single Door 650mm RH (PC)', '650mm right hand single door sink cabinet', true),
('SC-SS-LH-6005590', 'Sink Cabinet Series', 'Innosin Lab', 'Sink Cabinet', 'SS', 'LH', 'Single Door', '600×550×900 mm', 'Sink Cabinet - Single Door 600mm LH (SS)', '600mm left hand single door sink cabinet - Stainless Steel', true),
('SC-SS-RH-6005590', 'Sink Cabinet Series', 'Innosin Lab', 'Sink Cabinet', 'SS', 'RH', 'Single Door', '600×550×900 mm', 'Sink Cabinet - Single Door 600mm RH (SS)', '600mm right hand single door sink cabinet - Stainless Steel', true),
('SC-SS-LH-6505590', 'Sink Cabinet Series', 'Innosin Lab', 'Sink Cabinet', 'SS', 'LH', 'Single Door', '650×550×900 mm', 'Sink Cabinet - Single Door 650mm LH (SS)', '650mm left hand single door sink cabinet - Stainless Steel', true),
('SC-SS-RH-6505590', 'Sink Cabinet Series', 'Innosin Lab', 'Sink Cabinet', 'SS', 'RH', 'Single Door', '650×550×900 mm', 'Sink Cabinet - Single Door 650mm RH (SS)', '650mm right hand single door sink cabinet - Stainless Steel', true);

-- Add comprehensive Tall Cabinet variants (missing depths, heights, and SS finishes)
INSERT INTO public.products (product_code, name, category, product_series, finish_type, orientation, door_type, dimensions, editable_title, editable_description, is_active) VALUES
-- Tall Cabinet Glass Door - Missing variants
('TCG-PC-7550180', 'Tall Cabinet Glass Door Series', 'Innosin Lab', 'Tall Cabinet', 'PC', 'None', 'Glass Door', '750×500×1800 mm', 'Tall Cabinet Glass - 750×500×1800 (PC)', '750×500×1800mm tall cabinet with glass door', true),
('TCG-SS-7540180', 'Tall Cabinet Glass Door Series', 'Innosin Lab', 'Tall Cabinet', 'SS', 'None', 'Glass Door', '750×400×1800 mm', 'Tall Cabinet Glass - 750×400×1800 (SS)', '750×400×1800mm tall cabinet with glass door - Stainless Steel', true),
('TCG-PC-7545180', 'Tall Cabinet Glass Door Series', 'Innosin Lab', 'Tall Cabinet', 'PC', 'None', 'Glass Door', '750×450×1800 mm', 'Tall Cabinet Glass - 750×450×1800 (PC)', '750×450×1800mm tall cabinet with glass door', true),
('TCG-SS-7545180', 'Tall Cabinet Glass Door Series', 'Innosin Lab', 'Tall Cabinet', 'SS', 'None', 'Glass Door', '750×450×1800 mm', 'Tall Cabinet Glass - 750×450×1800 (SS)', '750×450×1800mm tall cabinet with glass door - Stainless Steel', true),
('TCG-SS-7550180', 'Tall Cabinet Glass Door Series', 'Innosin Lab', 'Tall Cabinet', 'SS', 'None', 'Glass Door', '750×500×1800 mm', 'Tall Cabinet Glass - 750×500×1800 (SS)', '750×500×1800mm tall cabinet with glass door - Stainless Steel', true),
('TCG-PC-7555180', 'Tall Cabinet Glass Door Series', 'Innosin Lab', 'Tall Cabinet', 'PC', 'None', 'Glass Door', '750×550×1800 mm', 'Tall Cabinet Glass - 750×550×1800 (PC)', '750×550×1800mm tall cabinet with glass door', true),
('TCG-SS-7555180', 'Tall Cabinet Glass Door Series', 'Innosin Lab', 'Tall Cabinet', 'SS', 'None', 'Glass Door', '750×550×1800 mm', 'Tall Cabinet Glass - 750×550×1800 (SS)', '750×550×1800mm tall cabinet with glass door - Stainless Steel', true),

-- 2100mm height variants
('TCG-PC-7540210', 'Tall Cabinet Glass Door Series', 'Innosin Lab', 'Tall Cabinet', 'PC', 'None', 'Glass Door', '750×400×2100 mm', 'Tall Cabinet Glass - 750×400×2100 (PC)', '750×400×2100mm tall cabinet with glass door', true),
('TCG-SS-7540210', 'Tall Cabinet Glass Door Series', 'Innosin Lab', 'Tall Cabinet', 'SS', 'None', 'Glass Door', '750×400×2100 mm', 'Tall Cabinet Glass - 750×400×2100 (SS)', '750×400×2100mm tall cabinet with glass door - Stainless Steel', true),
('TCG-PC-7545210', 'Tall Cabinet Glass Door Series', 'Innosin Lab', 'Tall Cabinet', 'PC', 'None', 'Glass Door', '750×450×2100 mm', 'Tall Cabinet Glass - 750×450×2100 (PC)', '750×450×2100mm tall cabinet with glass door', true),
('TCG-SS-7545210', 'Tall Cabinet Glass Door Series', 'Innosin Lab', 'Tall Cabinet', 'SS', 'None', 'Glass Door', '750×450×2100 mm', 'Tall Cabinet Glass - 750×450×2100 (SS)', '750×450×2100mm tall cabinet with glass door - Stainless Steel', true),
('TCG-PC-7550210', 'Tall Cabinet Glass Door Series', 'Innosin Lab', 'Tall Cabinet', 'PC', 'None', 'Glass Door', '750×500×2100 mm', 'Tall Cabinet Glass - 750×500×2100 (PC)', '750×500×2100mm tall cabinet with glass door', true),
('TCG-SS-7550210', 'Tall Cabinet Glass Door Series', 'Innosin Lab', 'Tall Cabinet', 'SS', 'None', 'Glass Door', '750×500×2100 mm', 'Tall Cabinet Glass - 750×500×2100 (SS)', '750×500×2100mm tall cabinet with glass door - Stainless Steel', true),
('TCG-PC-7555210', 'Tall Cabinet Glass Door Series', 'Innosin Lab', 'Tall Cabinet', 'PC', 'None', 'Glass Door', '750×550×2100 mm', 'Tall Cabinet Glass - 750×550×2100 (PC)', '750×550×2100mm tall cabinet with glass door', true),
('TCG-SS-7555210', 'Tall Cabinet Glass Door Series', 'Innosin Lab', 'Tall Cabinet', 'SS', 'None', 'Glass Door', '750×550×2100 mm', 'Tall Cabinet Glass - 750×550×2100 (SS)', '750×550×2100mm tall cabinet with glass door - Stainless Steel', true);

-- Add Tall Cabinet Solid Door variants (same pattern as glass)
INSERT INTO public.products (product_code, name, category, product_series, finish_type, orientation, door_type, dimensions, editable_title, editable_description, is_active) VALUES
('TCS-PC-7540180', 'Tall Cabinet Solid Door Series', 'Innosin Lab', 'Tall Cabinet', 'PC', 'None', 'Solid Door', '750×400×1800 mm', 'Tall Cabinet Solid - 750×400×1800 (PC)', '750×400×1800mm tall cabinet with solid door', true),
('TCS-SS-7540180', 'Tall Cabinet Solid Door Series', 'Innosin Lab', 'Tall Cabinet', 'SS', 'None', 'Solid Door', '750×400×1800 mm', 'Tall Cabinet Solid - 750×400×1800 (SS)', '750×400×1800mm tall cabinet with solid door - Stainless Steel', true),
('TCS-PC-7545180', 'Tall Cabinet Solid Door Series', 'Innosin Lab', 'Tall Cabinet', 'PC', 'None', 'Solid Door', '750×450×1800 mm', 'Tall Cabinet Solid - 750×450×1800 (PC)', '750×450×1800mm tall cabinet with solid door', true),
('TCS-SS-7545180', 'Tall Cabinet Solid Door Series', 'Innosin Lab', 'Tall Cabinet', 'SS', 'None', 'Solid Door', '750×450×1800 mm', 'Tall Cabinet Solid - 750×450×1800 (SS)', '750×450×1800mm tall cabinet with solid door - Stainless Steel', true),
('TCS-PC-7550180', 'Tall Cabinet Solid Door Series', 'Innosin Lab', 'Tall Cabinet', 'PC', 'None', 'Solid Door', '750×500×1800 mm', 'Tall Cabinet Solid - 750×500×1800 (PC)', '750×500×1800mm tall cabinet with solid door', true),
('TCS-SS-7550180', 'Tall Cabinet Solid Door Series', 'Innosin Lab', 'Tall Cabinet', 'SS', 'None', 'Solid Door', '750×500×1800 mm', 'Tall Cabinet Solid - 750×500×1800 (SS)', '750×500×1800mm tall cabinet with solid door - Stainless Steel', true),
('TCS-PC-7555180', 'Tall Cabinet Solid Door Series', 'Innosin Lab', 'Tall Cabinet', 'PC', 'None', 'Solid Door', '750×550×1800 mm', 'Tall Cabinet Solid - 750×550×1800 (PC)', '750×550×1800mm tall cabinet with solid door', true),
('TCS-SS-7555180', 'Tall Cabinet Solid Door Series', 'Innosin Lab', 'Tall Cabinet', 'SS', 'None', 'Solid Door', '750×550×1800 mm', 'Tall Cabinet Solid - 750×550×1800 (SS)', '750×550×1800mm tall cabinet with solid door - Stainless Steel', true),

-- 2100mm height solid variants
('TCS-PC-7540210', 'Tall Cabinet Solid Door Series', 'Innosin Lab', 'Tall Cabinet', 'PC', 'None', 'Solid Door', '750×400×2100 mm', 'Tall Cabinet Solid - 750×400×2100 (PC)', '750×400×2100mm tall cabinet with solid door', true),
('TCS-SS-7540210', 'Tall Cabinet Solid Door Series', 'Innosin Lab', 'Tall Cabinet', 'SS', 'None', 'Solid Door', '750×400×2100 mm', 'Tall Cabinet Solid - 750×400×2100 (SS)', '750×400×2100mm tall cabinet with solid door - Stainless Steel', true),
('TCS-PC-7545210', 'Tall Cabinet Solid Door Series', 'Innosin Lab', 'Tall Cabinet', 'PC', 'None', 'Solid Door', '750×450×2100 mm', 'Tall Cabinet Solid - 750×450×2100 (PC)', '750×450×2100mm tall cabinet with solid door', true),
('TCS-SS-7545210', 'Tall Cabinet Solid Door Series', 'Innosin Lab', 'Tall Cabinet', 'SS', 'None', 'Solid Door', '750×450×2100 mm', 'Tall Cabinet Solid - 750×450×2100 (SS)', '750×450×2100mm tall cabinet with solid door - Stainless Steel', true),
('TCS-PC-7550210', 'Tall Cabinet Solid Door Series', 'Innosin Lab', 'Tall Cabinet', 'PC', 'None', 'Solid Door', '750×500×2100 mm', 'Tall Cabinet Solid - 750×500×2100 (PC)', '750×500×2100mm tall cabinet with solid door', true),
('TCS-SS-7550210', 'Tall Cabinet Solid Door Series', 'Innosin Lab', 'Tall Cabinet', 'SS', 'None', 'Solid Door', '750×500×2100 mm', 'Tall Cabinet Solid - 750×500×2100 (SS)', '750×500×2100mm tall cabinet with solid door - Stainless Steel', true),
('TCS-PC-7555210', 'Tall Cabinet Solid Door Series', 'Innosin Lab', 'Tall Cabinet', 'PC', 'None', 'Solid Door', '750×550×2100 mm', 'Tall Cabinet Solid - 750×550×2100 (PC)', '750×550×2100mm tall cabinet with solid door', true),
('TCS-SS-7555210', 'Tall Cabinet Solid Door Series', 'Innosin Lab', 'Tall Cabinet', 'SS', 'None', 'Solid Door', '750×550×2100 mm', 'Tall Cabinet Solid - 750×550×2100 (SS)', '750×550×2100mm tall cabinet with solid door - Stainless Steel', true);

-- Add missing SS finishes for existing KS Series
INSERT INTO public.products (product_code, name, category, product_series, finish_type, orientation, door_type, dimensions, editable_title, editable_description, is_active) VALUES
('KS-SS-700', 'KS Series Laboratory Bench', 'Innosin Lab', 'KS Series', 'SS', 'None', 'None', '700×750×850 mm', 'KS Series - 700mm (SS)', 'KS Series 700mm laboratory bench - Stainless Steel', true),
('KS-SS-750', 'KS Series Laboratory Bench', 'Innosin Lab', 'KS Series', 'SS', 'None', 'None', '750×750×850 mm', 'KS Series - 750mm (SS)', 'KS Series 750mm laboratory bench - Stainless Steel', true),
('KS-SS-800', 'KS Series Laboratory Bench', 'Innosin Lab', 'KS Series', 'SS', 'None', 'None', '800×750×850 mm', 'KS Series - 800mm (SS)', 'KS Series 800mm laboratory bench - Stainless Steel', true),
('KS-SS-850', 'KS Series Laboratory Bench', 'Innosin Lab', 'KS Series', 'SS', 'None', 'None', '850×750×850 mm', 'KS Series - 850mm (SS)', 'KS Series 850mm laboratory bench - Stainless Steel', true),
('KS-SS-900', 'KS Series Laboratory Bench', 'Innosin Lab', 'KS Series', 'SS', 'None', 'None', '900×750×850 mm', 'KS Series - 900mm (SS)', 'KS Series 900mm laboratory bench - Stainless Steel', true),
('KS-SS-1000', 'KS Series Laboratory Bench', 'Innosin Lab', 'KS Series', 'SS', 'None', 'None', '1000×750×850 mm', 'KS Series - 1000mm (SS)', 'KS Series 1000mm laboratory bench - Stainless Steel', true),
('KS-SS-1200', 'KS Series Laboratory Bench', 'Innosin Lab', 'KS Series', 'SS', 'None', 'None', '1200×750×850 mm', 'KS Series - 1200mm (SS)', 'KS Series 1200mm laboratory bench - Stainless Steel', true);
