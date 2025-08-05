import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, Package, Edit, Eye, Upload, AlertCircle, Trash2, AlertTriangle } from 'lucide-react';
import { ProductSeriesFormDialog } from './ProductSeriesFormDialog';
import { VariantManager } from './VariantManager';
import { SeriesEditDialog } from './SeriesEditDialog';
import { useProductRealtime } from '@/hooks/useProductRealtime';
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
  variants: DatabaseVariant[];
}

export const ProductSeriesManager = () => {
  const [series, setSeries] = useState<ProductSeries[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<ProductSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<ProductSeries | null>(null);
  const [editingSeries, setEditingSeries] = useState<ProductSeries | null>(null);
  const [showVariantManager, setShowVariantManager] = useState(false);
  const { toast } = useToast();

  const fetchSeries = async () => {
    try {
      console.log('Fetching product series...');
      setLoading(true);
      setError(null);
      
      // Fetch all products
      const { data: products, error } = await supabase
        .from('products')
        .select(`*`)
        .order('product_series', { ascending: true });

      if (error) throw error;

      console.log('Products data fetched:', products);

      if (!products || products.length === 0) {
        setSeries([]);
        return;
      }

      // Group products by product_series
      const seriesMap = new Map<string, any[]>();
      
      products.forEach(product => {
        const seriesName = product.product_series;
        if (!seriesName) return;
        
        if (!seriesMap.has(seriesName)) {
          seriesMap.set(seriesName, []);
        }
        
        seriesMap.get(seriesName)!.push(product);
      });

      // Convert to ProductSeries format with variants
      const seriesWithCounts = Array.from(seriesMap.entries()).map(([seriesName, variants]) => {
        const activeVariants = variants.filter(v => v.is_active);
        const variantsWithAssets = variants.filter(v => v.thumbnail_path && v.model_path);
        const completionRate = variants.length > 0 ? Math.round((variantsWithAssets.length / variants.length) * 100) : 0;
        
        // Get series thumbnail from any variant that has series_thumbnail_path
        const seriesThumbnail = variants.find(p => p.series_thumbnail_path)?.series_thumbnail_path;
        
        // Map variants to DatabaseVariant format
        const mappedVariants: DatabaseVariant[] = variants.map(variant => ({
          id: variant.id,
          product_code: variant.product_code || '',
          name: variant.name || '',
          category: variant.category || '',
          dimensions: variant.dimensions,
          door_type: variant.door_type,
          orientation: variant.orientation,
          finish_type: variant.finish_type,
          mounting_type: variant.mounting_type,
          mixing_type: variant.mixing_type,
          handle_type: variant.handle_type,
          emergency_shower_type: variant.emergency_shower_type,
          drawer_count: variant.drawer_count,
          description: variant.description,
          thumbnail_path: variant.thumbnail_path,
          model_path: variant.model_path,
          is_active: variant.is_active || false
        }));

        return {
          id: variants[0]?.id || '',
          name: seriesName,
          product_code: variants[0]?.product_code || '',
          product_series: seriesName,
          category: variants[0]?.category || '',
          description: variants[0]?.description || '',
          series_slug: seriesName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim(),
          is_active: activeVariants.length > 0,
          variant_count: variants.length,
          completion_rate: completionRate,
          series_thumbnail_path: seriesThumbnail,
          series_model_path: variants[0]?.series_model_path,
          variants: mappedVariants
        };
      });

      console.log('Series with counts:', seriesWithCounts);
      setSeries(seriesWithCounts);
    } catch (error) {
      console.error('Error fetching series:', error);
      setError('Failed to fetch product series');
      toast({
        title: "Error",
        description: "Failed to fetch product series",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time updates
  useProductRealtime({
    onSeriesChange: fetchSeries,
    enabled: true
  });

  useEffect(() => {
    fetchSeries();
  }, []);

  useEffect(() => {
    filterSeries();
  }, [series, searchTerm]);

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

  const handleSeriesAdded = () => {
    console.log('Series added, refreshing list...');
    setShowAddDialog(false);
    fetchSeries();
    toast({
      title: "Success",
      description: "Product series created successfully",
    });
  };

  const handleSeriesUpdated = () => {
    console.log('Series updated, refreshing list...');
    setEditingSeries(null);
    fetchSeries();
    toast({
      title: "Success",
      description: "Product series updated successfully",
    });
  };

  const handleManageVariants = (series: ProductSeries) => {
    console.log('Managing variants for series:', series.id);
    setSelectedSeries(series);
    setShowVariantManager(true);
  };

  const handleVariantManagerClose = () => {
    console.log('Variant manager closed, refreshing series...');
    setShowVariantManager(false);
    setSelectedSeries(null);
    fetchSeries();
  };

  const handleDeleteSeries = async (seriesId: string, seriesName: string) => {
    try {
      // Delete all variants in this series by product_series
      const { error: variantsError } = await supabase
        .from('products')
        .delete()
        .eq('product_series', seriesName);

      if (variantsError) throw variantsError;

      // Log the activity
      await supabase
        .from('product_activity_log')
        .insert([{
          action: 'series_deleted',
          changed_by: 'admin',
          old_data: { id: seriesId, name: seriesName }
        }]);

      toast({
        title: "Success",
        description: "Product series and all its variants deleted successfully",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchSeries} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Series Management</h2>
          <p className="text-muted-foreground">
            Manage product series and their variants
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Series
        </Button>
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
                    <CardTitle className="text-lg">{series.product_series}</CardTitle>
                    <p className="text-sm text-muted-foreground">{series.category}</p>
                  </div>
                </div>
                <Badge variant={series.is_active ? "default" : "secondary"}>
                  {series.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {series.description}
              </p>
              
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

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSeries(series)}
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
                  <Package className="h-3 w-3" />
                  Variants
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Upload className="h-3 w-3" />
                  Assets
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Delete Series
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the series "{series.product_series}" and all its variants? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteSeries(series.id, series.product_series)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
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

      {selectedSeries && (
        <VariantManager
          open={showVariantManager}
          onClose={handleVariantManagerClose}
          series={selectedSeries}
          onVariantsUpdated={fetchSeries}
        />
      )}

      {editingSeries && (
        <SeriesEditDialog
          open={true}
          onClose={() => setEditingSeries(null)}
          series={editingSeries}
          onSeriesUpdated={handleSeriesUpdated}
        />
      )}
    </div>
  );
};
