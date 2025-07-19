
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Search, Bot, FileText, RefreshCw, Trash2, AlertTriangle, Filter, Download, Upload, Eye, Edit, Archive } from 'lucide-react';
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
  version?: number;
  usage_count?: number;
  effectiveness_score?: number;
  tags?: string[];
}

const EnhancedKnowledgeManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: knowledgeEntries, isLoading, refetch } = useQuery({
    queryKey: ['enhanced-knowledge-entries', searchTerm, brandFilter, statusFilter, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('knowledge_base_entries')
        .select('*');

      // Apply filters
      if (searchTerm) {
        query = query.or(`brand.ilike.%${searchTerm}%,product_category.ilike.%${searchTerm}%,keywords.cs.{${searchTerm}},response_template.ilike.%${searchTerm}%`);
      }

      if (brandFilter !== 'all') {
        query = query.eq('brand', brandFilter);
      }

      if (statusFilter !== 'all') {
        query = query.eq('is_active', statusFilter === 'active');
      }

      // Apply sorting
      const [column, direction] = sortBy.split('_');
      query = query.order(column, { ascending: direction === 'asc' });

      const { data, error } = await query;
      if (error) throw error;
      return data as KnowledgeEntry[];
    },
  });

  // Get unique brands for filter
  const { data: brands } = useQuery({
    queryKey: ['knowledge-brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_base_entries')
        .select('brand')
        .not('brand', 'is', null);
      
      if (error) throw error;
      return [...new Set(data.map(item => item.brand))];
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
      queryClient.invalidateQueries({ queryKey: ['enhanced-knowledge-entries'] });
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

  const bulkActionMutation = useMutation({
    mutationFn: async (action: { type: 'activate' | 'deactivate' | 'delete'; ids: string[] }) => {
      if (action.type === 'delete') {
        const { error } = await supabase
          .from('knowledge_base_entries')
          .delete()
          .in('id', action.ids);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('knowledge_base_entries')
          .update({ is_active: action.type === 'activate' })
          .in('id', action.ids);
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: `Bulk ${variables.type} completed successfully`,
      });
      setSelectedEntries([]);
      queryClient.invalidateQueries({ queryKey: ['enhanced-knowledge-entries'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Bulk operation failed",
        variant: "destructive",
      });
      console.error('Bulk action error:', error);
    },
  });

  const clearAllDataMutation = useMutation({
    mutationFn: async () => {
      // Delete all knowledge base entries
      const { error: kbError } = await supabase
        .from('knowledge_base_entries')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (kbError) throw kbError;

      // Delete all PDF content
      const { error: contentError } = await supabase
        .from('pdf_content')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (contentError) throw contentError;

      // Reset all documents to pending status
      const { error: docError } = await supabase
        .from('pdf_documents')
        .update({ 
          processing_status: 'pending',
          processing_error: null,
          last_processed: null
        })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (docError) throw docError;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All knowledge base entries and processing history cleared",
      });
      queryClient.invalidateQueries({ queryKey: ['enhanced-knowledge-entries'] });
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
      toast({
        title: "Success",
        description: "Knowledge base regeneration initiated",
      });
    } catch (error) {
      console.error('Regeneration error:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate knowledge base",
        variant: "destructive",
      });
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

  const handleSelectEntry = (id: string) => {
    setSelectedEntries(prev => 
      prev.includes(id) 
        ? prev.filter(entryId => entryId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEntries.length === knowledgeEntries?.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(knowledgeEntries?.map(entry => entry.id) || []);
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
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Knowledge Base Entries</h3>
        <div className="flex gap-2">
          <Button onClick={regenerateKnowledgeBase} variant="outline" size="sm">
            <Bot className="h-4 w-4 mr-2" />
            Regenerate from PDFs
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
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
                  This will permanently delete all knowledge base entries, PDF content, and processing history. This action cannot be undone.
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

      {/* Enhanced Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands?.map(brand => (
              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at_desc">Newest First</SelectItem>
            <SelectItem value="created_at_asc">Oldest First</SelectItem>
            <SelectItem value="priority_desc">Priority High to Low</SelectItem>
            <SelectItem value="usage_count_desc">Most Used</SelectItem>
            <SelectItem value="effectiveness_score_desc">Most Effective</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedEntries.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-700">
            {selectedEntries.length} entries selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => bulkActionMutation.mutate({ type: 'activate', ids: selectedEntries })}
            >
              Activate
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => bulkActionMutation.mutate({ type: 'deactivate', ids: selectedEntries })}
            >
              Deactivate
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => bulkActionMutation.mutate({ type: 'delete', ids: selectedEntries })}
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="grid gap-4">
        {knowledgeEntries?.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No knowledge entries found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Upload some PDF documents to generate knowledge base entries
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          knowledgeEntries?.map((entry) => (
            <Card key={entry.id} className={selectedEntries.includes(entry.id) ? 'ring-2 ring-blue-500' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedEntries.includes(entry.id)}
                      onChange={() => handleSelectEntry(entry.id)}
                      className="mt-1"
                    />
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
                        {entry.usage_count && (
                          <Badge variant="outline">
                            Used: {entry.usage_count} times
                          </Badge>
                        )}
                        {entry.effectiveness_score && (
                          <Badge variant="outline">
                            Effectiveness: {(entry.effectiveness_score * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={entry.is_active ? "destructive" : "default"}
                      onClick={() => toggleEntryStatus(entry.id, entry.is_active)}
                    >
                      {entry.is_active ? <Archive className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Tags:</h4>
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
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
                    {entry.version && <span>Version: {entry.version}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Select All Checkbox */}
      {knowledgeEntries && knowledgeEntries.length > 0 && (
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedEntries.length === knowledgeEntries.length}
              onChange={handleSelectAll}
            />
            <span className="text-sm">Select all entries</span>
          </label>
          <span className="text-sm text-gray-500">
            Showing {knowledgeEntries.length} entries
          </span>
        </div>
      )}
    </div>
  );
};

export default EnhancedKnowledgeManager;
