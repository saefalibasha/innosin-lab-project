
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  BarChart3, 
  TrendingUp, 
  Activity,
  CheckCircle,
  XCircle,
  Upload,
  Download,
  RefreshCw,
  Tags,
  Calendar,
  Users
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface KnowledgeEntry {
  id: string;
  brand: string;
  product_category: string;
  keywords: string[];
  response_template: string;
  confidence_threshold: number;
  is_active: boolean;
  version: number;
  usage_count: number;
  effectiveness_score: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface KnowledgeAnalytics {
  total_entries: number;
  active_entries: number;
  avg_effectiveness: number;
  total_usage: number;
  recent_activity: number;
}

const EnhancedKnowledgeManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const queryClient = useQueryClient();

  // Fetch knowledge entries
  const { data: knowledgeEntries = [], isLoading } = useQuery({
    queryKey: ['knowledge-entries', searchTerm, selectedBrand, selectedCategory, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('knowledge_base_entries')
        .select('*')
        .order('updated_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`response_template.ilike.%${searchTerm}%,keywords.cs.{${searchTerm}}`);
      }
      
      if (selectedBrand !== 'all') {
        query = query.eq('brand', selectedBrand);
      }
      
      if (selectedCategory !== 'all') {
        query = query.eq('product_category', selectedCategory);
      }
      
      if (statusFilter !== 'all') {
        query = query.eq('is_active', statusFilter === 'active');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as KnowledgeEntry[];
    }
  });

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ['knowledge-analytics'],
    queryFn: async () => {
      const { data: entries } = await supabase
        .from('knowledge_base_entries')
        .select('id, is_active, usage_count, effectiveness_score, created_at');

      if (!entries) return null;

      const total_entries = entries.length;
      const active_entries = entries.filter(e => e.is_active).length;
      const avg_effectiveness = entries.reduce((sum, e) => sum + (e.effectiveness_score || 0), 0) / total_entries;
      const total_usage = entries.reduce((sum, e) => sum + (e.usage_count || 0), 0);
      const recent_activity = entries.filter(e => 
        new Date(e.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;

      return {
        total_entries,
        active_entries,
        avg_effectiveness: Math.round(avg_effectiveness * 100) / 100,
        total_usage,
        recent_activity
      } as KnowledgeAnalytics;
    }
  });

  // Get unique brands and categories
  const brands = [...new Set(knowledgeEntries.map(entry => entry.brand))];
  const categories = [...new Set(knowledgeEntries.map(entry => entry.product_category))];

  // Bulk operations
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[], updates: Partial<KnowledgeEntry> }) => {
      const { error } = await supabase
        .from('knowledge_base_entries')
        .update(updates)
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-entries'] });
      setSelectedEntries([]);
      toast.success('Bulk update completed successfully');
    },
    onError: (error) => {
      toast.error('Bulk update failed: ' + error.message);
    }
  });

  const handleBulkActivate = () => {
    bulkUpdateMutation.mutate({ ids: selectedEntries, updates: { is_active: true } });
  };

  const handleBulkDeactivate = () => {
    bulkUpdateMutation.mutate({ ids: selectedEntries, updates: { is_active: false } });
  };

  const handleSelectAll = () => {
    if (selectedEntries.length === knowledgeEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(knowledgeEntries.map(entry => entry.id));
    }
  };

  const handleSelectEntry = (entryId: string) => {
    setSelectedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Analytics Dashboard */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold">{analytics.total_entries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{analytics.active_entries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Effectiveness</p>
                  <p className="text-2xl font-bold">{analytics.avg_effectiveness}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Usage</p>
                  <p className="text-2xl font-bold">{analytics.total_usage}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Recent Activity</p>
                  <p className="text-2xl font-bold">{analytics.recent_activity}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Knowledge Base Management</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search knowledge entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Operations */}
          {selectedEntries.length > 0 && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
              <span className="text-sm font-medium">
                {selectedEntries.length} entries selected
              </span>
              <Button size="sm" variant="outline" onClick={handleBulkActivate}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Activate
              </Button>
              <Button size="sm" variant="outline" onClick={handleBulkDeactivate}>
                <XCircle className="w-4 h-4 mr-1" />
                Deactivate
              </Button>
              <Button size="sm" variant="outline">
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Knowledge Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Knowledge Entries ({knowledgeEntries.length})</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedEntries.length === knowledgeEntries.length && knowledgeEntries.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {knowledgeEntries.map((entry) => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Checkbox
                        checked={selectedEntries.includes(entry.id)}
                        onCheckedChange={() => handleSelectEntry(entry.id)}
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant={entry.is_active ? "default" : "secondary"}>
                          {entry.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{entry.brand}</Badge>
                      </div>
                      
                      <div>
                        <p className="font-medium text-sm">{entry.product_category}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {entry.response_template}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Usage: {entry.usage_count || 0}</span>
                        <span>Score: {(entry.effectiveness_score || 0).toFixed(1)}</span>
                      </div>
                      
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entry.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {entry.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{entry.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedKnowledgeManager;
