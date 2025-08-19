-- Create before_after_projects table for admin-managed content
CREATE TABLE public.before_after_projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  location text,
  before_image text,
  after_image text,
  description text,
  completion_date date,
  project_type text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create shop_look_content table for section configuration
CREATE TABLE public.shop_look_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text DEFAULT 'Shop',
  title_highlight text DEFAULT 'The Look',
  description text DEFAULT 'Explore our featured laboratory setup and discover the premium equipment that makes it exceptional.',
  background_image text DEFAULT '/shop-the-look/modern-lab-setup.jpg',
  background_alt text DEFAULT 'Modern Laboratory Setup',
  is_active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now()
);

-- Create shop_look_hotspots table for interactive hotspot management
CREATE TABLE public.shop_look_hotspots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  x_position numeric(5,2) NOT NULL,
  y_position numeric(5,2) NOT NULL,
  title text NOT NULL,
  description text,
  price text DEFAULT 'Contact for pricing',
  category text DEFAULT 'Laboratory Equipment',
  image text,
  product_link text DEFAULT '/products',
  specifications jsonb DEFAULT '["Premium Quality", "Professional Grade", "Industry Standard"]'::jsonb,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.before_after_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_look_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_look_hotspots ENABLE ROW LEVEL SECURITY;

-- Create policies for before_after_projects
CREATE POLICY "Public can read active projects" 
ON public.before_after_projects 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage projects" 
ON public.before_after_projects 
FOR ALL 
USING (is_admin(get_current_user_email()));

-- Create policies for shop_look_content
CREATE POLICY "Public can read active content" 
ON public.shop_look_content 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage content" 
ON public.shop_look_content 
FOR ALL 
USING (is_admin(get_current_user_email()));

-- Create policies for shop_look_hotspots
CREATE POLICY "Public can read active hotspots" 
ON public.shop_look_hotspots 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage hotspots" 
ON public.shop_look_hotspots 
FOR ALL 
USING (is_admin(get_current_user_email()));

-- Create triggers for updated_at columns
CREATE TRIGGER update_before_after_projects_updated_at
  BEFORE UPDATE ON public.before_after_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shop_look_content_updated_at
  BEFORE UPDATE ON public.shop_look_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shop_look_hotspots_updated_at
  BEFORE UPDATE ON public.shop_look_hotspots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data for before_after_projects (only first 2 projects)
INSERT INTO public.before_after_projects (title, location, before_image, after_image, description, completion_date, project_type, display_order) VALUES
('NTU Exxon Mobil', 'Nanyang Technological University', '/before-after-projects/university-lab-before.jpg', '/before-after-projects/university-lab-after.jpg', 'We completed addition and alteration works at the ExxonMobil laboratory, Academic Building North, Nanyang Technological University. The scope included the design, fabrication, and installation of modular laboratory furniture systems with 20mm thick graphite epoxy Hychem worktops, powder-coated steel frames, integrated service fixtures, custom storage solutions, and specialized enclosures. The upgrade ensures enhanced durability, chemical resistance, and full compliance with laboratory safety standards.', '2025-06-26', 'University Laboratory', 1),
('NTU Exxon Mobil', 'Nanyang Technological University', '/before-after-projects/hospital-pathology-after.jpg', '/before-after-projects/hospital-pathology-before.jpg', 'We completed addition and alteration works at the ExxonMobil laboratory, Academic Building North, Nanyang Technological University. The scope included the design, fabrication, and installation of modular laboratory furniture systems with 20mm thick graphite epoxy Hychem worktops, powder-coated steel frames, integrated service fixtures, custom storage solutions, and specialized enclosures. The upgrade ensures enhanced durability, chemical resistance, and full compliance with laboratory safety standards.', '2025-06-26', 'Medical Facility', 2);

-- Insert default shop_look_content
INSERT INTO public.shop_look_content (title, title_highlight, description, background_image, background_alt) VALUES
('Shop', 'The Look', 'Explore our featured laboratory setup and discover the premium equipment that makes it exceptional.', '/shop-the-look/modern-lab-setup.jpg', 'Modern Laboratory Setup');

-- Insert default hotspots
INSERT INTO public.shop_look_hotspots (x_position, y_position, title, description, price, category, image, product_link, display_order) VALUES
(25, 45, 'Laboratory Workbench', 'Premium epoxy resin worktop with chemical resistance and integrated storage solutions.', '$2,800 - $4,200', 'Furniture', '/products/innosin-mc-pc-755065/MC-PC (755065).jpg', '/products', 1),
(65, 30, 'Fume Hood System', 'Advanced ventilation system with variable air flow control and safety monitoring.', '$8,500 - $12,000', 'Safety Equipment', '/products/innosin-tcg-pc-754018/TCG-PC (754018).jpg', '/products', 2),
(80, 60, 'Storage Cabinet', 'Chemical-resistant storage with secure locking mechanisms and adjustable shelving.', '$1,200 - $2,500', 'Storage', '/products/innosin-wcg-pc-753375/WCG-PC (753375).jpg', '/products', 3),
(40, 75, 'Mobile Laboratory Cart', 'Stainless steel mobile workstation with integrated power and data connections.', '$3,200 - $4,800', 'Mobile Solutions', '/products/innosin-or-pc-604518/OR-PC-3838 (604518).jpg', '/products', 4);