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
  TrendingUp, 
  Image, 
  Box,
  Edit,
  Eye,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import ProductFormDialog from './ProductFormDialog';
import ProductViewDialog from './ProductViewDialog';
import { mockAdminSeries } from '@/data/mockProducts';
import { Product } from '@/types/product';
import { DatabaseProduct } from '@/types/supabase';

// Transform any database object to proper DatabaseProduct with defaults
const ensureDatabaseProduct = (rawProduct: any): DatabaseProduct => {
  return {
    id: rawProduct.id || '',
    name: rawProduct.name || '',
    category: rawProduct.category || '',
    dimensions: rawProduct.dimensions || '',
    model_path: rawProduct.model_path || rawProduct.modelPath || '',
    thumbnail_path: rawProduct.thumbnail_path || rawProduct.thumbnail || '',
    additional_images: rawProduct.additional_images || rawProduct.images || [],
    description: rawProduct.description || '',
    full_description: rawProduct.full_description || rawProduct.fullDescription || '',
    specifications: rawProduct.specifications || [],
    finish_type: rawProduct.finish_type || '',
    orientation: rawProduct.orientation || '',
    door_type: rawProduct.door_type || '',
    variant_type: rawProduct.variant_type || '',
    drawer_count: rawProduct.number_of_drawers || rawProduct.drawer_count || 0,
    cabinet_class: rawProduct.cabinet_class || 'standard',
    product_code: rawProduct.product_code || '',
    mounting_type: rawProduct.mounting_type || '',
    mixing_type: rawProduct.mixing_type || '',
    handle_type: rawProduct.handle_type || '',
    emergency_shower_type: rawProduct.emergency_shower_type || '',
    company_tags: rawProduct.company_tags || [],
    product_series: rawProduct.product_series || '',
    parent_series_id: rawProduct.parent_series_id || '',
    is_series_parent: rawProduct.is_series_parent || false,
    is_active: rawProduct.is_active !== undefined ? rawProduct.is_active : true,
    series_model_path: rawProduct.series_model_path || '',
    series_thumbnail_path: rawProduct.series_thumbnail_path || '',
    series_overview_image_path: rawProduct.series_overview_image_path || '',
    overview_image_path: rawProduct.overview_image_path || '',
    series_order: rawProduct.series_order || 0,
    variant_order: rawProduct.variant_order || 0,
    created_at: rawProduct.created_at || '',
    updated_at: rawProduct.updated_at || '',
    editable_title: rawProduct.editable_title || rawProduct.name || '',
    editable_description: rawProduct.editable_description || rawProduct.description || ''
  };
};

const transformDatabaseProduct = (dbProduct: DatabaseProduct): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category,
    dimensions: dbProduct.dimensions || '',
    modelPath: dbProduct.model_path || '',
    thumbnail: dbProduct.series_thumbnail_path || dbProduct.thumbnail_path || '',
    overviewImage: dbProduct.overview_image_path,
    seriesOverviewImage: dbProduct.series_overview_image_path,
    images: dbProduct.additional_images || [],
    description: dbProduct.editable_description || dbProduct.description || '',
    fullDescription: dbProduct.editable_description || dbProduct.full_description || dbProduct.description || '',
    specifications: Array.isArray(dbProduct.specifications) ? dbProduct.specifications : [],
    // Enhanced fields for Innosin Lab products
    finishes: [],
    variants: [],
    baseProductId: dbProduct.parent_series_id,
    // Database variant fields
    finish_type: dbProduct.finish_type,
    orientation: dbProduct.orientation,
    drawer_count: dbProduct.drawer_count || 0,
    door_type: dbProduct.door_type,
    product_code: dbProduct.product_code || '',
    thumbnail_path: dbProduct.thumbnail_path,
    model_path: dbProduct.model_path,
    // New variant fields for specific product types
    mounting_type: dbProduct.mounting_type,
    mixing_type: dbProduct.mixing_type,
    handle_type: dbProduct.handle_type,
    emergency_shower_type: dbProduct.emergency_shower_type,
    cabinet_class: dbProduct.cabinet_class || 'standard',
    company_tags: dbProduct.company_tags || [],
    product_series: dbProduct.product_series,
    // Series relationship fields - note: these are not part of Product interface
    parent_series_id: dbProduct.parent_series_id,
    // Admin editable fields
    editable_title: dbProduct.editable_title,
    editable_description: dbProduct.editable_description,
    // Timestamps
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
    is_active: dbProduct.is_active
  };
};

interface ProductSeries {
  name: string;
  products: Product[];
  totalProducts: number;
  activeProducts: number;
  completionRate: number;
  hasAssets: number;
}

interface ProductSeriesManagerProps {
  onProductSelect?: (product: Product) => void;
  onProductEdit?: (product: Product) => void;
}

