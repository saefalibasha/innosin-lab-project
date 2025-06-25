
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface PDFDocument {
  id: string;
  filename: string;
  brand: string;
  product_type: string;
  processing_status: string;
  processing_error?: string;
  created_at: string;
  last_processed?: string;
  file_size?: number;
}

const PDFProcessingStatus = () => {
  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['pdf-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pdf_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PDFDocument[];
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const reprocessDocument = async (documentId: string) => {
    try {
      const { error } = await supabase.functions.invoke('process-pdf', {
        body: { documentId, reprocess: true }
      });
      
      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Reprocess error:', error);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading documents...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Processing Status</h2>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {documents?.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No documents uploaded yet</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents?.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {getStatusIcon(doc.processing_status)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{doc.filename}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span>Brand: {doc.brand}</span>
                        <span>Type: {doc.product_type}</span>
                        <span>Size: {formatFileSize(doc.file_size)}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        Uploaded: {new Date(doc.created_at).toLocaleString()}
                        {doc.last_processed && (
                          <span className="ml-4">
                            Processed: {new Date(doc.last_processed).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {doc.processing_error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-700">{doc.processing_error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(doc.processing_status)}>
                      {doc.processing_status}
                    </Badge>
                    {doc.processing_status === 'error' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reprocessDocument(doc.id)}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PDFProcessingStatus;
