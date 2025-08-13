
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, 
  ChevronDown, 
  ChevronRight, 
  Image, 
  Box,
  Edit,
  Eye,
  AlertTriangle,
  Settings
} from 'lucide-react';
import VariantManager from './VariantManager';

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
}

export const ProductSeriesManager: React.FC = () => {
  const [series, setSeries] = useState<ProductSeries[]>([]);
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState<ProductSeries | null>(null);
  const [isVariantManagerOpen, setIsVariantManagerOpen] = useState(false);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProductSeries();
  }, []);

  const fetchProductSeries = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching product series from database...');
      
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('product_series', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      if (!products || products.length === 0) {
        console.log('⚠️ No products found in database');
        setSeries([]);
        setIsUsingMockData(true);
        
        toast({
          title: "No Data",
          description: "No products found in database",
          variant: "default",
        });
        return;
      }

      // Group products by series
      const seriesMap = new Map<string, any[]>();
      
      products.forEach(product => {
        const seriesName = product.product_series || 'Uncategorized';
        
        if (!seriesMap.has(seriesName)) {
          seriesMap.set(seriesName, []);
        }
        seriesMap.get(seriesName)!.push(product);
      });

      // Calculate series statistics and create ProductSeries objects
      const seriesData: ProductSeries[] = Array.from(seriesMap.entries()).map(([name, seriesProducts]) => {
        // Find the series parent (if any)
        const seriesParent = seriesProducts.find(p => p.is_series_parent);
        const variants = seriesProducts.filter(p => !p.is_series_parent);
        
        const totalVariants = variants.length;
        const activeVariants = variants.filter(p => p.is_active).length;
        const variantsWithAssets = variants.filter(p => p.thumbnail_path || p.model_path).length;
        const completionRate = totalVariants > 0 ? (variantsWithAssets / totalVariants) * 100 : 0;

        return {
          id: seriesParent?.id || seriesProducts[0]?.id || '',
          name: seriesParent?.name || name,
          product_code: seriesParent?.product_code || '',
          product_series: name,
          category: seriesParent?.category || seriesProducts[0]?.category || '',
          description: seriesParent?.description || '',
          series_slug: seriesParent?.series_slug || name.toLowerCase().replace(/\s+/g, '-'),
          is_active: seriesParent?.is_active !== undefined ? seriesParent.is_active : true,
          variant_count: totalVariants,
          completion_rate: completionRate,
          series_thumbnail_path: seriesParent?.series_thumbnail_path,
          series_model_path: seriesParent?.series_model_path,
          variants: variants.map(v => ({
            id: v.id,
            product_code: v.product_code || '',
            name: v.name,
            category: v.category,
            dimensions: v.dimensions,
            door_type: v.door_type,
            orientation: v.orientation,
            finish_type: v.finish_type,
            mounting_type: v.mounting_type,
            mixing_type: v.mixing_type,
            handle_type: v.handle_type,
            emergency_shower_type: v.emergency_shower_type,
            number_of_drawers: v.number_of_drawers,
            description: v.description,
            thumbnail_path: v.thumbnail_path,
            model_path: v.model_path,
            is_active: v.is_active !== undefined ? v.is_active : true
          }))
        };
      });

      setSeries(seriesData);
      setIsUsingMockData(false);
      console.log(`✅ Successfully loaded ${seriesData.length} product series from database`);
      
    } catch (error) {
      console.error('Error fetching product series:', error);
      setSeries([]);
      setIsUsingMockData(true);
      
      toast({
        title: "Connection Issue",
        description: "Failed to load product series from database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSeries = (seriesName: string) => {
    const newExpanded = new Set(expandedSeries);
    if (newExpanded.has(seriesName)) {
      newExpanded.delete(seriesName);
    } else {
      newExpanded.add(seriesName);
    }
    setExpandedSeries(newExpanded);
  };

  const handleManageVariants = (seriesData: ProductSeries) => {
    setSelectedSeries(seriesData);
    setIsVariantManagerOpen(true);
  };

  const handleVariantsUpdated = () => {
    fetchProductSeries();
  };

  const getSeriesStatusColor = (completionRate: number) => {
    if (completionRate >= 80) return 'bg-green-500';
    if (completionRate >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading product series...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Indicator */}
      {isUsingMockData && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <h4 className="font-medium text-amber-800">No Data Found</h4>
                <p className="text-sm text-amber-700">
                  No products found in database. Please add products using the bulk upload feature or create them manually.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{series.length}</div>
            <div className="text-sm text-muted-foreground">Product Series</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {series.reduce((acc, s) => acc + s.variants.filter(v => v.is_active).length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Active Variants</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {series.reduce((acc, s) => acc + s.variants.filter(v => v.thumbnail_path || v.model_path).length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">With Assets</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(series.reduce((acc, s) => acc + s.completion_rate, 0) / series.length || 0)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Completion</div>
          </CardContent>
        </Card>
      </div>

      {/* Series List */}
      <div className="space-y-4">
        {series.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No Product Series Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by uploading products or creating them manually.
              </p>
            </CardContent>
          </Card>
        ) : (
          series.map((seriesData) => (
            <Card key={seriesData.product_series} className="overflow-hidden">
              <Collapsible
                open={expandedSeries.has(seriesData.product_series)}
                onOpenChange={() => toggleSeries(seriesData.product_series)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedSeries.has(seriesData.product_series) ? 
                          <ChevronDown className="h-5 w-5" /> : 
                          <ChevronRight className="h-5 w-5" />
                        }
                        <Package className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{seriesData.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {seriesData.variant_count} variants • {seriesData.variants.filter(v => v.is_active).length} active
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleManageVariants(seriesData);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          Manage Variants
                        </Button>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {Math.round(seriesData.completion_rate)}% Complete
                          </div>
                          <Progress value={seriesData.completion_rate} className="w-20" />
                        </div>
                        <Badge 
                          className={`${getSeriesStatusColor(seriesData.completion_rate)} text-white`}
                        >
                          {seriesData.variants.filter(v => v.thumbnail_path || v.model_path).length}/{seriesData.variant_count}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {seriesData.variants.map((variant) => (
                        <Card key={variant.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{variant.name}</h4>
                                <p className="text-sm text-muted-foreground">{variant.product_code}</p>
                              </div>
                              <Badge variant={variant.is_active ? "default" : "secondary"}>
                                {variant.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Image className="h-3 w-3" />
                                <span className={variant.thumbnail_path ? 'text-green-600' : 'text-red-600'}>
                                  {variant.thumbnail_path ? 'Image' : 'No Image'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Box className="h-3 w-3" />
                                <span className={variant.model_path ? 'text-green-600' : 'text-red-600'}>
                                  {variant.model_path ? '3D Model' : 'No Model'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>

      {/* Variant Manager Dialog */}
      {selectedSeries && (
        <VariantManager
          open={isVariantManagerOpen}
          onClose={() => {
            setIsVariantManagerOpen(false);
            setSelectedSeries(null);
          }}
          series={selectedSeries}
          onVariantsUpdated={handleVariantsUpdated}
        />
      )}
    </div>
  );
};