export const ProductSeriesManager: React.FC<ProductSeriesManagerProps> = ({
  onProductSelect,
  onProductEdit
}) => {
  const [series, setSeries] = useState<ProductSeries[]>([]);
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
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
        console.log('⚠️ No products found in database, using mock data');
        // Transform mock data to proper Product type
        const transformedMockSeries = mockAdminSeries.map(series => ({
          ...series,
          products: series.products.map(product => {
            // Transform each mock product through the proper transformation pipeline
            const dbProduct = ensureDatabaseProduct(product);
            return transformDatabaseProduct(dbProduct);
          })
        }));
        setSeries(transformedMockSeries);
        setIsUsingMockData(true);
        
        toast({
          title: "Development Mode",
          description: "Using sample data - database connection unavailable",
          variant: "default",
        });
        return;
      }

      // Group products by series and properly transform them
      const seriesMap = new Map<string, Product[]>();
      
      products.forEach(rawProduct => {
        // First ensure we have a proper DatabaseProduct
        const dbProduct = ensureDatabaseProduct(rawProduct);
        // Then transform it to the Product interface
        const transformedProduct = transformDatabaseProduct(dbProduct);
        const seriesName = transformedProduct.product_series || 'Uncategorized';
        
        if (!seriesMap.has(seriesName)) {
          seriesMap.set(seriesName, []);
        }
        seriesMap.get(seriesName)!.push(transformedProduct);
      });

      // Calculate series statistics and create ProductSeries objects
      const seriesData: ProductSeries[] = Array.from(seriesMap.entries()).map(([name, transformedProducts]) => {
        const totalProducts = transformedProducts.length;
        const activeProducts = transformedProducts.filter(p => p.is_active).length;
        const hasAssets = transformedProducts.filter(p => p.thumbnail_path || p.model_path).length;
        const completionRate = totalProducts > 0 ? (hasAssets / totalProducts) * 100 : 0;

        return {
          name,
          products: transformedProducts, // These are now properly transformed Product objects
          totalProducts,
          activeProducts,
          completionRate,
          hasAssets
        };
      });

      setSeries(seriesData);
      setIsUsingMockData(false);
      console.log(`✅ Successfully loaded ${seriesData.length} product series from database`);
      
    } catch (error) {
      console.error('Error fetching product series:', error);
      
      // Fallback to mock data - transform it properly to Product type
      console.log('🔄 Falling back to mock data due to error');
      const transformedMockSeries = mockAdminSeries.map(series => ({
        ...series,
        products: series.products.map(product => {
          // Transform each mock product through the proper transformation pipeline
          const dbProduct = ensureDatabaseProduct(product);
          return transformDatabaseProduct(dbProduct);
        })
      }));
      setSeries(transformedMockSeries);
      setIsUsingMockData(true);
      
      toast({
        title: "Connection Issue",
        description: "Using sample data - please check database connection",
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

  const handleView = (product: Product) => {
    console.log('Viewing product:', product);
    setSelectedProduct(product);
    setIsViewOpen(true);
    onProductSelect?.(product);
  };

  const handleEdit = (product: Product) => {
    console.log('Editing product:', product);
    setEditingProduct(product);
    setIsEditOpen(true);
    onProductEdit?.(product);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      fetchProductSeries();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      fetchProductSeries();
    } catch (error) {
      console.error('Error updating product status:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  const handleProductSaved = () => {
    fetchProductSeries();
    setIsEditOpen(false);
    setEditingProduct(null);
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
                <h4 className="font-medium text-amber-800">Development Mode Active</h4>
                <p className="text-sm text-amber-700">
                  Currently displaying sample data. Database connection unavailable or no products configured.
                  <br />
                  <strong>To resolve:</strong> Run the database-fixes.sql script or ensure Supabase connection is working.
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
              {series.reduce((acc, s) => acc + s.activeProducts, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Active Products</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {series.reduce((acc, s) => acc + s.hasAssets, 0)}
            </div>
            <div className="text-sm text-muted-foreground">With Assets</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(series.reduce((acc, s) => acc + s.completionRate, 0) / series.length || 0)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Completion</div>
          </CardContent>
        </Card>
      </div>

      {/* Series List */}
      <div className="space-y-4">
        {series.map((seriesData) => (
          <Card key={seriesData.name} className="overflow-hidden">
            <Collapsible
              open={expandedSeries.has(seriesData.name)}
              onOpenChange={() => toggleSeries(seriesData.name)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedSeries.has(seriesData.name) ? 
                        <ChevronDown className="h-5 w-5" /> : 
                        <ChevronRight className="h-5 w-5" />
                      }
                      <Package className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{seriesData.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {seriesData.totalProducts} products • {seriesData.activeProducts} active
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {Math.round(seriesData.completionRate)}% Complete
                        </div>
                        <Progress value={seriesData.completionRate} className="w-20" />
                      </div>
                      <Badge 
                        className={`${getSeriesStatusColor(seriesData.completionRate)} text-white`}
                      >
                        {seriesData.hasAssets}/{seriesData.totalProducts}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {seriesData.products.map((product) => (
                      <Card key={product.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{product.name}</h4>
                              <p className="text-sm text-muted-foreground">{product.product_code}</p>
                            </div>
                            <Badge variant={product.is_active ? "default" : "secondary"}>
                              {product.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Image className="h-3 w-3" />
                              <span className={product.thumbnail_path ? 'text-green-600' : 'text-red-600'}>
                                {product.thumbnail_path ? 'Image' : 'No Image'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Box className="h-3 w-3" />
                              <span className={product.model_path ? 'text-green-600' : 'text-red-600'}>
                                {product.model_path ? '3D Model' : 'No Model'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(product)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
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
        ))}
      </div>

      {/* Product View Dialog */}
      <ProductViewDialog
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
        product={selectedProduct}
        onEdit={handleEdit}
        onDelete={handleDeleteProduct}
        onToggleStatus={toggleProductStatus}
      />

      {/* Product Edit Dialog */}
      <ProductFormDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        product={editingProduct}
        onProductSaved={handleProductSaved}
      />
    </div>
  );
};
