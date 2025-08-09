import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, Package, Edit, Eye, Upload, AlertCircle, Trash2, AlertTriangle, Filter, X } from 'lucide-react';
import { ProductSeriesFormDialog } from './ProductSeriesFormDialog';
import VariantManager from './VariantManager';
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
  number_of_drawers?: number;
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
  // Variant summary
  variant_properties: {
    categories: string[];
    dimensions: string[];
    door_types: string[];
    orientations: string[];
    finish_types: string[];
    mounting_types: string[];
    mixing_types: string[];
    handle_types: string[];
    emergency_shower_types: string[];
    drawer_counts: number[];
  };
}

interface FilterState {
  searchTerm: string;
  category: string;
  dimensions: string;
  door_type: string;
  orientation: string;
  finish_type: string;
  mounting_type: string;
  mixing_type: string;
  handle_type: string;
  emergency_shower_type: string;
  number_of_drawers: string;
  description: string;
}

export const ProductSeriesManager = () => {
  const [series, setSeries] = useState<ProductSeries[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<ProductSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    category: '',
    dimensions: '',
    door_type: '',
    orientation: '',
    finish_type: '',
    mounting_type: '',
    mixing_type: '',
    handle_type: '',
    emergency_shower_type: '',
    number_of_drawers: '',
    description: ''
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<ProductSeries | null>(null);
  const [editingSeries, setEditingSeries] = useState<ProductSeries | null>(null);
  const [showVariantManager, setShowVariantManager] = useState(false);
  const [filterOptions, setFilterOptions] = useState<{
    categories: string[];
    dimensions: string[];
    door_types: string[];
    orientations: string[];
    finish_types: string[];
    mounting_types: string[];
    mixing_types: string[];
    handle_types: string[];
    emergency_shower_types: string[];
    drawer_counts: string[];
  }>({
    categories: [],
    dimensions: [],
    door_types: [],
    orientations: [],
    finish_types: [],
    mounting_types: [],
    mixing_types: [],
    handle_types: [],
    emergency_shower_types: [],
    drawer_counts: []
  });
  const { toast } = useToast();

  const fetchSeries = async () => {
    try {
      console.log('Fetching product series...');
      setLoading(true);
      setError(null);
      
      // First check if we have any data at all
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      console.log('Total products count:', count);

      if (count === 0) {
        console.log('No products found in database');
        setSeries([]);
        setFilteredSeries([]);
        setLoading(false);
        return;
      }
      
      // Fetch all products
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('product_series', { ascending: true });

      if (error) throw error;

      console.log('Products data fetched:', products);

      if (!products || products.length === 0) {
        setSeries([]);
        setFilteredSeries([]);
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

      // Convert to ProductSeries format with variants and collect filter options
      const allFilterOptions = {
        categories: new Set<string>(),
        dimensions: new Set<string>(),
        door_types: new Set<string>(),
        orientations: new Set<string>(),
        finish_types: new Set<string>(),
        mounting_types: new Set<string>(),
        mixing_types: new Set<string>(),
        handle_types: new Set<string>(),
        emergency_shower_types: new Set<string>(),
        drawer_counts: new Set<string>()
      };

      const seriesWithCounts = Array.from(seriesMap.entries()).map(([seriesName, variants]) => {
        const activeVariants = variants.filter(v => v.is_active);
        const variantsWithAssets = variants.filter(v => v.thumbnail_path && v.model_path);
        const completionRate = variants.length > 0 ? Math.round((variantsWithAssets.length / variants.length) * 100) : 0;
        
        // Get series thumbnail from any variant that has series_thumbnail_path
        const seriesThumbnail = variants.find(p => p.series_thumbnail_path)?.series_thumbnail_path;
        
        // Map variants to DatabaseVariant format and collect filter options
        const mappedVariants: DatabaseVariant[] = variants.map(variant => {
          // Collect filter options
          if (variant.category) allFilterOptions.categories.add(variant.category);
          if (variant.dimensions) allFilterOptions.dimensions.add(variant.dimensions);
          if (variant.door_type) allFilterOptions.door_types.add(variant.door_type);
          if (variant.orientation) allFilterOptions.orientations.add(variant.orientation);
          if (variant.finish_type) allFilterOptions.finish_types.add(variant.finish_type);
          if (variant.mounting_type) allFilterOptions.mounting_types.add(variant.mounting_type);
          if (variant.mixing_type) allFilterOptions.mixing_types.add(variant.mixing_type);
          if (variant.handle_type) allFilterOptions.handle_types.add(variant.handle_type);
          if (variant.emergency_shower_type) allFilterOptions.emergency_shower_types.add(variant.emergency_shower_type);
          if (variant.number_of_drawers) allFilterOptions.drawer_counts.add(variant.number_of_drawers.toString());

          return {
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
            number_of_drawers: variant.number_of_drawers,
            description: variant.description,
            thumbnail_path: variant.thumbnail_path,
            model_path: variant.model_path,
            is_active: variant.is_active || false
          };
        });

        // Calculate variant properties for this series
        const seriesVariantProperties = {
          categories: [...new Set(mappedVariants.map(v => v.category).filter(Boolean))],
          dimensions: [...new Set(mappedVariants.map(v => v.dimensions).filter(Boolean))],
          door_types: [...new Set(mappedVariants.map(v => v.door_type).filter(Boolean))],
          orientations: [...new Set(mappedVariants.map(v => v.orientation).filter(Boolean))],
          finish_types: [...new Set(mappedVariants.map(v => v.finish_type).filter(Boolean))],
          mounting_types: [...new Set(mappedVariants.map(v => v.mounting_type).filter(Boolean))],
          mixing_types: [...new Set(mappedVariants.map(v => v.mixing_type).filter(Boolean))],
          handle_types: [...new Set(mappedVariants.map(v => v.handle_type).filter(Boolean))],
          emergency_shower_types: [...new Set(mappedVariants.map(v => v.emergency_shower_type).filter(Boolean))],
          drawer_counts: [...new Set(mappedVariants.map(v => v.number_of_drawers).filter(Boolean))]
        };

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
          variants: mappedVariants,
          variant_properties: seriesVariantProperties
        };
      });

      // Update filter options
      setFilterOptions({
        categories: Array.from(allFilterOptions.categories).sort(),
        dimensions: Array.from(allFilterOptions.dimensions).sort(),
        door_types: Array.from(allFilterOptions.door_types).sort(),
        orientations: Array.from(allFilterOptions.orientations).sort(),
        finish_types: Array.from(allFilterOptions.finish_types).sort(),
        mounting_types: Array.from(allFilterOptions.mounting_types).sort(),
        mixing_types: Array.from(allFilterOptions.mixing_types).sort(),
        handle_types: Array.from(allFilterOptions.handle_types).sort(),
        emergency_shower_types: Array.from(allFilterOptions.emergency_shower_types).sort(),
        drawer_counts: Array.from(allFilterOptions.drawer_counts).sort((a, b) => parseInt(a) - parseInt(b))
      });

      console.log('Series with counts:', seriesWithCounts);
      setSeries(seriesWithCounts);
    } catch (error) {
      console.error('Error fetching series:', error);
      setError('Failed to fetch product series. Please check your database connection.');
      toast({
        title: "Database Error",
        description: "Failed to fetch product series. This might be due to missing data or connectivity issues.",
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
  }, [series, filters]);

  const filterSeries = () => {
    let filtered = series;

    // Apply filters
    if (filters.searchTerm) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        s.product_series.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter(s => s.variant_properties.categories.includes(filters.category));
    }

    if (filters.dimensions) {
      filtered = filtered.filter(s => s.variant_properties.dimensions.includes(filters.dimensions));
    }

    if (filters.door_type) {
      filtered = filtered.filter(s => s.variant_properties.door_types.includes(filters.door_type));
    }

    if (filters.orientation) {
      filtered = filtered.filter(s => s.variant_properties.orientations.includes(filters.orientation));
    }

    if (filters.finish_type) {
      filtered = filtered.filter(s => s.variant_properties.finish_types.includes(filters.finish_type));
    }

    if (filters.mounting_type) {
      filtered = filtered.filter(s => s.variant_properties.mounting_types.includes(filters.mounting_type));
    }

    if (filters.mixing_type) {
      filtered = filtered.filter(s => s.variant_properties.mixing_types.includes(filters.mixing_type));
    }

    if (filters.handle_type) {
      filtered = filtered.filter(s => s.variant_properties.handle_types.includes(filters.handle_type));
    }

    if (filters.emergency_shower_type) {
      filtered = filtered.filter(s => s.variant_properties.emergency_shower_types.includes(filters.emergency_shower_type));
    }

    if (filters.number_of_drawers) {
      filtered = filtered.filter(s => s.variant_properties.drawer_counts.includes(parseInt(filters.number_of_drawers)));
    }

    if (filters.description) {
      filtered = filtered.filter(s => 
        s.description.toLowerCase().includes(filters.description.toLowerCase()) ||
        s.variants.some(v => v.description?.toLowerCase().includes(filters.description.toLowerCase()))
      );
    }

    setFilteredSeries(filtered);
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      category: '',
      dimensions: '',
      door_type: '',
      orientation: '',
      finish_type: '',
      mounting_type: '',
      mixing_type: '',
      handle_type: '',
      emergency_shower_type: '',
      number_of_drawers: '',
      description: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

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
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span>Loading product series...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={fetchSeries} variant="outline">
                Try Again
              </Button>
              <p className="text-sm text-muted-foreground">
                If this persists, try adding some sample data first.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
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

      {series.length > 0 && (
        <>
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search & Filter Variants
                </CardTitle>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="flex items-center gap-1">
                    <X className="h-3 w-3" />
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search series..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {filterOptions.categories.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Dimensions Filter */}
                <Select value={filters.dimensions} onValueChange={(value) => setFilters(prev => ({ ...prev, dimensions: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dimensions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Dimensions</SelectItem>
                    {filterOptions.dimensions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Door Type Filter */}
                <Select value={filters.door_type} onValueChange={(value) => setFilters(prev => ({ ...prev, door_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Door Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Door Types</SelectItem>
                    {filterOptions.door_types.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Orientation Filter */}
                <Select value={filters.orientation} onValueChange={(value) => setFilters(prev => ({ ...prev, orientation: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Orientations</SelectItem>
                    {filterOptions.orientations.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Finish Type Filter */}
                <Select value={filters.finish_type} onValueChange={(value) => setFilters(prev => ({ ...prev, finish_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Finish Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Finish Types</SelectItem>
                    {filterOptions.finish_types.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Mounting Type Filter */}
                <Select value={filters.mounting_type} onValueChange={(value) => setFilters(prev => ({ ...prev, mounting_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mounting Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Mounting Types</SelectItem>
                    {filterOptions.mounting_types.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Number of Drawers Filter */}
                <Select value={filters.number_of_drawers} onValueChange={(value) => setFilters(prev => ({ ...prev, number_of_drawers: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Drawer Count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Drawer Counts</SelectItem>
                    {filterOptions.drawer_counts.map(option => (
                      <SelectItem key={option} value={option}>{option} drawers</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Description Search */}
                <Input
                  placeholder="Search descriptions..."
                  value={filters.description}
                  onChange={(e) => setFilters(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <Badge variant="outline">
                  {filteredSeries.length} of {series.length} series shown
                </Badge>
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(filters).map(([key, value]) => 
                      value && (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key.replace('_', ' ')}: {value}
                        </Badge>
                      )
                    )}
                  </div>
                )}
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

                  {/* Variant Properties Summary */}
                  <div className="space-y-2 text-xs">
                    {series.variant_properties.finish_types.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-muted-foreground">Finishes:</span>
                        {series.variant_properties.finish_types.slice(0, 2).map(finish => (
                          <Badge key={finish} variant="outline" className="text-xs px-1 py-0">
                            {finish}
                          </Badge>
                        ))}
                        {series.variant_properties.finish_types.length > 2 && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            +{series.variant_properties.finish_types.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                    {series.variant_properties.drawer_counts.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-muted-foreground">Drawers:</span>
                        {series.variant_properties.drawer_counts.slice(0, 3).map(count => (
                          <Badge key={count} variant="outline" className="text-xs px-1 py-0">
                            {count}
                          </Badge>
                        ))}
                      </div>
                    )}
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
        </>
      )}

      {series.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-6 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Product Series Found</h3>
              <p className="mb-6 max-w-md mx-auto">
                It looks like there's no product data in your database yet. You can either add sample data to test the functionality or create your first product series manually.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  className="mx-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Series
                </Button>
                <p className="text-sm">
                  or use the "Seed Sample Data" button above to populate with test data
                </p>
              </div>
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
