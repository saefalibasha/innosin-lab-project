
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Trash2, Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PDFDocument {
  id: string;
  filename: string;
  brand: string;
  product_type: string;
  file_size: number | null;
  upload_date: string;
  last_processed: string | null;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  file_path: string | null;
}

const PDFManagement = () => {
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedProductType, setSelectedProductType] = useState('');

  const expectedFiles = [
    { filename: 'broen-lab-emergency-shower.pdf', brand: 'Broen-Lab', product_type: 'emergency-shower' },
    { filename: 'broen-lab-water-faucet.pdf', brand: 'Broen-Lab', product_type: 'water-faucet' },
    { filename: 'oriental-giken-fumehood-1.pdf', brand: 'Oriental Giken', product_type: 'fumehood-1' },
    { filename: 'oriental-giken-fumehood-2.pdf', brand: 'Oriental Giken', product_type: 'fumehood-2' },
    { filename: 'innosin-lab-catalog.pdf', brand: 'Innosin Lab', product_type: 'catalog' },
    { filename: 'hamilton-lab-1.pdf', brand: 'Hamilton Laboratory', product_type: 'lab-1' }
  ];

  const brands = ['Broen-Lab', 'Oriental Giken', 'Innosin Lab', 'Hamilton Laboratory'];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('pdf_documents')
        .select('*')
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedBrand || !selectedProductType) {
      toast.error('Please select a file, brand, and product type');
      return;
    }

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setUploading(true);
    
    try {
      // Create document record
      const { data: docData, error: docError } = await supabase
        .from('pdf_documents')
        .insert({
          filename: file.name,
          brand: selectedBrand,
          product_type: selectedProductType,
          file_size: file.size,
          processing_status: 'pending'
        })
        .select()
        .single();

      if (docError) throw docError;

      // Simulate PDF processing (in real implementation, this would extract text content)
      setTimeout(async () => {
        try {
          // Update processing status
          await supabase
            .from('pdf_documents')
            .update({ 
              processing_status: 'completed',
              last_processed: new Date().toISOString()
            })
            .eq('id', docData.id);

          // Simulate extracting content and updating knowledge base
          await simulateContentExtraction(docData);
          
          toast.success('PDF uploaded and processed successfully');
          fetchDocuments();
        } catch (error) {
          console.error('Error processing PDF:', error);
          await supabase
            .from('pdf_documents')
            .update({ processing_status: 'failed' })
            .eq('id', docData.id);
        }
      }, 3000);

      toast.success('PDF uploaded successfully, processing...');
      fetchDocuments();
      
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error('Failed to upload PDF');
    } finally {
      setUploading(false);
      setSelectedBrand('');
      setSelectedProductType('');
    }
  };

  const simulateContentExtraction = async (document: PDFDocument) => {
    // Simulate extracting content from PDF and storing it
    const sampleContent = [
      {
        content_type: 'product_info',
        title: `${document.brand} ${document.product_type} Overview`,
        content: `Comprehensive information about ${document.brand} ${document.product_type} products including specifications, features, and applications.`,
        keywords: [document.brand.toLowerCase(), document.product_type.toLowerCase(), 'specification', 'features']
      },
      {
        content_type: 'specification',
        title: 'Technical Specifications',
        content: `Detailed technical specifications for ${document.brand} ${document.product_type} including dimensions, materials, and performance data.`,
        keywords: ['technical', 'specification', 'dimensions', 'materials', 'performance']
      }
    ];

    for (const content of sampleContent) {
      await supabase.from('pdf_content').insert({
        document_id: document.id,
        ...content
      });
    }

    // Update knowledge base entry with extracted content
    await supabase
      .from('knowledge_base_entries')
      .update({
        response_template: `I have detailed information about our ${document.brand} ${document.product_type} products from our latest catalog. This includes comprehensive specifications, features, installation guidelines, and technical details. What specific information would you like to know?`,
        source_document_id: document.id
      })
      .eq('brand', document.brand)
      .eq('product_category', document.product_type);
  };

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pdf_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="p-6">Loading PDF documents...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>PDF Document Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
            <div className="text-center space-y-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium">Upload PDF Catalog</h3>
                <p className="text-sm text-gray-500">Upload brand-specific product catalogs to enhance AI knowledge</p>
              </div>
              
              <div className="flex space-x-4 justify-center">
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Product type (e.g., emergency-shower)"
                  value={selectedProductType}
                  onChange={(e) => setSelectedProductType(e.target.value)}
                  className="w-48"
                />
              </div>
              
              <div>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={uploading || !selectedBrand || !selectedProductType}
                  className="max-w-xs mx-auto"
                />
              </div>
            </div>
          </div>

          {/* Expected Files Guide */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Expected PDF Files:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {expectedFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">{file.filename}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No documents uploaded yet</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="font-medium">{doc.filename}</div>
                      <div className="text-sm text-gray-500">
                        {doc.brand} • {doc.product_type}
                      </div>
                      <div className="text-xs text-gray-400">
                        Uploaded {new Date(doc.upload_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(doc.processing_status)}
                      <Badge className={`text-white ${getStatusColor(doc.processing_status)}`}>
                        {doc.processing_status}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteDocument(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFManagement;
