
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
}

export const ProductSeriesManager = () => {
  const [series, setSeries] = useState<ProductSeries[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<ProductSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<ProductSeries | null>(null);
  const [showVariantManager, setShowVariantManager] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSeries();
  }, []);

  useEffect(() => {
    filterSeries();
  }, [series, searchTerm]);

  const fetchSeries = async () => {
    try {
      console.log('Fetching product series...');
      setLoading(true);
      setError(null);
      
      // Fetch series with variant counts
      const { data: seriesData, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          product_code,
          product_series,
          category,
          description,
          series_slug,
          is_active,
          series_thumbnail_path,
          series_model_path
        `)
        .eq('is_series_parent', true)
        .order('product_series', { ascending: true });

      if (error) {
        console.error('Error fetching series:', error);
        throw error;
      }

      console.log('Series data fetched:', seriesData);

      // Get variant counts for each series
      const seriesWithCounts = await Promise.all(
        (seriesData || []).map(async (s) => {
          const { count: variantCount, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('parent_series_id', s.id)
            .eq('is_active', true);

          if (countError) {
            console.error('Error counting variants for series:', s.id, countError);
          }

          // Get completion rate (variants with both thumbnail and model)
          const { data: variants, error: variantsError } = await supabase
            .from('products')
            .select('thumbnail_path, model_path')
            .eq('parent_series_id', s.id)
            .eq('is_active', true);

          if (variantsError) {
            console.error('Error fetching variants for completion rate:', s.id, variantsError);
          }

          const completedVariants = variants?.filter(v => 
            v.thumbnail_path && v.model_path
          ).length || 0;

          const completionRate = variantCount ? (completedVariants / variantCount) * 100 : 0;

          return {
            ...s,
            variant_count: variantCount || 0,
            completion_rate: Math.round(completionRate)
          };
        })
      );

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
      // First, delete all variants in this series
      const { error: variantsError } = await supabase
        .from('products')
        .delete()
        .eq('parent_series_id', seriesId);

      if (variantsError) throw variantsError;

      // Then delete the series itself
      const { error: seriesError } = await supabase
        .from('products')
        .delete()
        .eq('id', seriesId);

      if (seriesError) throw seriesError;

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
                  onClick={() => handleManageVariants(series)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Manage
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  View
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
    </div>
  );
};
