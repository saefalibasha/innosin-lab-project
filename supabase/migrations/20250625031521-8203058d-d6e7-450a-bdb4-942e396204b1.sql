
-- Create table for PDF document management
CREATE TABLE public.pdf_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  product_type TEXT NOT NULL,
  file_size INTEGER,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_processed TIMESTAMP WITH TIME ZONE,
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for extracted PDF content
CREATE TABLE public.pdf_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.pdf_documents(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('product_info', 'specification', 'technical_detail', 'feature', 'compliance')),
  title TEXT,
  content TEXT NOT NULL,
  page_number INTEGER,
  section TEXT,
  keywords TEXT[],
  confidence_score DECIMAL(3,2) DEFAULT 0.8,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for dynamic knowledge base entries
CREATE TABLE public.knowledge_base_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  product_category TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  response_template TEXT NOT NULL,
  confidence_threshold DECIMAL(3,2) DEFAULT 0.7,
  source_document_id UUID REFERENCES public.pdf_documents(id),
  source_content_ids UUID[],
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for product specifications extracted from PDFs
CREATE TABLE public.product_specifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT, -- Links to existing product IDs
  document_id UUID NOT NULL REFERENCES public.pdf_documents(id) ON DELETE CASCADE,
  specification_type TEXT NOT NULL,
  specification_name TEXT NOT NULL,
  specification_value TEXT NOT NULL,
  unit TEXT,
  category TEXT,
  is_key_feature BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for PDF documents (admin access)
ALTER TABLE public.pdf_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to PDF documents" 
  ON public.pdf_documents 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow admin access to PDF documents" 
  ON public.pdf_documents 
  FOR ALL 
  USING (true);

-- Add RLS policies for PDF content
ALTER TABLE public.pdf_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to PDF content" 
  ON public.pdf_content 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow admin access to PDF content" 
  ON public.pdf_content 
  FOR ALL 
  USING (true);

-- Add RLS policies for knowledge base entries
ALTER TABLE public.knowledge_base_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to knowledge base" 
  ON public.knowledge_base_entries 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow admin access to knowledge base" 
  ON public.knowledge_base_entries 
  FOR ALL 
  USING (true);

-- Add RLS policies for product specifications
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to specifications" 
  ON public.product_specifications 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow admin access to specifications" 
  ON public.product_specifications 
  FOR ALL 
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_pdf_documents_brand ON public.pdf_documents(brand);
CREATE INDEX idx_pdf_documents_product_type ON public.pdf_documents(product_type);
CREATE INDEX idx_pdf_documents_status ON public.pdf_documents(processing_status);
CREATE INDEX idx_pdf_content_document_id ON public.pdf_content(document_id);
CREATE INDEX idx_pdf_content_type ON public.pdf_content(content_type);
CREATE INDEX idx_pdf_content_keywords ON public.pdf_content USING GIN(keywords);
CREATE INDEX idx_knowledge_base_brand ON public.knowledge_base_entries(brand);
CREATE INDEX idx_knowledge_base_keywords ON public.knowledge_base_entries USING GIN(keywords);
CREATE INDEX idx_product_specs_product_id ON public.product_specifications(product_id);
CREATE INDEX idx_product_specs_document_id ON public.product_specifications(document_id);

-- Create triggers for updated_at
CREATE TRIGGER update_pdf_documents_updated_at 
    BEFORE UPDATE ON public.pdf_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at 
    BEFORE UPDATE ON public.knowledge_base_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial knowledge base entries for expected PDF files
INSERT INTO public.knowledge_base_entries (brand, product_category, keywords, response_template, priority) VALUES
('Broen-Lab', 'emergency-shower', ARRAY['emergency', 'shower', 'safety', 'decontamination', 'eyewash'], 'Our Broen-Lab emergency shower systems provide comprehensive safety solutions for laboratory environments. Let me help you with specific information about our emergency shower products.', 2),
('Broen-Lab', 'water-faucet', ARRAY['faucet', 'tap', 'water', 'bench', 'laboratory', 'fitting'], 'Our Broen-Lab water faucets and laboratory fittings are designed for precision and durability in laboratory settings. I can provide detailed specifications and installation guidance.', 2),
('Oriental Giken', 'fumehood-1', ARRAY['fume', 'hood', 'ventilation', 'extraction', 'type1', 'oriental'], 'Our Oriental Giken Type 1 fume hoods offer superior containment and energy efficiency. I can help you with technical specifications and selection guidance.', 2),
('Oriental Giken', 'fumehood-2', ARRAY['fume', 'hood', 'ventilation', 'extraction', 'type2', 'oriental'], 'Our Oriental Giken Type 2 fume hoods provide advanced ventilation solutions for specialized laboratory applications. Let me assist you with detailed information.', 2),
('Innosin Lab', 'catalog', ARRAY['innosin', 'catalog', 'laboratory', 'equipment', 'furniture'], 'Welcome to Innosin Lab! I can help you explore our comprehensive catalog of laboratory equipment and furniture solutions. What specific products are you interested in?', 1),
('Hamilton Laboratory', 'lab-1', ARRAY['hamilton', 'laboratory', 'furniture', 'bench', 'storage'], 'Our Hamilton Laboratory solutions provide high-quality laboratory furniture and equipment. I can assist you with product selection and specifications.', 2);
