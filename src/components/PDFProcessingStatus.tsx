
import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, FileText, AlertCircle, CheckCircle, Clock, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      // Delete PDF content first
      const { error: contentError } = await supabase
        .from('pdf_content')
        .delete()
        .eq('document_id', documentId);

      if (contentError) throw contentError;

      // Delete knowledge base entries
      const { error: kbError } = await supabase
        .from('knowledge_base_entries')
        .delete()
        .eq('source_document_id', documentId);

      if (kbError) throw kbError;

      // Delete the document
      const { error: docError } = await supabase
        .from('pdf_documents')
        .delete()
        .eq('id', documentId);

      if (docError) throw docError;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document and all related data deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['pdf-documents'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-entries'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
      console.error('Delete error:', error);
    },
  });

  const clearAllProcessingMutation = useMutation({
    mutationFn: async () => {
      // Reset all documents to pending
      const { error: docError } = await supabase
        .from('pdf_documents')
        .update({ 
          processing_status: 'pending',
          processing_error: null,
          last_processed: null
        })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all entries

      if (docError) throw docError;

      // Delete all PDF content
      const { error: contentError } = await supabase
        .from('pdf_content')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all entries

      if (contentError) throw contentError;

      // Delete all auto-generated knowledge base entries
      const { error: kbError } = await supabase
        .from('knowledge_base_entries')
        .delete()
        .eq('auto_generated', true);

      if (kbError) throw kbError;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All processing history cleared. Documents reset to pending status.",
      });
      queryClient.invalidateQueries({ queryKey: ['pdf-documents'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-entries'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clear processing history",
        variant: "destructive",
      });
      console.error('Clear processing error:', error);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
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
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Processing
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Clear All Processing History
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Reset all documents to pending status</li>
                    <li>Clear all processing errors</li>
                    <li>Delete all extracted PDF content</li>
                    <li>Remove all auto-generated knowledge base entries</li>
                  </ul>
                  <p className="mt-2 font-semibold text-red-700">
                    PDF files will remain but will need to be reprocessed.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => clearAllProcessingMutation.mutate()}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={clearAllProcessingMutation.isPending}
                >
                  {clearAllProcessingMutation.isPending ? 'Clearing...' : 'Clear All Processing'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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
                    {doc.processing_status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reprocessDocument(doc.id)}
                      >
                        Retry
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Document</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{doc.filename}" and all its related data? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteDocumentMutation.mutate(doc.id)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteDocumentMutation.isPending}
                          >
                            {deleteDocumentMutation.isPending ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
