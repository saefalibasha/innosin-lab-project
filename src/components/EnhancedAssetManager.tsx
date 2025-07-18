import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  Package, 
  Image, 
  Box, 
  CheckCircle, 
  AlertCircle, 
  Search,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Product } from '@/types/product';
import { getProductsSync } from '@/utils/productAssets';

interface ProductAssetStatus {
  id: string;
  name: string;
  category: string;
  baseName: string;
  hasOverviewImage: boolean;
  hasGLB: boolean;
  hasJPG: boolean;
  status: 'complete' | 'partial' | 'missing';
  completionPercentage: number;
  variants: VariantAssetStatus[];
  overviewImagePath?: string;
  glbPath?: string;
  jpgPath?: string;
}

interface VariantAssetStatus {
  id: string;
  size: string;
  dimensions: string;
  type?: string;
  orientation?: 'LH' | 'RH' | 'None';
  hasGLB: boolean;
  hasJPG: boolean;
  status: 'complete' | 'partial' | 'missing';
  completionPercentage: number;
}

interface UploadSession {
  productId: string;
  selectedOverviewImage: File | null;
  selectedGLB: File | null;
  selectedJPG: File | null;
  isUploading: boolean;
  uploadProgress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  uploadType: 'overview' | 'variant';
}

const EnhancedAssetManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [assetStatuses, setAssetStatuses] = useState<ProductAssetStatus[]>([]);
  const [uploadSessions, setUploadSessions] = useState<Record<string, UploadSession>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'partial' | 'missing'>('all');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProductData();
  }, []);

  // Extract product base name for grouping variants
  const extractProductBaseName = (productName: string): string => {
    return productName
      .replace(/\s*\([^)]*\)$/, '') // Remove size codes like (505065)
      .replace(/-[LR]H$/, '') // Remove orientation
      .replace(/-DWR?\d+(-\d+)?$/, '') // Remove drawer configurations
      .trim();
  };

  const loadProductData = async () => {
    setIsLoading(true);
    try {
      const allProducts = getProductsSync();
      
      // Only show Innosin Lab products (filter out complete categories)
      const innosinProducts = allProducts.filter(product => 
        product.category === 'Innosin Lab'
      );
      
      setProducts(innosinProducts);
      
      // Group products by base name for variant handling
      const grouped = innosinProducts.reduce((acc, product) => {
        const baseName = extractProductBaseName(product.name);
        if (!acc[baseName]) {
          acc[baseName] = [];
        }
        acc[baseName].push(product);
        return acc;
      }, {} as Record<string, Product[]>);

      const assetStatuses: ProductAssetStatus[] = [];
      
      for (const [baseName, productGroup] of Object.entries(grouped)) {
        // Use first product as representative
        const mainProduct = productGroup[0];
        
        // Check for overview image (series-level)
        const overviewImagePath = `products/${baseName}/overview.jpg`;
        const hasOverviewImage = await checkAssetExists(overviewImagePath);
        
        // Check for main product assets
        const glbPath = `products/${mainProduct.id}/${mainProduct.name}.glb`;
        const jpgPath = `products/${mainProduct.id}/${mainProduct.name}.jpg`;
        
        const hasGLB = await checkAssetExists(glbPath);
        const hasJPG = await checkAssetExists(jpgPath);
        
        // Process variants if they exist
        const variantStatuses: VariantAssetStatus[] = [];
        if (mainProduct.variants) {
          for (const variant of mainProduct.variants) {
            const variantGlbPath = `products/${baseName}/variants/${variant.id}.glb`;
            const variantJpgPath = `products/${baseName}/variants/${variant.id}.jpg`;
            
            const variantHasGLB = await checkAssetExists(variantGlbPath);
            const variantHasJPG = await checkAssetExists(variantJpgPath);
            
            // Only include variants that are missing assets or have placeholder files
            const isPlaceholderGLB = variant.modelPath.includes('PLACEHOLDER');
            const isPlaceholderJPG = variant.thumbnail.includes('PLACEHOLDER');
            
            if (!variantHasGLB || !variantHasJPG || isPlaceholderGLB || isPlaceholderJPG) {
              variantStatuses.push({
                id: variant.id,
                size: variant.size,
                dimensions: variant.dimensions,
                type: variant.type,
                orientation: variant.orientation,
                hasGLB: variantHasGLB && !isPlaceholderGLB,
                hasJPG: variantHasJPG && !isPlaceholderJPG,
                status: (variantHasGLB && variantHasJPG && !isPlaceholderGLB && !isPlaceholderJPG) ? 'complete' : 
                        (variantHasGLB || variantHasJPG) && (!isPlaceholderGLB || !isPlaceholderJPG) ? 'partial' : 'missing',
                completionPercentage: (variantHasGLB && !isPlaceholderGLB) && (variantHasJPG && !isPlaceholderJPG) ? 100 : 
                                    ((variantHasGLB && !isPlaceholderGLB) || (variantHasJPG && !isPlaceholderJPG)) ? 50 : 0
              });
            }
          }
        }
        
        // Include products that need overview images or have missing/placeholder assets
        const needsOverviewImage = !hasOverviewImage;
        const isMainComplete = hasGLB && hasJPG && !mainProduct.modelPath.includes('PLACEHOLDER') && !mainProduct.thumbnail.includes('PLACEHOLDER');
        const hasIncompleteVariants = variantStatuses.length > 0;
        
        if (needsOverviewImage || !isMainComplete || hasIncompleteVariants) {
          const completionPercentage = calculateCompletionPercentage(hasOverviewImage, hasGLB, hasJPG, variantStatuses);
          
          assetStatuses.push({
            id: mainProduct.id,
            name: mainProduct.name,
            category: mainProduct.category,
            baseName,
            hasOverviewImage,
            hasGLB: hasGLB && !mainProduct.modelPath.includes('PLACEHOLDER'),
            hasJPG: hasJPG && !mainProduct.thumbnail.includes('PLACEHOLDER'),
            status: completionPercentage === 100 ? 'complete' : completionPercentage > 0 ? 'partial' : 'missing',
            completionPercentage,
            variants: variantStatuses,
            overviewImagePath: hasOverviewImage ? overviewImagePath : undefined,
            glbPath: hasGLB ? glbPath : undefined,
            jpgPath: hasJPG ? jpgPath : undefined
          });
        }
      }
      
      setAssetStatuses(assetStatuses);
    } catch (error) {
      console.error('Error loading product data:', error);
      toast.error('Failed to load product data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCompletionPercentage = (hasOverviewImage: boolean, hasGLB: boolean, hasJPG: boolean, variants: VariantAssetStatus[]): number => {
    // Overview image counts for 33.3%, main assets for 33.3%, variants for 33.4%
    const overviewPercentage = hasOverviewImage ? 33.3 : 0;
    
    if (variants.length === 0) {
      // If no variants, main assets get 66.7% total
      const mainAssetPercentage = (hasGLB ? 33.35 : 0) + (hasJPG ? 33.35 : 0);
      return Math.round(overviewPercentage + mainAssetPercentage);
    }
    
    // With variants: overview 33.3%, main 16.7%, variants 50%
    const mainAssetPercentage = (hasGLB ? 8.35 : 0) + (hasJPG ? 8.35 : 0);
    const variantPercentage = variants.length > 0 ? 
      variants.reduce((sum, variant) => sum + variant.completionPercentage, 0) / variants.length * 0.5 : 0;
    
    return Math.round(overviewPercentage + mainAssetPercentage + variantPercentage);
  };

  const checkAssetExists = async (path: string): Promise<boolean> => {
    // Skip validation for placeholder assets
    if (path.includes('PLACEHOLDER') || path.includes('placeholder')) {
      return false;
    }
    
    try {
      const response = await fetch(path, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  const startUploadSession = (productId: string, uploadType: 'overview' | 'variant' = 'variant') => {
    setUploadSessions(prev => ({
      ...prev,
      [productId]: {
        productId,
        selectedOverviewImage: null,
        selectedGLB: null,
        selectedJPG: null,
        isUploading: false,
        uploadProgress: 0,
        status: 'idle',
        uploadType
      }
    }));
  };

  const updateUploadSession = (productId: string, updates: Partial<UploadSession>) => {
    setUploadSessions(prev => ({
      ...prev,
      [productId]: { ...prev[productId], ...updates }
    }));
  };

  const handleFileSelect = (productId: string, fileType: 'overview' | 'glb' | 'jpg', file: File) => {
    const fieldName = fileType === 'overview' ? 'selectedOverviewImage' : 
                      fileType === 'glb' ? 'selectedGLB' : 'selectedJPG';
    
    updateUploadSession(productId, {
      [fieldName]: file
    });
  };

  const uploadAssets = async (productId: string) => {
    const session = uploadSessions[productId];
    if (!session) return;

    updateUploadSession(productId, { 
      isUploading: true, 
      status: 'uploading',
      uploadProgress: 0 
    });

    try {
      const product = assetStatuses.find(p => p.id === productId);
      if (!product) throw new Error('Product not found');

      let uploadCount = 0;
      const totalUploads = (session.selectedOverviewImage ? 1 : 0) + 
                          (session.selectedGLB ? 1 : 0) + 
                          (session.selectedJPG ? 1 : 0);

      // Upload overview image
      if (session.selectedOverviewImage) {
        const overviewPath = `products/${product.baseName}/overview.jpg`;
        const { error: overviewError } = await supabase.storage
          .from('documents')
          .upload(overviewPath, session.selectedOverviewImage, {
            cacheControl: '3600',
            upsert: true
          });

        if (overviewError) throw overviewError;
        
        uploadCount++;
        updateUploadSession(productId, { 
          uploadProgress: (uploadCount / totalUploads) * 100 
        });
      }

      // Upload GLB file (for variants, use baseName structure)
      if (session.selectedGLB) {
        const glbPath = session.uploadType === 'overview' 
          ? `products/${productId}/${product.name}.glb`
          : `products/${product.baseName}/variants/${productId}.glb`;
          
        const { error: glbError } = await supabase.storage
          .from('documents')
          .upload(glbPath, session.selectedGLB, {
            cacheControl: '3600',
            upsert: true
          });

        if (glbError) throw glbError;
        
        uploadCount++;
        updateUploadSession(productId, { 
          uploadProgress: (uploadCount / totalUploads) * 100 
        });
      }

      // Upload JPG file (for variants, use baseName structure)
      if (session.selectedJPG) {
        const jpgPath = session.uploadType === 'overview'
          ? `products/${productId}/${product.name}.jpg`
          : `products/${product.baseName}/variants/${productId}.jpg`;
          
        const { error: jpgError } = await supabase.storage
          .from('documents')
          .upload(jpgPath, session.selectedJPG, {
            cacheControl: '3600',
            upsert: true
          });

        if (jpgError) throw jpgError;
        
        uploadCount++;
        updateUploadSession(productId, { 
          uploadProgress: (uploadCount / totalUploads) * 100 
        });
      }

      updateUploadSession(productId, { 
        status: 'success',
        isUploading: false 
      });

      toast.success(`Assets uploaded successfully for ${product.name}`);
      
      // Reload data to reflect changes
      loadProductData();
    } catch (error) {
      console.error('Upload error:', error);
      updateUploadSession(productId, { 
        status: 'error',
        isUploading: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast.error('Failed to upload assets');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Complete</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Partial</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Missing</Badge>;
    }
  };

  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // Filter products based on search and status
  const filteredProducts = assetStatuses.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.baseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const totalProducts = assetStatuses.length;
  const completeProducts = assetStatuses.filter(p => p.status === 'complete').length;
  const partialProducts = assetStatuses.filter(p => p.status === 'partial').length;
  const missingProducts = assetStatuses.filter(p => p.status === 'missing').length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Asset Manager...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Innosin Lab Asset Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{totalProducts}</div>
                <div className="text-sm text-muted-foreground">Total Series</div>
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

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search Innosin Lab products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="complete">Complete</option>
                <option value="partial">Partial</option>
                <option value="missing">Missing</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No products match your search criteria.' : 'All Innosin Lab products have complete assets!'}
              </div>
            ) : (
              filteredProducts.map((product) => {
                const session = uploadSessions[product.id];
                const isExpanded = expandedProducts.has(product.id);
                const hasVariants = product.variants.length > 0;

                return (
                  <Card key={product.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {hasVariants && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleProductExpansion(product.id)}
                              className="h-8 w-8 p-0"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                          {getStatusIcon(product.status)}
                          <div>
                            <h3 className="font-semibold">{product.baseName}</h3>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(product.status)}
                          <Badge variant="outline">{product.completionPercentage}%</Badge>
                          {hasVariants && (
                            <Badge variant="secondary">{product.variants.length} variants</Badge>
                          )}
                        </div>
                      </div>

                      {/* Asset Status Icons */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Image className={`w-4 h-4 ${product.hasOverviewImage ? 'text-green-600' : 'text-red-600'}`} />
                          <span className="text-sm">Overview Image</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Box className={`w-4 h-4 ${product.hasGLB ? 'text-green-600' : 'text-red-600'}`} />
                          <span className="text-sm">3D Model</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Image className={`w-4 h-4 ${product.hasJPG ? 'text-green-600' : 'text-red-600'}`} />
                          <span className="text-sm">Product Image</span>
                        </div>
                      </div>

                      {/* Upload Section */}
                      {!session && (
                        <Button
                          onClick={() => startUploadSession(product.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Assets
                        </Button>
                      )}

                      {session && (
                        <div className="space-y-6">
                          {/* Overview Image Upload Section */}
                          {!product.hasOverviewImage && (
                            <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                              <h5 className="text-sm font-medium text-orange-800 mb-3">Series Overview Image</h5>
                              <p className="text-xs text-orange-600 mb-3">Upload a catalog overview image for the {product.baseName} series (JPG only)</p>
                              
                              <div>
                                <Label htmlFor={`overview-${product.id}`} className="text-sm font-medium">
                                  Overview Image (.jpg)
                                </Label>
                                <Input
                                  id={`overview-${product.id}`}
                                  type="file"
                                  accept=".jpg,.jpeg"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      startUploadSession(product.id, 'overview');
                                      handleFileSelect(product.id, 'overview', file);
                                    }
                                  }}
                                  className="mt-1"
                                />
                                {session?.selectedOverviewImage && (
                                  <p className="text-xs text-green-600 mt-1">
                                    Selected: {session.selectedOverviewImage.name}
                                  </p>
                                )}
                              </div>

                              <Button
                                onClick={() => uploadAssets(product.id)}
                                disabled={!session?.selectedOverviewImage || session?.isUploading}
                                className="w-full mt-3 bg-orange-600 hover:bg-orange-700"
                                size="sm"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Overview Image
                              </Button>
                            </div>
                          )}

                          {/* Variant Assets Upload Section */}
                          <div className="space-y-4">
                            <h5 className="text-sm font-medium text-foreground">Upload Variant Assets</h5>
                            
                            {/* GLB File Upload */}
                            <div>
                              <Label htmlFor={`glb-${product.id}`} className="text-sm font-medium">
                                3D Model (.glb)
                              </Label>
                              <Input
                                id={`glb-${product.id}`}
                                type="file"
                                accept=".glb"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (!session) startUploadSession(product.id, 'variant');
                                    handleFileSelect(product.id, 'glb', file);
                                  }
                                }}
                                className="mt-1"
                              />
                              {session?.selectedGLB && (
                                <p className="text-xs text-green-600 mt-1">
                                  Selected: {session.selectedGLB.name}
                                </p>
                              )}
                            </div>

                            {/* JPG File Upload */}
                            <div>
                              <Label htmlFor={`jpg-${product.id}`} className="text-sm font-medium">
                                Product Image (.jpg)
                              </Label>
                              <Input
                                id={`jpg-${product.id}`}
                                type="file"
                                accept=".jpg,.jpeg"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (!session) startUploadSession(product.id, 'variant');
                                    handleFileSelect(product.id, 'jpg', file);
                                  }
                                }}
                                className="mt-1"
                              />
                              {session?.selectedJPG && (
                                <p className="text-xs text-green-600 mt-1">
                                  Selected: {session.selectedJPG.name}
                                </p>
                              )}
                            </div>

                            {/* Upload Progress */}
                            {session?.isUploading && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Uploading...</span>
                                  <span>{Math.round(session.uploadProgress)}%</span>
                                </div>
                                <Progress value={session.uploadProgress} />
                              </div>
                            )}

                            {/* Upload Button */}
                            <Button
                              onClick={() => uploadAssets(product.id)}
                              disabled={
                                (!session?.selectedGLB && !session?.selectedJPG) ||
                                session?.isUploading
                              }
                              className="w-full"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Variant Assets
                            </Button>

                            {/* Error Message */}
                            {session?.status === 'error' && session.errorMessage && (
                              <p className="text-xs text-red-600 mt-2">
                                Error: {session.errorMessage}
                              </p>
                            )}

                            {/* Success Message */}
                            {session?.status === 'success' && (
                              <p className="text-xs text-green-600 mt-2">
                                Assets uploaded successfully!
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Expanded Variants */}
                      {isExpanded && hasVariants && (
                        <div className="mt-6 pl-8 border-l-2 border-gray-200">
                          <h4 className="text-sm font-medium mb-3">Variants needing assets:</h4>
                          <div className="space-y-2">
                            {product.variants.map((variant) => (
                              <div key={variant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(variant.status)}
                                  <span className="text-sm font-medium">{variant.size}</span>
                                  {variant.type && (
                                    <Badge variant="outline" className="text-xs">{variant.type}</Badge>
                                  )}
                                  {variant.orientation && variant.orientation !== 'None' && (
                                    <Badge variant="secondary" className="text-xs">{variant.orientation}</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Box className={`w-3 h-3 ${variant.hasGLB ? 'text-green-600' : 'text-red-600'}`} />
                                  <Image className={`w-3 h-3 ${variant.hasJPG ? 'text-green-600' : 'text-red-600'}`} />
                                  <span className="text-xs text-muted-foreground">{variant.completionPercentage}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedAssetManager;