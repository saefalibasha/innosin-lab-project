
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  RefreshCw, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ChevronDown,
  ChevronRight,
  Edit3,
  Package,
  Image,
  Box,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProductEditModal from './ProductEditModal';

interface Product {
  id: string;
  product_code: string;
  name: string;
  editable_title: string;
  editable_description: string;
  category: string;
  product_series: string;
  finish_type: string;
  orientation: string;
  drawer_count: number;
  door_type: string;
  dimensions: string;
  thumbnail_path: string;
  model_path: string;
  is_active: boolean;
}

interface AssetStatus {
  productId: string;
  productCode: string;
  productName: string;
  editableTitle: string;
  productSeries: string;
  finishType: string;
  orientation: string;
  dimensions: string;
  hasOverviewImage: boolean;
  hasGLB: boolean;
  hasJPG: boolean;
  isMainComplete: boolean;
  variants: VariantStatus[];
  completionPercentage: number;
  status: 'complete' | 'partial' | 'missing';
}

interface VariantStatus {
  id: string;
  size: string;
  hasGLB: boolean;
  hasJPG: boolean;
  status: 'complete' | 'partial' | 'missing';
  glbPath?: string;
  jpgPath?: string;
}

const EnhancedAssetManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [assetStatuses, setAssetStatuses] = useState<AssetStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'partial' | 'missing'>('all');
  const [filterSeries, setFilterSeries] = useState<string>('all');
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [checkingAssets, setCheckingAssets] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productSeries, setProductSeries] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadProductData();
  }, [showAllProducts]);

  const loadProductData = async () => {
    setIsLoading(true);
    try {
      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'Innosin Lab')
        .eq('is_active', true)
        .order('product_series', { ascending: true })
        .order('product_code', { ascending: true });

      if (error) throw error;

      setProducts(productsData || []);
      
      // Extract unique product series for filtering
      const uniqueSeries = [...new Set(productsData?.map(p => p.product_series).filter(Boolean) || [])];
      setProductSeries(uniqueSeries);

      await checkAssets(productsData || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load product data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkAssets = async (productsToCheck: Product[]) => {
    setCheckingAssets(true);
    const assetStatuses: AssetStatus[] = [];

    try {
      // Group products by base name for variant handling
      const productGroups = new Map<string, Product[]>();
      
      productsToCheck.forEach(product => {
        const baseName = getProductBaseName(product.product_code);
        if (!productGroups.has(baseName)) {
          productGroups.set(baseName, []);
        }
        productGroups.get(baseName)!.push(product);
      });

      for (const [baseName, groupProducts] of productGroups) {
        const mainProduct = groupProducts[0];
        
        // Check main product assets
        const hasOverviewImage = await checkAssetExists(`products/${mainProduct.product_code.toLowerCase()}/overview.jpg`);
        const hasGLB = await checkAssetExists(`products/${mainProduct.product_code.toLowerCase()}/${mainProduct.product_code}.glb`);
        const hasJPG = await checkAssetExists(`products/${mainProduct.product_code.toLowerCase()}/${mainProduct.product_code}.jpg`);
        
        const isMainComplete = hasGLB && hasJPG && !isPlaceholderAsset(mainProduct.model_path) && !isPlaceholderAsset(mainProduct.thumbnail_path);

        // Check variants
        const variants: VariantStatus[] = [];
        for (const variant of groupProducts) {
          if (variant.id !== mainProduct.id) {
            const variantHasGLB = await checkAssetExists(`products/${variant.product_code.toLowerCase()}/${variant.product_code}.glb`);
            const variantHasJPG = await checkAssetExists(`products/${variant.product_code.toLowerCase()}/${variant.product_code}.jpg`);
            
            const variantStatus: 'complete' | 'partial' | 'missing' = 
              (variantHasGLB && variantHasJPG) ? 'complete' :
              (variantHasGLB || variantHasJPG) ? 'partial' : 'missing';

            // Include all variants when showing all products, or only incomplete ones when filtering
            if (showAllProducts || variantStatus !== 'complete') {
              variants.push({
                id: variant.id,
                size: variant.product_code,
                hasGLB: variantHasGLB,
                hasJPG: variantHasJPG,
                status: variantStatus,
                glbPath: `products/${variant.product_code.toLowerCase()}/${variant.product_code}.glb`,
                jpgPath: `products/${variant.product_code.toLowerCase()}/${variant.product_code}.jpg`
              });
            }
          }
        }

        // Include products based on showAllProducts setting
        const needsOverviewImage = !hasOverviewImage;
        const hasIncompleteVariants = variants.some(v => v.status !== 'complete');
        
        if (showAllProducts || needsOverviewImage || !isMainComplete || hasIncompleteVariants) {
          const completionPercentage = calculateCompletionPercentage(hasOverviewImage, hasGLB, hasJPG, variants);
          const status: 'complete' | 'partial' | 'missing' = 
            completionPercentage === 100 ? 'complete' :
            completionPercentage > 0 ? 'partial' : 'missing';

          assetStatuses.push({
            productId: mainProduct.id,
            productCode: mainProduct.product_code,
            productName: mainProduct.name,
            editableTitle: mainProduct.editable_title || mainProduct.name,
            productSeries: mainProduct.product_series || 'Unknown',
            finishType: mainProduct.finish_type || 'PC',
            orientation: mainProduct.orientation || 'None',
            dimensions: mainProduct.dimensions || 'N/A',
            hasOverviewImage,
            hasGLB,
            hasJPG,
            isMainComplete,
            variants,
            completionPercentage,
            status
          });
        }
      }

      setAssetStatuses(assetStatuses);
    } catch (error) {
      console.error('Error checking assets:', error);
      toast({
        title: "Error", 
        description: "Failed to check asset status",
        variant: "destructive",
      });
    } finally {
      setCheckingAssets(false);
    }
  };

  const getProductBaseName = (productCode: string): string => {
    return productCode.split('-')[0];
  };

  const checkAssetExists = async (path: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .list('', { 
          limit: 1,
          search: path.split('/').pop() 
        });
      
      return !error && data && data.length > 0;
    } catch {
      return false;
    }
  };

  const isPlaceholderAsset = (path: string | null): boolean => {
    return !path || path.includes('PLACEHOLDER') || path.includes('placeholder');
  };

  const calculateCompletionPercentage = (
    hasOverview: boolean, 
    hasMainGLB: boolean, 
    hasMainJPG: boolean, 
    variants: VariantStatus[]
  ): number => {
    const mainAssets = 3; // overview, GLB, JPG
    const variantAssets = variants.length * 2; // GLB + JPG per variant
    const totalAssets = mainAssets + variantAssets;
    
    if (totalAssets === 0) return 100;

    let completedAssets = 0;
    if (hasOverview) completedAssets++;
    if (hasMainGLB) completedAssets++;
    if (hasMainJPG) completedAssets++;
    
    variants.forEach(variant => {
      if (variant.hasGLB) completedAssets++;
      if (variant.hasJPG) completedAssets++;
    });

    return Math.round((completedAssets / totalAssets) * 100);
  };

  const filteredAssetStatuses = assetStatuses.filter(asset => {
    const matchesSearch = searchTerm === '' || 
      asset.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.editableTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.productSeries.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    const matchesSeries = filterSeries === 'all' || asset.productSeries === filterSeries;

    return matchesSearch && matchesStatus && matchesSeries;
  });

  const toggleExpanded = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const handleEditProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setEditingProduct(product);
    }
  };

  const handleSaveEdit = () => {
    loadProductData(); // Refresh data after edit
  };

  const totalProducts = filteredAssetStatuses.length;
  const completeProducts = filteredAssetStatuses.filter(p => p.status === 'complete').length;
  const partialProducts = filteredAssetStatuses.filter(p => p.status === 'partial').length;
  const missingProducts = filteredAssetStatuses.filter(p => p.status === 'missing').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin mr-2" />
        <span>Loading Innosin Lab products...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Innosin Lab Asset Manager</span>
              </div>
              {checkingAssets && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Checking assets...
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showAllProducts ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAllProducts(!showAllProducts)}
              >
                {showAllProducts ? "Show Incomplete Only" : "Show All Products"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadProductData}
                disabled={isLoading || checkingAssets}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{totalProducts}</div>
                <div className="text-sm text-muted-foreground">
                  {showAllProducts ? 'Total Series' : 'Series Needing Work'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{completeProducts}</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{partialProducts}</div>
                <div className="text-sm text-muted-foreground">Partial</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{missingProducts}</div>
                <div className="text-sm text-muted-foreground">Missing</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by product code, title, or series..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterSeries} onValueChange={setFilterSeries}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by series" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Series</SelectItem>
                {productSeries.map(series => (
                  <SelectItem key={series} value={series}>{series}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products List */}
          <div className="space-y-4">
            {filteredAssetStatuses.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-muted-foreground">
                    {searchTerm || filterStatus !== 'all' || filterSeries !== 'all'
                      ? 'No products match your search criteria.'
                      : showAllProducts 
                        ? 'No products found.' 
                        : 'All Innosin Lab products have complete assets!'
                    }
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredAssetStatuses.map((asset) => (
                <Card key={asset.productId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(asset.productId)}
                          >
                            {expandedProducts.has(asset.productId) ? 
                              <ChevronDown className="w-4 h-4" /> : 
                              <ChevronRight className="w-4 h-4" />
                            }
                          </Button>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(asset.status)}
                            <Badge className={getStatusColor(asset.status)}>
                              {asset.status}
                            </Badge>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{asset.editableTitle}</h3>
                            <p className="text-sm text-muted-foreground">
                              {asset.productCode} • {asset.productSeries} • {asset.finishType}
                              {asset.orientation !== 'None' && ` • ${asset.orientation}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Completion</span>
                            <span>{asset.completionPercentage}%</span>
                          </div>
                          <Progress value={asset.completionPercentage} className="w-full" />
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Image className="w-4 h-4" />
                            <span className={asset.hasOverviewImage ? 'text-green-600' : 'text-red-600'}>
                              Overview Image
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Box className="w-4 h-4" />
                            <span className={asset.hasGLB ? 'text-green-600' : 'text-red-600'}>
                              3D Model
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Image className="w-4 h-4" />
                            <span className={asset.hasJPG ? 'text-green-600' : 'text-red-600'}>
                              Thumbnail
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(asset.productId)}
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Variants */}
                    {expandedProducts.has(asset.productId) && asset.variants.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-3">Product Variants</h4>
                        <div className="grid gap-2">
                          {asset.variants.map((variant) => (
                            <div key={variant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                {getStatusIcon(variant.status)}
                                <span className="font-medium">{variant.size}</span>
                                <Badge className={getStatusColor(variant.status)} variant="outline">
                                  {variant.status}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className={variant.hasGLB ? 'text-green-600' : 'text-red-600'}>
                                  GLB: {variant.hasGLB ? '✓' : '✗'}
                                </span>
                                <span className={variant.hasJPG ? 'text-green-600' : 'text-red-600'}>
                                  JPG: {variant.hasJPG ? '✓' : '✗'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <ProductEditModal
        product={editingProduct}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default EnhancedAssetManager;
