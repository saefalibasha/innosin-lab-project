
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Filter,
  ArrowUpDown,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface KnowledgeEntry {
  id: string;
  brand: string;
  product_category: string;
  keywords: string[];
  response_template: string;
  confidence_threshold: number;
  priority: number;
  is_active: boolean;
  tags: string[];
  usage_count: number;
  effectiveness_score: number;
  created_at: string;
  updated_at: string;
}

const EnhancedKnowledgeManager = () => {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    brand: '',
    product_category: '',
    keywords: '',
    response_template: '',
    confidence_threshold: 0.7,
    priority: 1,
    tags: '',
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    filterAndSortEntries();
  }, [entries, searchTerm, filterBrand, filterCategory, sortBy, sortOrder, showInactive]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('knowledge_base_entries')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching knowledge entries:', error);
      toast({
        title: "Error",
        description: "Failed to load knowledge base entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortEntries = () => {
    let filtered = entries.filter(entry => {
      const matchesSearch = 
        entry.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.product_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase())) ||
        entry.response_template.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBrand = filterBrand === 'all' || entry.brand === filterBrand;
      const matchesCategory = filterCategory === 'all' || entry.product_category === filterCategory;
      const matchesActive = showInactive || entry.is_active;

      return matchesSearch && matchesBrand && matchesCategory && matchesActive;
    });

    // Sort entries
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'brand':
          aValue = a.brand;
          bValue = b.brand;
          break;
        case 'category':
          aValue = a.product_category;
          bValue = b.product_category;
          break;
        case 'priority':
          aValue = a.priority;
          bValue = b.priority;
          break;
        case 'effectiveness':
          aValue = a.effectiveness_score;
          bValue = b.effectiveness_score;
          break;
        case 'usage':
          aValue = a.usage_count;
          bValue = b.usage_count;
          break;
        default:
          aValue = a.updated_at;
          bValue = b.updated_at;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredEntries(filtered);
  };

  const handleSave = async (entryId?: string) => {
    try {
      const keywordsArray = formData.keywords.split(',').map(k => k.trim()).filter(k => k);
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);

      const entryData = {
        brand: formData.brand,
        product_category: formData.product_category,
        keywords: keywordsArray,
        response_template: formData.response_template,
        confidence_threshold: formData.confidence_threshold,
        priority: formData.priority,
        tags: tagsArray,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (entryId) {
        // Update existing entry
        const { error } = await supabase
          .from('knowledge_base_entries')
          .update(entryData)
          .eq('id', entryId);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Knowledge entry updated successfully",
        });
      } else {
        // Create new entry
        const { error } = await supabase
          .from('knowledge_base_entries')
          .insert([entryData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Knowledge entry created successfully",
        });
      }

      setEditingEntry(null);
      setFormData({
        brand: '',
        product_category: '',
        keywords: '',
        response_template: '',
        confidence_threshold: 0.7,
        priority: 1,
        tags: '',
      });
      fetchEntries();
    } catch (error) {
      console.error('Error saving knowledge entry:', error);
      toast({
        title: "Error",
        description: "Failed to save knowledge entry",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (entry: KnowledgeEntry) => {
    setEditingEntry(entry.id);
    setFormData({
      brand: entry.brand,
      product_category: entry.product_category,
      keywords: entry.keywords.join(', '),
      response_template: entry.response_template,
      confidence_threshold: entry.confidence_threshold,
      priority: entry.priority,
      tags: entry.tags.join(', '),
    });
  };

  const handleDelete = async () => {
    if (!entryToDelete) return;

    try {
      const { error } = await supabase
        .from('knowledge_base_entries')
        .delete()
        .eq('id', entryToDelete);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Knowledge entry deleted successfully",
      });
      
      fetchEntries();
    } catch (error) {
      console.error('Error deleting knowledge entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete knowledge entry",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
    }
  };

  const toggleEntryStatus = async (entryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('knowledge_base_entries')
        .update({ is_active: !currentStatus })
        .eq('id', entryId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Entry ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
      
      fetchEntries();
    } catch (error) {
      console.error('Error toggling entry status:', error);
      toast({
        title: "Error",
        description: "Failed to update entry status",
        variant: "destructive",
      });
    }
  };

  const uniqueBrands = [...new Set(entries.map(e => e.brand))];
  const uniqueCategories = [...new Set(entries.map(e => e.product_category))];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading knowledge base entries...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Knowledge Base Entries ({filteredEntries.length})</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInactive(!showInactive)}
              >
                {showInactive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showInactive ? 'Hide Inactive' : 'Show Inactive'}
              </Button>
              <Button onClick={() => setEditingEntry('new')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterBrand} onValueChange={setFilterBrand}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {uniqueBrands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated_at-desc">Latest Updated</SelectItem>
                <SelectItem value="updated_at-asc">Oldest Updated</SelectItem>
                <SelectItem value="brand-asc">Brand A-Z</SelectItem>
                <SelectItem value="brand-desc">Brand Z-A</SelectItem>
                <SelectItem value="priority-desc">Priority High-Low</SelectItem>
                <SelectItem value="priority-asc">Priority Low-High</SelectItem>
                <SelectItem value="effectiveness-desc">Most Effective</SelectItem>
                <SelectItem value="usage-desc">Most Used</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Entry Form */}
      {editingEntry && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEntry === 'new' ? 'Add New Knowledge Entry' : 'Edit Knowledge Entry'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Brand</label>
                <Input
                  placeholder="Brand name"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Product Category</label>
                <Input
                  placeholder="Product category"
                  value={formData.product_category}
                  onChange={(e) => setFormData({...formData, product_category: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Keywords (comma-separated)</label>
              <Input
                placeholder="keyword1, keyword2, keyword3"
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Response Template</label>
              <Textarea
                placeholder="Enter the response template..."
                value={formData.response_template}
                onChange={(e) => setFormData({...formData, response_template: e.target.value})}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Confidence Threshold</label>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.confidence_threshold}
                  onChange={(e) => setFormData({...formData, confidence_threshold: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
                <Input
                  placeholder="tag1, tag2, tag3"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingEntry(null);
                  setFormData({
                    brand: '',
                    product_category: '',
                    keywords: '',
                    response_template: '',
                    confidence_threshold: 0.7,
                    priority: 1,
                    tags: '',
                  });
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={() => handleSave(editingEntry === 'new' ? undefined : editingEntry)}>
                <Save className="h-4 w-4 mr-2" />
                Save Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No entries found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterBrand !== 'all' || filterCategory !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first knowledge entry'
                }
              </p>
              {!searchTerm && filterBrand === 'all' && filterCategory === 'all' && (
                <Button onClick={() => setEditingEntry('new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Entry
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card key={entry.id} className={`${!entry.is_active ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{entry.brand}</Badge>
                      <Badge variant="outline">{entry.product_category}</Badge>
                      {!entry.is_active && <Badge variant="destructive">Inactive</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entry.keywords.slice(0, 5).map((keyword, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {entry.keywords.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{entry.keywords.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleEntryStatus(entry.id, entry.is_active)}
                    >
                      {entry.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEntryToDelete(entry.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Response Template:</p>
                    <p className="text-sm bg-muted p-3 rounded-md">
                      {entry.response_template.length > 200 
                        ? `${entry.response_template.substring(0, 200)}...` 
                        : entry.response_template
                      }
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Priority:</span>
                      <span className="ml-2 font-medium">{entry.priority}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="ml-2 font-medium">{entry.confidence_threshold}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Usage:</span>
                      <span className="ml-2 font-medium">{entry.usage_count}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Effectiveness:</span>
                      <span className="ml-2 font-medium">{entry.effectiveness_score.toFixed(2)}</span>
                    </div>
                  </div>

                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the knowledge entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EnhancedKnowledgeManager;
