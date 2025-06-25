
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Search, Bot, FileText, RefreshCw } from 'lucide-react';

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
        <Button onClick={regenerateKnowledgeBase} variant="outline">
          <Bot className="h-4 w-4 mr-2" />
          Regenerate from PDFs
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -y-1/2 h-4 w-4 text-gray-400" />
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
                  <Button
                    size="sm"
                    variant={entry.is_active ? "destructive" : "default"}
                    onClick={() => toggleEntryStatus(entry.id, entry.is_active)}
                  >
                    {entry.is_active ? "Deactivate" : "Activate"}
                  </Button>
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
