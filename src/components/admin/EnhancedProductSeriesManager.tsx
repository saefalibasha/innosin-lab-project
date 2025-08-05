import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { subscribeToProductUpdates } from '@/services/productService';
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
  AlertTriangle
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
  product_series: string;
  series_slug: string;
  category: string;
  description: string;
  is_active: boolean;
  variant_count: number;
  completion_rate: number;
  series_thumbnail_path?: string;
  variants: DatabaseVariant[];
}

interface DatabaseVariant {
  id: string;
  product_code: string;
  name: string;
  category: string;
  dimensions?: string;
  door_type?: string;
  orientation?: string;
  finish_type?: string;
  mounting_type?: string;
  mixing_type?: string;
  handle_type?: string;
  emergency_shower_type?: string;
  drawer_count?: number;
  description?: string;
  thumbnail_path?: string;
  model_path?: string;
  is_active: boolean;
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
    description: '',
    series_thumbnail_path: ''
  });

  useEffect(() => {
    fetchSeries();
  }, []);

  // Real-time updates subscription
  useEffect(() => {
    const subscription = subscribeToProductUpdates((payload) => {
      console.log('Product series update received:', payload);
      fetchSeries();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    filterSeries();
  }, [series, searchTerm, selectedBrand]);

  const generateSlug = (productSeries: string): string => {
    return productSeries
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const fetchSeries = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching products grouped by product_series...');
      
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('product_series', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      if (!products || products.length === 0) {
        console.log('⚠️ No products found in database');
        setSeries([]);
        toast({
          title: "No Data",
          description: "No products found in database",
          variant: "default",
        });
        return;
      }

      // Group products by product_series
      const seriesMap = new Map<string, DatabaseVariant[]>();
      
      products.forEach(product => {
        const seriesName = product.product_series;
        if (!seriesName) return;
        
        if (!seriesMap.has(seriesName)) {
          seriesMap.set(seriesName, []);
        }
        
        seriesMap.get(seriesName)!.push({
          id: product.id,
          product_code: product.product_code || '',
          name: product.name || '',
          category: product.category || '',
          dimensions: product.dimensions,
          door_type: product.door_type,
          orientation: product.orientation,
          finish_type: product.finish_type,
          mounting_type: product.mounting_type,
          mixing_type: product.mixing_type,
          handle_type: product.handle_type,
          emergency_shower_type: product.emergency_shower_type,
          drawer_count: product.drawer_count,
          description: product.description,
          thumbnail_path: product.thumbnail_path,
          model_path: product.model_path,
          is_active: product.is_active || false
        });
      });

      // Convert to ProductSeries format
      const seriesData: ProductSeries[] = Array.from(seriesMap.entries()).map(([seriesName, variants]) => {
        const activeVariants = variants.filter(v => v.is_active);
        const variantsWithAssets = variants.filter(v => v.thumbnail_path && v.model_path);
        const completionRate = variants.length > 0 ? Math.round((variantsWithAssets.length / variants.length) * 100) : 0;
        
        // Get series thumbnail from any variant that has series_thumbnail_path
        const seriesThumbnail = products.find(p => 
          p.product_series === seriesName && p.series_thumbnail_path
        )?.series_thumbnail_path;

        return {
          product_series: seriesName,
          series_slug: generateSlug(seriesName),
          category: variants[0]?.category || '',
          description: variants[0]?.description || '',
          is_active: activeVariants.length > 0,
          variant_count: variants.length,
          completion_rate: completionRate,
          series_thumbnail_path: seriesThumbnail,
          variants: variants
        };
      });

      setSeries(seriesData);
      console.log(`✅ Successfully loaded ${seriesData.length} product series grouped by product_series`);
      
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
        s.product_series.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.variants.some(v => 
          v.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedBrand !== 'all') {
      filtered = filtered.filter(s => s.category === selectedBrand);
    }

    setFilteredSeries(filtered);
  };

  const availableBrands = Array.from(new Set(series.map(s => s.category))).filter(Boolean).sort();

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
      description: series.description || '',
      series_thumbnail_path: series.series_thumbnail_path || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedSeries) return;

    try {
      // Update all products in this series with the new description and thumbnail
      const { error } = await supabase
        .from('products')
        .update({
          description: editForm.description,
          series_thumbnail_path: editForm.series_thumbnail_path,
          updated_at: new Date().toISOString()
        })
        .eq('product_series', selectedSeries.product_series);

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
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('product_series', series.product_series);

      if (error) throw error;

      await supabase
        .from('product_activity_log')
        .insert([{
          action: 'series_deleted',
          changed_by: 'admin',
          old_data: { 
            product_series: series.product_series,
            variant_count: series.variant_count,
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
            Manage product series grouped by product_series field - {series.length} series found
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
        {filteredSeries.map((seriesData) => (
          <Card key={seriesData.product_series} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{seriesData.product_series}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      <Tag className="h-3 w-3 inline mr-1" />
                      {seriesData.category}
                    </p>
                  </div>
                </div>
                <Badge variant={seriesData.is_active ? "default" : "secondary"}>
                  {seriesData.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {seriesData.series_thumbnail_path && (
                <div className="w-full h-32 bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={seriesData.series_thumbnail_path} 
                    alt={seriesData.product_series}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {seriesData.description || 'No description available'}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Variants:</span>
                <Badge variant="outline">{seriesData.variant_count}</Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion:</span>
                <Badge 
                  variant={seriesData.completion_rate >= 80 ? "default" : 
                          seriesData.completion_rate >= 50 ? "secondary" : "destructive"}
                >
                  {seriesData.completion_rate}%
                </Badge>
              </div>

              {/* Show some variant codes */}
              <div className="text-xs">
                <p className="text-muted-foreground mb-1">Variant Codes:</p>
                <div className="flex flex-wrap gap-1">
                  {seriesData.variants.slice(0, 3).map((variant) => (
                    <Badge key={variant.id} variant="outline" className="text-xs">
                      {variant.product_code}
                    </Badge>
                  ))}
                  {seriesData.variants.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{seriesData.variants.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditSeries(seriesData)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManageVariants(seriesData)}
                  className="flex items-center gap-1"
                >
                  <Settings className="h-3 w-3" />
                  Variants
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewSeries(seriesData)}
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
                        Are you sure you want to delete the series "{seriesData.product_series}" and all its variants? 
                        <br /><br />
                        <strong>This action cannot be undone.</strong>
                        <br /><br />
                        This will permanently delete:
                        <ul className="list-disc list-inside mt-2">
                          <li>All {seriesData.variant_count} variant(s) in this series</li>
                          <li>All associated product data</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteSeries(seriesData)}
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
            <DialogTitle>Edit Product Series: {selectedSeries?.product_series}</DialogTitle>
            <DialogDescription>
              Update series description and thumbnail. Changes will apply to all variants in this series.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
              <p className="text-xs text-muted-foreground">
                This image will be used on the main product catalog page.
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
