import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { subscribeToProductUpdates, unsubscribeFromProductUpdates } from '@/services/productService';
import { 
  Search, 
  Package, 
  Edit, 
  Eye, 
  Upload, 
  Save,
  X,
  Settings,
  Tag,
  Plus,
  Trash2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { VariantManager } from './product-series/VariantManager';
import { ProductSeriesFormDialog } from './product-series/ProductSeriesFormDialog';
import { ProductSeriesFilter } from './product-series/ProductSeriesFilter';

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
  target_variant_count: number;
  series_thumbnail_path?: string;
  series_model_path?: string;
  series_overview_image_path?: string;
  company_tags: string[];
  created_at: string;
  updated_at: string;
}

export const EnhancedProductSeriesManager = () => {
  const [series, setSeries] = useState<ProductSeries[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<ProductSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedSeries, setSelectedSeries] = useState<ProductSeries | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showVariantManager, setShowVariantManager] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    company_tags: [] as string[],
    series_thumbnail_path: '',
    target_variant_count: 4
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchSeries();
    
    // Set up real-time subscription for product updates
    const subscription = subscribeToProductUpdates((payload) => {
      // Only refresh if it's a product series or variant change
      if (payload.new?.is_series_parent !== undefined || payload.new?.parent_series_id) {
        console.log('Product update detected, refreshing series data');
        fetchSeries();
      }
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribeFromProductUpdates(subscription);
    };
  }, []);

  useEffect(() => {
    filterSeries();
  }, [series, searchTerm, selectedBrand]);

  const fetchSeries = async () => {
    try {
      setLoading(true);
      
      const { data: seriesData, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_series_parent', true)
        .eq('is_active', true)
        .order('product_series', { ascending: true });

      if (error) throw error;

      const seriesWithStats = await Promise.all(
        (seriesData || []).map(async (s) => {
          const { count: variantCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('parent_series_id', s.id)
            .eq('is_active', true);

          const targetCount = s.target_variant_count || 4;
          const currentCount = variantCount || 0;
          
          const completionRate = targetCount > 0 ? Math.round((currentCount / targetCount) * 100) : 0;

          return {
            ...s,
            variant_count: currentCount,
            completion_rate: Math.min(completionRate, 100),
            target_variant_count: targetCount,
            company_tags: s.company_tags || []
          };
        })
      );

      setSeries(seriesWithStats);
      console.log(`Loaded ${seriesWithStats.length} product series with variants`);
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
        s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.company_tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedBrand !== 'all') {
      filtered = filtered.filter(s => 
        s.category === selectedBrand || 
        s.company_tags.includes(selectedBrand)
      );
    }

    setFilteredSeries(filtered);
  };

  const availableBrands = Array.from(new Set([
    ...series.map(s => s.category),
    ...series.flatMap(s => s.company_tags || [])
  ])).filter(Boolean).sort();

  const handleSeriesAdded = () => {
    console.log('Series added, refreshing list...');
    setShowAddDialog(false);
    fetchSeries();
    toast({
      title: "Success",
      description: "Product series created successfully",
    });
  };

  const handleEditSeries = (series: ProductSeries) => {
    setSelectedSeries(series);
    setEditForm({
      name: series.name,
      description: series.description || '',
      company_tags: series.company_tags || [],
      series_thumbnail_path: series.series_thumbnail_path || '',
      target_variant_count: series.target_variant_count || 4
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
          series_overview_image_path: editForm.series_thumbnail_path,
          target_variant_count: editForm.target_variant_count,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSeries.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Series updated successfully",
      });

      setIsEditDialogOpen(false);
      fetchSeries();
    } catch (error) {
      console.error('Error updating series:', error);
      toast({
        title: "Error",
        description: "Failed to update series",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSeries = async (series: ProductSeries) => {
    try {
      console.log('Deleting series:', series.product_series);
      
      const { error: variantsError } = await supabase
        .from('products')
        .delete()
        .eq('parent_series_id', series.id);

      if (variantsError) throw variantsError;

      const { error: seriesError } = await supabase
        .from('products')
        .delete()
        .eq('id', series.id);

      if (seriesError) throw seriesError;

      await supabase
        .from('product_activity_log')
        .insert([{
          action: 'series_deleted',
          changed_by: 'admin',
          old_data: { 
            id: series.id, 
            name: series.product_series,
            deleted_at: new Date().toISOString()
          }
        }]);

      toast({
        title: "Success",
        description: `Series "${series.product_series}" and all its variants deleted successfully`,
      });

      fetchSeries();
    } catch (error) {
      console.error('Error deleting series:', error);
      toast({
        title: "Error",
        description: "Failed to delete product series",
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
    fetchSeries();
  };

  const handleViewSeries = (series: ProductSeries) => {
    window.open(`/products/${series.series_slug}`, '_blank');
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
            Manage product series from all brands, descriptions, and assets
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Series
        </Button>
      </div>

      {/* Search and Filters */}
      <ProductSeriesFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedBrand={selectedBrand}
        onBrandChange={setSelectedBrand}
        totalCount={series.length}
        filteredCount={filteredSeries.length}
        availableBrands={availableBrands}
      />

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
              {(series.series_overview_image_path || series.series_thumbnail_path) && (
                <div className="w-full h-32 bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={series.series_overview_image_path || series.series_thumbnail_path} 
                    alt={series.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {series.description || 'No description available'}
              </p>
              
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
                <Badge variant="outline">{series.variant_count} / {series.target_variant_count}</Badge>
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Delete Product Series
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the series "{series.product_series}" and all its variants? 
                        <br /><br />
                        <strong>This action cannot be undone.</strong>
                        <br /><br />
                        This will permanently delete:
                        <ul className="list-disc list-inside mt-2">
                          <li>The series parent product</li>
                          <li>All {series.variant_count} variant(s) in this series</li>
                          <li>All associated product data</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteSeries(series)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        Delete Series
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSeries.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No product series found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowAddDialog(true)}
              >
                Create Your First Series
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ProductSeriesFormDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSeriesAdded={handleSeriesAdded}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product Series</DialogTitle>
            <DialogDescription>
              Update series information and assets. The uploaded thumbnail will be used as the series overview image.
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
              <Label htmlFor="image">Series Thumbnail & Overview Image</Label>
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
              <p className="text-xs text-muted-foreground">
                This image will be used as both the series thumbnail and the overview image on the product catalog.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_variant_count">Expected Number of Variants</Label>
              <Input
                id="target_variant_count"
                type="number"
                min="1"
                max="20"
                value={editForm.target_variant_count}
                onChange={(e) => setEditForm(prev => ({ ...prev, target_variant_count: parseInt(e.target.value) || 4 }))}
                placeholder="4"
              />
              <p className="text-xs text-muted-foreground">
                How many variants do you plan to create for this series?
              </p>
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
