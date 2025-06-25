
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { Search, Bot, FileText, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KnowledgeEntry {
  id: string;
  brand: string;
  product_category: string;
  keywords: string[];
  response_template: string;
  auto_generated: boolean;
  priority: number;
  confidence_threshold: number;
  is_active: boolean;
  created_at: string;
  last_updated: string;
}

const KnowledgeBaseManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: knowledgeEntries, isLoading, refetch } = useQuery({
    queryKey: ['knowledge-entries', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('knowledge_base_entries')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`brand.ilike.%${searchTerm}%,product_category.ilike.%${searchTerm}%,keywords.cs.{${searchTerm}}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as KnowledgeEntry[];
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from('knowledge_base_entries')
        .delete()
        .eq('id', entryId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Knowledge base entry deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['knowledge-entries'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete knowledge base entry",
        variant: "destructive",
      });
      console.error('Delete error:', error);
    },
  });

  const clearAllDataMutation = useMutation({
    mutationFn: async () => {
      // Delete all knowledge base entries
      const { error: kbError } = await supabase
        .from('knowledge_base_entries')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all entries

      if (kbError) throw kbError;

      // Delete all PDF content
      const { error: contentError } = await supabase
        .from('pdf_content')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all entries

      if (contentError) throw contentError;

      // Reset all documents to pending status
      const { error: docError } = await supabase
        .from('pdf_documents')
        .update({ 
          processing_status: 'pending',
          processing_error: null,
          last_processed: null
        })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all entries

      if (docError) throw docError;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All knowledge base entries and processing history cleared",
      });
      queryClient.invalidateQueries({ queryKey: ['knowledge-entries'] });
      queryClient.invalidateQueries({ queryKey: ['pdf-documents'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clear data",
        variant: "destructive",
      });
      console.error('Clear all error:', error);
    },
  });

  const regenerateKnowledgeBase = async () => {
    try {
      const { error } = await supabase.functions.invoke('regenerate-knowledge-base');
      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Regeneration error:', error);
    }
  };

  const toggleEntryStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('knowledge_base_entries')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading knowledge base...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Knowledge Base Management</h2>
        <div className="flex gap-2">
          <Button onClick={regenerateKnowledgeBase} variant="outline">
            <Bot className="h-4 w-4 mr-2" />
            Regenerate from PDFs
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Clear All Data
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>All knowledge base entries</li>
                    <li>All PDF content extractions</li>
                    <li>All processing history</li>
                  </ul>
                  <p className="mt-2 font-semibold text-red-700">
                    This action cannot be undone. PDF files will remain but will need to be reprocessed.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => clearAllDataMutation.mutate()}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={clearAllDataMutation.isPending}
                >
                  {clearAllDataMutation.isPending ? 'Clearing...' : 'Clear All Data'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search knowledge entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {knowledgeEntries?.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No knowledge entries found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          knowledgeEntries?.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {entry.brand} - {entry.product_category}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      {entry.auto_generated && (
                        <Badge variant="secondary">
                          <Bot className="h-3 w-3 mr-1" />
                          Auto-generated
                        </Badge>
                      )}
                      <Badge variant={entry.is_active ? "default" : "outline"}>
                        {entry.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">Priority: {entry.priority}</Badge>
                      <Badge variant="outline">
                        Confidence: {(entry.confidence_threshold * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={entry.is_active ? "destructive" : "default"}
                      onClick={() => toggleEntryStatus(entry.id, entry.is_active)}
                    >
                      {entry.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Knowledge Entry</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this knowledge base entry for {entry.brand} - {entry.product_category}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteEntryMutation.mutate(entry.id)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteEntryMutation.isPending}
                          >
                            {deleteEntryMutation.isPending ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Keywords:</h4>
                    <div className="flex flex-wrap gap-1">
                      {entry.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Response Template:</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      {entry.response_template.length > 200 
                        ? `${entry.response_template.substring(0, 200)}...`
                        : entry.response_template
                      }
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>Created: {new Date(entry.created_at).toLocaleDateString()}</span>
                    <span>Updated: {new Date(entry.last_updated).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseManager;
