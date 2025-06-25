
-- Update existing tables to support PDF integration
ALTER TABLE pdf_documents 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS processing_error TEXT;

-- Update knowledge_base_entries to support dynamic content
ALTER TABLE knowledge_base_entries 
ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create admin roles table for secure access
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Insert initial admin (replace with actual admin email)
INSERT INTO admin_roles (user_email, role) 
VALUES ('admin@innosinlab.com', 'super_admin') 
ON CONFLICT (user_email) DO NOTHING;

-- Enable RLS on admin_roles
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin access
CREATE POLICY "Public read access for admin roles" 
  ON admin_roles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can modify admin roles" 
  ON admin_roles 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email' 
    AND is_active = true
  ));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pdf_documents_brand_product ON pdf_documents(brand, product_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_auto_generated ON knowledge_base_entries(auto_generated);
CREATE INDEX IF NOT EXISTS idx_admin_roles_email ON admin_roles(user_email);

-- Create function to check admin access
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE admin_roles.user_email = $1 
    AND is_active = true
  );
$$;
