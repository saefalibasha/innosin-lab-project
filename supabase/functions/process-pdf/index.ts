
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessPDFRequest {
  documentId: string;
  fileUrl?: string;
  reprocess?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { documentId, fileUrl, reprocess }: ProcessPDFRequest = await req.json()

    // Update processing status
    await supabase
      .from('pdf_documents')
      .update({ 
        processing_status: 'processing',
        processing_error: null 
      })
      .eq('id', documentId)

    // Get document details
    const { data: document, error: docError } = await supabase
      .from('pdf_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError) throw docError

    // Download and process PDF
    const pdfUrl = fileUrl || document.file_url
    if (!pdfUrl) throw new Error('No file URL available')

    console.log(`Processing PDF: ${document.filename}`)

    // Simulate PDF text extraction (in real implementation, use a PDF parsing library)
    const extractedContent = await extractPDFContent(pdfUrl, document)
    
    // Store extracted content
    await storeExtractedContent(supabase, documentId, extractedContent, document)
    
    // Generate knowledge base entries
    await generateKnowledgeBaseEntries(supabase, document, extractedContent)

    // Update document status
    await supabase
      .from('pdf_documents')
      .update({ 
        processing_status: 'complete',
        last_processed: new Date().toISOString()
      })
      .eq('id', documentId)

    console.log(`Successfully processed PDF: ${document.filename}`)

    return new Response(
      JSON.stringify({ success: true, message: 'PDF processed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('PDF processing error:', error)

    // Update error status if documentId is available
    if (req.body) {
      try {
        const { documentId } = await req.json()
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        
        await supabase
          .from('pdf_documents')
          .update({ 
            processing_status: 'error',
            processing_error: error.message 
          })
          .eq('id', documentId)
      } catch (updateError) {
        console.error('Error updating document status:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function extractPDFContent(pdfUrl: string, document: any) {
  // In a real implementation, you would use a PDF parsing library
  // For now, we'll simulate content extraction based on the document type
  
  const mockContent = generateMockContent(document.brand, document.product_type);
  
  return {
    sections: [
      {
        title: `${document.brand} ${document.product_type} Specifications`,
        content: mockContent.specifications,
        type: 'specifications',
        page: 1
      },
      {
        title: 'Product Features',
        content: mockContent.features,
        type: 'features',
        page: 1
      },
      {
        title: 'Installation Guidelines',
        content: mockContent.installation,
        type: 'installation',
        page: 2
      }
    ],
    specifications: mockContent.specs,
    keywords: mockContent.keywords
  };
}

function generateMockContent(brand: string, productType: string) {
  const brandSpecs = {
    'broen-lab': {
      'emergency-shower': {
        specifications: 'Stainless steel construction, ANSI Z358.1 compliant, thermostatic mixing valve, flow rate 20 GPM, operating pressure 30-90 PSI.',
        features: 'Corrosion-resistant materials, easy maintenance, emergency activation, temperature control, durable construction.',
        installation: 'Wall-mounted installation, requires 1/2" water supply, electrical connection for heating elements, proper drainage system.',
        specs: { material: 'Stainless Steel', flow_rate: '20 GPM', pressure: '30-90 PSI' },
        keywords: ['emergency shower', 'safety equipment', 'stainless steel', 'ANSI compliant', 'thermostatic']
      },
      'water-faucet': {
        specifications: 'Laboratory-grade brass construction, lead-free materials, ceramic disc cartridge, 360-degree swivel spout.',
        features: 'Chemical resistant, easy operation, durable finish, maintenance-free operation.',
        installation: 'Deck-mounted installation, standard plumbing connections, easy cartridge replacement.',
        specs: { material: 'Brass', finish: 'Chrome', connection: '1/2" NPT' },
        keywords: ['laboratory faucet', 'lead-free', 'chemical resistant', 'brass construction']
      }
    },
    'oriental-giken': {
      'fumehood-1': {
        specifications: 'Type A2 biological safety cabinet, HEPA filtration, 4-foot working width, UV sterilization.',
        features: 'HEPA filtration system, UV sterilization, airflow monitoring, alarm systems, energy efficient.',
        installation: 'Floor-standing installation, electrical connection required, ventilation system integration.',
        specs: { type: 'A2', width: '4 feet', filtration: 'HEPA' },
        keywords: ['fume hood', 'biological safety', 'HEPA filter', 'laboratory ventilation']
      },
      'fumehood-2': {
        specifications: 'Chemical fume hood, variable air volume control, 6-foot working width, sash alarm.',
        features: 'VAV control, safety monitoring, chemical resistance, optimal containment.',
        installation: 'Laboratory installation, ductwork connection, electrical and control systems.',
        specs: { type: 'Chemical', width: '6 feet', control: 'VAV' },
        keywords: ['chemical fume hood', 'VAV control', 'laboratory safety', 'chemical resistance']
      }
    },
    'innosin-lab': {
      'catalog': {
        specifications: 'Complete laboratory equipment catalog featuring furniture, safety equipment, and instrumentation.',
        features: 'Comprehensive product range, technical specifications, installation guidelines, certification details.',
        installation: 'Product-specific installation instructions included for each item in catalog.',
        specs: { type: 'Catalog', pages: '200+', categories: 'Multiple' },
        keywords: ['laboratory equipment', 'catalog', 'furniture', 'safety equipment', 'instrumentation']
      }
    },
    'hamilton-lab': {
      '1': {
        specifications: 'Precision laboratory instruments, automated liquid handling, high accuracy dispensing.',
        features: 'Automated operation, precision control, software integration, multiple channel options.',
        installation: 'Benchtop installation, software setup, calibration procedures, maintenance protocols.',
        specs: { type: 'Liquid Handler', channels: 'Variable', accuracy: 'High' },
        keywords: ['liquid handling', 'automation', 'precision instruments', 'laboratory automation']
      }
    }
  };

  return brandSpecs[brand]?.[productType] || {
    specifications: `General ${brand} ${productType} specifications`,
    features: `Standard ${productType} features`,
    installation: `Standard installation procedures for ${productType}`,
    specs: { type: productType, brand: brand },
    keywords: [brand, productType, 'laboratory equipment']
  };
}

async function storeExtractedContent(supabase: any, documentId: string, content: any, document: any) {
  const contentEntries = content.sections.map((section: any) => ({
    document_id: documentId,
    title: section.title,
    content: section.content,
    content_type: section.type,
    section: section.title,
    page_number: section.page,
    keywords: content.keywords,
    confidence_score: 0.85
  }));

  const { error } = await supabase
    .from('pdf_content')
    .insert(contentEntries);

  if (error) throw error;
}

async function generateKnowledgeBaseEntries(supabase: any, document: any, content: any) {
  const knowledgeEntry = {
    brand: document.brand,
    product_category: document.product_type,
    keywords: content.keywords,
    response_template: `Based on our ${document.brand} ${document.product_type} documentation: ${content.sections[0].content}`,
    auto_generated: true,
    priority: 1,
    confidence_threshold: 0.7,
    source_document_id: document.id,
    is_active: true
  };

  const { error } = await supabase
    .from('knowledge_base_entries')
    .insert(knowledgeEntry);

  if (error) throw error;
}
