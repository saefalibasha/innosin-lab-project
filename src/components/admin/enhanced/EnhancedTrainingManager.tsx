
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
  Loader2,
  AlertCircle,
  MessageSquare
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

interface TrainingEntry {
  id: string;
  intent: string;
  example_inputs: string[];
  response_template: string;
  category: string;
  confidence_threshold: number;
  priority: number;
  is_active: boolean;
  performance_score: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

const EnhancedTrainingManager = () => {
  const [entries, setEntries] = useState<TrainingEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<TrainingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    intent: '',
    example_inputs: '',
    response_template: '',
    category: '',
    confidence_threshold: 0.8,
    priority: 1,
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, filterCategory]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('training_data_entries')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching training entries:', error);
      toast({
        title: "Error",
        description: "Failed to load training data entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = entries.filter(entry => {
      const matchesSearch = 
        entry.intent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.example_inputs.some(input => input.toLowerCase().includes(searchTerm.toLowerCase())) ||
        entry.response_template.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || entry.category === filterCategory;

      return matchesSearch && matchesCategory && entry.is_active;
    });

    setFilteredEntries(filtered);
  };

  const handleSave = async (entryId?: string) => {
    try {
      const exampleInputsArray = formData.example_inputs
        .split('\n')
        .map(input => input.trim())
        .filter(input => input);

      const entryData = {
        intent: formData.intent,
        example_inputs: exampleInputsArray,
        response_template: formData.response_template,
        category: formData.category,
        confidence_threshold: formData.confidence_threshold,
        priority: formData.priority,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (entryId) {
        const { error } = await supabase
          .from('training_data_entries')
          .update(entryData)
          .eq('id', entryId);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Training entry updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('training_data_entries')
          .insert([entryData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Training entry created successfully",
        });
      }

      setEditingEntry(null);
      setFormData({
        intent: '',
        example_inputs: '',
        response_template: '',
        category: '',
        confidence_threshold: 0.8,
        priority: 1,
      });
      fetchEntries();
    } catch (error) {
      console.error('Error saving training entry:', error);
      toast({
        title: "Error",
        description: "Failed to save training entry",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (entry: TrainingEntry) => {
    setEditingEntry(entry.id);
    setFormData({
      intent: entry.intent,
      example_inputs: entry.example_inputs.join('\n'),
      response_template: entry.response_template,
      category: entry.category || '',
      confidence_threshold: entry.confidence_threshold,
      priority: entry.priority,
    });
  };

  const handleDelete = async () => {
    if (!entryToDelete) return;

    try {
      const { error } = await supabase
        .from('training_data_entries')
        .delete()
        .eq('id', entryToDelete);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training entry deleted successfully",
      });
      
      fetchEntries();
    } catch (error) {
      console.error('Error deleting training entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete training entry",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
    }
  };

  const uniqueCategories = [...new Set(entries.map(e => e.category).filter(Boolean))];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading training data entries...</span>
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
            <span>Training Data Entries ({filteredEntries.length})</span>
            <Button onClick={() => setEditingEntry('new')} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Training Data
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search training data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
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
          </div>
        </CardContent>
      </Card>

      {/* Entry Form */}
      {editingEntry && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEntry === 'new' ? 'Add New Training Data' : 'Edit Training Data'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Intent</label>
                <Input
                  placeholder="e.g., product_inquiry, pricing_question"
                  value={formData.intent}
                  onChange={(e) => setFormData({...formData, intent: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Input
                  placeholder="Category (optional)"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Example Inputs (one per line)</label>
              <Textarea
                placeholder="What products do you offer?&#10;Tell me about your lab equipment&#10;I need information about your products"
                value={formData.example_inputs}
                onChange={(e) => setFormData({...formData, example_inputs: e.target.value})}
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Response Template</label>
              <Textarea
                placeholder="Enter the response template that should be used for this intent..."
                value={formData.response_template}
                onChange={(e) => setFormData({...formData, response_template: e.target.value})}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingEntry(null);
                  setFormData({
                    intent: '',
                    example_inputs: '',
                    response_template: '',
                    category: '',
                    confidence_threshold: 0.8,
                    priority: 1,
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
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No training data found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterCategory !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first training data entry'
                }
              </p>
              {!searchTerm && filterCategory === 'all' && (
                <Button onClick={() => setEditingEntry('new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Entry
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{entry.intent}</Badge>
                      {entry.category && <Badge variant="outline">{entry.category}</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
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
                    <p className="text-sm text-muted-foreground mb-1">Example Inputs:</p>
                    <div className="space-y-1">
                      {entry.example_inputs.slice(0, 3).map((input, idx) => (
                        <p key={idx} className="text-sm bg-muted p-2 rounded">
                          "{input}"
                        </p>
                      ))}
                      {entry.example_inputs.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{entry.example_inputs.length - 3} more examples
                        </p>
                      )}
                    </div>
                  </div>
                  
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
                      <span className="text-muted-foreground">Performance:</span>
                      <span className="ml-2 font-medium">{entry.performance_score.toFixed(2)}</span>
                    </div>
                  </div>
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
              This action cannot be undone. This will permanently delete the training data entry.
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

export default EnhancedTrainingManager;
