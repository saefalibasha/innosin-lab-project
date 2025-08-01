
-- Create the pdf_content table that the components are expecting
CREATE TABLE public.pdf_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.pdf_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  page_number INTEGER,
  content_type TEXT DEFAULT 'text',
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the pdf_content table
ALTER TABLE public.pdf_content ENABLE ROW LEVEL SECURITY;

-- Create policies for pdf_content table
CREATE POLICY "Admins can manage pdf content" 
  ON public.pdf_content 
  FOR ALL 
  USING (is_admin(get_current_user_email()));

CREATE POLICY "Allow admin access to PDF content" 
  ON public.pdf_content 
  FOR ALL 
  USING (true);

CREATE POLICY "Allow read access to PDF content" 
  ON public.pdf_content 
  FOR SELECT 
  USING (true);

CREATE POLICY "Public can read pdf content" 
  ON public.pdf_content 
  FOR SELECT 
  USING (true);

-- Create an index for better performance
CREATE INDEX idx_pdf_content_document_id ON public.pdf_content(document_id);

-- Add trigger for updated_at
CREATE TRIGGER update_pdf_content_updated_at
    BEFORE UPDATE ON public.pdf_content
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updated_at_column();
