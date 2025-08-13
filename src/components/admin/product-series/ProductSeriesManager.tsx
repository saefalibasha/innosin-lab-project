
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, Search, Plus, Eye, Edit, Settings, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VariantManager } from './VariantManager';
import ProductFormDialog from '../ProductFormDialog';
import ProductViewDialog from '../ProductViewDialog';

interface ProductSeries {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail_path: string;
  is_active: boolean;
  variant_count: number;
  expected_variant_count: number;
  completion_percentage: number;
  has_thumbnail: boolean;
  has_model: boolean;
}

export const ProductSeriesManager = () => {
  const [series, setSeries] = useState<ProductSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<ProductSeries | null>(null);
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isAddSeriesDialogOpen, setIsAddSeriesDialogOpen] = useState(false);

  useEffect(() => {
    fetchProductSeries();
  }, []);

  const fetchProductSeries = async () => {
    setLoading(true);
    try {
      // Fetch parent series (products where is_series_parent = true)
      const { data: parentSeries, error: parentError } = await supabase
        .from('products')
        .select('*')
        .eq('is_series_parent', true)
        .order('name');

      if (parentError) throw parentError;

      // For each parent series, count its variants and calculate completion
      const seriesWithStats = await Promise.all(
        (parentSeries || []).map(async (parent) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('parent_series_id', parent.id)
            .eq('is_series_parent', false);

          // Calculate completion percentage based on expected vs actual variant count
          const actualVariantCount = count || 0;
          const expectedVariantCount = parent.target_variant_count || 1;
          const hasSeriesThumbnail = !!parent.series_thumbnail_path;
          const hasSeriesModel = !!parent.series_model_path;
          const hasThumbnail = !!parent.thumbnail_path;
          const hasModel = !!parent.model_path;
          
          // Completion factors:
          // 1. Variant count (50% weight)
          // 2. Series assets (25% weight)
          // 3. Basic info completeness (25% weight)
          const variantCompletion = Math.min((actualVariantCount / expectedVariantCount) * 100, 100);
          const assetCompletion = ((hasSeriesThumbnail ? 50 : 0) + (hasSeriesModel ? 50 : 0));
          const infoCompletion = ((parent.description ? 50 : 0) + (parent.name ? 50 : 0));
          
          const completion_percentage = Math.round(
            (variantCompletion * 0.5) + (assetCompletion * 0.25) + (infoCompletion * 0.25)
          );

          return {
            id: parent.id,
            name: parent.name,
            category: parent.category,
            description: parent.description || '',
            thumbnail_path: parent.series_thumbnail_path || parent.thumbnail_path || '',
            is_active: parent.is_active,
            variant_count: actualVariantCount,
            expected_variant_count: expectedVariantCount,
            completion_percentage,
            has_thumbnail: hasSeriesThumbnail || hasThumbnail,
            has_model: hasSeriesModel || hasModel
          };
        })
      );

      setSeries(seriesWithStats);
    } catch (error) {
      console.error('Error fetching product series:', error);
      toast.error('Failed to load product series');
    } finally {
      setLoading(false);
    }
  };

  const filteredSeries = series.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleManageVariants = (seriesItem: ProductSeries) => {
    setSelectedSeries(seriesItem);
    setIsVariantDialogOpen(true);
  };

  const handleViewSeries = async (seriesItem: ProductSeries) => {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', seriesItem.id)
        .single();

      if (error) throw error;

      setSelectedProduct(product);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to load product details');
    }
  };

  const handleEditSeries = async (seriesItem: ProductSeries) => {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', seriesItem.id)
        .single();

      if (error) throw error;

      setSelectedProduct(product);
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to load product details');
    }
  };

  const handleUpdateExpectedVariants = async (seriesId: string, expectedCount: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ target_variant_count: expectedCount })
        .eq('id', seriesId);

      if (error) throw error;

      toast.success('Expected variant count updated');
      fetchProductSeries();
    } catch (error) {
      console.error('Error updating expected variant count:', error);
      toast.error('Failed to update expected variant count');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast.success('Product deleted successfully');
      fetchProductSeries();
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchProductSeries();
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Failed to update product status');
    }
  };

  const handleProductSaved = () => {
    fetchProductSeries();
    setIsEditDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleVariantsUpdated = () => {
    fetchProductSeries();
  };

  // Convert ProductSeries to Product format for dialogs
  const convertToProduct = (seriesItem: ProductSeries) => {
    return {
      id: seriesItem.id,
      name: seriesItem.name,
      category: seriesItem.category,
      description: seriesItem.description,
      thumbnail_path: seriesItem.thumbnail_path,
      is_active: seriesItem.is_active
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Product Series Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading product series...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Product Series Manager
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search product series..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setIsAddSeriesDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Series
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredSeries.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Product Series Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No series match your search criteria.' : 'Start by adding your first product series.'}
            </p>
            <Button onClick={() => setIsAddSeriesDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Series
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSeries.map((seriesItem) => (
              <Card key={seriesItem.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{seriesItem.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {seriesItem.category}
                      </p>
                    </div>
                    <Badge variant={seriesItem.is_active ? "default" : "secondary"}>
                      {seriesItem.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {seriesItem.description || 'No description available'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Variants</span>
                      <span className="font-medium">
                        {seriesItem.variant_count}/{seriesItem.expected_variant_count}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span>Expected</span>
                      <Input
                        type="number"
                        value={seriesItem.expected_variant_count}
                        onChange={(e) => handleUpdateExpectedVariants(seriesItem.id, parseInt(e.target.value) || 1)}
                        className="w-16 h-6 text-xs"
                        min="1"
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Completion</span>
                      <span className="font-medium">{seriesItem.completion_percentage}%</span>
                    </div>
                    <Progress value={seriesItem.completion_percentage} className="h-2" />
                  </div>

                  <div className="flex gap-1 text-xs">
                    <Badge variant={seriesItem.has_thumbnail ? "default" : "destructive"} className="text-xs">
                      {seriesItem.has_thumbnail ? "✓ Image" : "✗ Image"}
                    </Badge>
                    <Badge variant={seriesItem.has_model ? "default" : "destructive"} className="text-xs">
                      {seriesItem.has_model ? "✓ 3D" : "✗ 3D"}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewSeries(seriesItem)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditSeries(seriesItem)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleManageVariants(seriesItem)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Variants
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Variant Management Dialog */}
        <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Manage Variants - {selectedSeries?.name}
              </DialogTitle>
              <DialogDescription>
                Add, edit, or remove variants for this product series.
              </DialogDescription>
            </DialogHeader>
            {selectedSeries && (
              <VariantManager 
                seriesId={selectedSeries.id}
                onVariantsUpdated={handleVariantsUpdated}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Product View Dialog */}
        <ProductViewDialog
          isOpen={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          product={selectedProduct}
          onEdit={(product) => {
            setSelectedProduct(product);
            setIsViewDialogOpen(false);
            setIsEditDialogOpen(true);
          }}
          onDelete={handleDeleteProduct}
          onToggleStatus={handleToggleStatus}
        />

        {/* Product Edit Dialog */}
        <ProductFormDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          product={selectedProduct}
          onProductSaved={handleProductSaved}
        />

        {/* Add Series Dialog */}
        <ProductFormDialog
          isOpen={isAddSeriesDialogOpen}
          onOpenChange={setIsAddSeriesDialogOpen}
          product={null}
          onProductSaved={() => {
            fetchProductSeries();
            setIsAddSeriesDialogOpen(false);
          }}
        />
      </CardContent>
    </Card>
  );
};
