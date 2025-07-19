
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
  BarChart3
} from 'lucide-react';
import ProductFormDialog from './ProductFormDialog';
import ProductViewDialog from './ProductViewDialog';

interface Product {
  id: string;
  name: string;
  product_code: string;
  category: string;
  product_series: string;
  finish_type: string;
  is_active: boolean;
  thumbnail_path?: string;
  model_path?: string;
  dimensions?: string;
  description?: string;
  full_description?: string;
  orientation?: string;
  door_type?: string;
  drawer_count?: number;
  specifications?: any;
  keywords?: string[];
  company_tags?: string[];
  additional_images?: string[];
  overview_image_path?: string;
  created_at: string;
  updated_at: string;
}

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
  const { toast } = useToast();

  useEffect(() => {
    fetchProductSeries();
  }, []);

  const fetchProductSeries = async () => {
    try {
      setLoading(true);
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('product_series', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      // Group products by series
      const seriesMap = new Map<string, Product[]>();
      products?.forEach(product => {
        const seriesName = product.product_series || 'Uncategorized';
        if (!seriesMap.has(seriesName)) {
          seriesMap.set(seriesName, []);
        }
        seriesMap.get(seriesName)!.push(product);
      });

      // Calculate series statistics
      const seriesData: ProductSeries[] = Array.from(seriesMap.entries()).map(([name, products]) => {
        const totalProducts = products.length;
        const activeProducts = products.filter(p => p.is_active).length;
        const hasAssets = products.filter(p => p.thumbnail_path || p.model_path).length;
        const completionRate = totalProducts > 0 ? (hasAssets / totalProducts) * 100 : 0;

        return {
          name,
          products,
          totalProducts,
          activeProducts,
          completionRate,
          hasAssets
        };
      });

      setSeries(seriesData);
    } catch (error) {
      console.error('Error fetching product series:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product series",
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
