
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Package, 
  Edit, 
  Eye, 
  Upload, 
  Save,
  X,
  Settings,
  Tag
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VariantManager } from './product-series/VariantManager';

interface ProductSeries {
  id: string;
  name: string;
  product_code: string;
  product_series: string;
  category: string;
  description: string;
  series_slug: string;
  is_active: boolean;
  variant_count: number;
  completion_rate: number;
  series_thumbnail_path?: string;
  series_model_path?: string;
  company_tags: string[];
  created_at: string;
  updated_at: string;
}

export const EnhancedProductSeriesManager = () => {
  const [series, setSeries] = useState<ProductSeries[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<ProductSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<ProductSeries | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showVariantManager, setShowVariantManager] = useState(false);
  const { toast } = useToast();

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    company_tags: [] as string[],
    series_thumbnail_path: ''
  });

  // New tag input
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchSeries();
  }, []);

  useEffect(() => {
    filterSeries();
  }, [series, searchTerm]);

  const fetchSeries = async () => {
    try {
      setLoading(true);
      
      const { data: seriesData, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_series_parent', true)
        .order('product_series', { ascending: true });

      if (error) throw error;

      // Calculate variant counts and completion rates
      const seriesWithStats = await Promise.all(
        (seriesData || []).map(async (s) => {
          const { count: variantCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('parent_series_id', s.id)
            .eq('is_active', true);

          const { data: variants } = await supabase
            .from('products')
            .select('thumbnail_path, model_path')
            .eq('parent_series_id', s.id)
            .eq('is_active', true);

          const completedVariants = variants?.filter(v => 
            v.thumbnail_path && v.model_path
          ).length || 0;

          const completionRate = variantCount ? Math.round((completedVariants / variantCount) * 100) : 0;

          return {
            ...s,
            variant_count: variantCount || 0,
            completion_rate: completionRate,
            company_tags: s.company_tags || []
          };
        })
      );

      setSeries(seriesWithStats);
    } catch (error) {
      console.error('Error fetching series:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product series",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSeries = () => {
    let filtered = series;

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.product_series.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSeries(filtered);
  };

  const handleEditSeries = (series: ProductSeries) => {
    setSelectedSeries(series);
    setEditForm({
      name: series.name,
      description: series.description || '',
      company_tags: series.company_tags || [],
      series_thumbnail_path: series.series_thumbnail_path || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedSeries) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editForm.name,
          description: editForm.description,
          company_tags: editForm.company_tags,
          series_thumbnail_path: editForm.series_thumbnail_path,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSeries.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Series updated successfully",
      });

      setIsEditDialogOpen(false);
      fetchSeries(); // Refresh the data to show updated names
    } catch (error) {
      console.error('Error updating series:', error);
      toast({
        title: "Error",
        description: "Failed to update series",
        variant: "destructive",
      });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editForm.company_tags.includes(newTag.trim())) {
      setEditForm(prev => ({
        ...prev,
        company_tags: [...prev.company_tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm(prev => ({
      ...prev,
      company_tags: prev.company_tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `series-thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setEditForm(prev => ({
        ...prev,
        series_thumbnail_path: publicUrl
      }));

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  const handleManageVariants = (series: ProductSeries) => {
    setSelectedSeries(series);
    setShowVariantManager(true);
  };

  const handleVariantManagerClose = () => {
    setShowVariantManager(false);
    setSelectedSeries(null);
    fetchSeries(); // Refresh data when variant manager closes
  };

  const handleViewSeries = (series: ProductSeries) => {
    // Navigate to product catalog or preview
    window.open(`/products/${series.series_slug}`, '_blank');
  };

  const handleManageAssets = (series: ProductSeries) => {
    // Open asset management dialog
    toast({
      title: "Asset Management",
      description: `Opening asset management for ${series.product_series}`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Series Management</h2>
          <p className="text-muted-foreground">
            Manage INNOSIN Lab product series, descriptions, and assets
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search series..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline">
              {filteredSeries.length} series found
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Series Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSeries.map((series) => (
          <Card key={series.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{series.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{series.category}</p>
                  </div>
                </div>
                <Badge variant={series.is_active ? "default" : "secondary"}>
                  {series.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Series Image */}
              {series.series_thumbnail_path && (
                <div className="w-full h-32 bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={series.series_thumbnail_path} 
                    alt={series.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {series.description || 'No description available'}
              </p>
              
              {/* Company Tags */}
              {series.company_tags && series.company_tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {series.company_tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Variants:</span>
                <Badge variant="outline">{series.variant_count}</Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion:</span>
                <Badge 
                  variant={series.completion_rate >= 80 ? "default" : 
                          series.completion_rate >= 50 ? "secondary" : "destructive"}
                >
                  {series.completion_rate}%
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditSeries(series)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManageVariants(series)}
                  className="flex items-center gap-1"
                >
                  <Settings className="h-3 w-3" />
                  Variants
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewSeries(series)}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManageAssets(series)}
                  className="flex items-center gap-1"
                >
                  <Upload className="h-3 w-3" />
                  Assets
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product Series</DialogTitle>
            <DialogDescription>
              Update series information and assets
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Series Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Company Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {editForm.company_tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Series Thumbnail</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {editForm.series_thumbnail_path && (
                  <img 
                    src={editForm.series_thumbnail_path} 
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Variant Manager */}
      {selectedSeries && (
        <VariantManager
          open={showVariantManager}
          onClose={handleVariantManagerClose}
          series={selectedSeries}
          onVariantsUpdated={fetchSeries}
        />
      )}
    </div>
  );
};
