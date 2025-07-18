import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
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
  productId: string;
  productName: string;
  category: string;
  brand: string;
  hasGLB: boolean;
  hasJPG: boolean;
  glbPath?: string;
  jpgPath?: string;
  status: 'complete' | 'partial' | 'missing';
  completionPercentage: number;
  variants?: VariantAssetStatus[];
  isVariant?: boolean;
  parentProductId?: string;
  variantInfo?: string;
}

interface VariantAssetStatus {
  variantId: string;
  variantName: string;
  parentProductId: string;
  variantInfo: string;
  hasGLB: boolean;
  hasJPG: boolean;
  glbPath?: string;
  jpgPath?: string;
  status: 'complete' | 'partial' | 'missing';
  completionPercentage: number;
}

interface UploadSession {
  productId: string;
  glbFile?: File;
  jpgFile?: File;
  uploading: boolean;
  progress: number;
}

const EnhancedAssetManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [assetStatus, setAssetStatus] = useState<ProductAssetStatus[]>([]);
  const [uploadSessions, setUploadSessions] = useState<UploadSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'partial' | 'missing'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadProductData();
  }, []);

  const loadProductData = async () => {
    try {
      // Load all products from the catalog
      const allProducts = getProductsSync();
      setProducts(allProducts);

      // Group products by base name for Innosin Lab variants
      const productGroups = new Map<string, Product[]>();
      
      allProducts.forEach(product => {
        const brand = product.category.toLowerCase().includes('innosin') ? 'innosin-lab' :
                      product.category.toLowerCase().includes('broen') ? 'broen-lab' :
                      product.category.toLowerCase().includes('oriental') ? 'oriental-giken' :
                      product.category.toLowerCase().includes('hamilton') ? 'hamilton-lab' : 'unknown';
        
        if (brand === 'innosin-lab') {
          // Extract base product name (remove variant suffixes)
          const baseName = product.name.replace(/\s*\([^)]*\)$/, '').trim();
          if (!productGroups.has(baseName)) {
            productGroups.set(baseName, []);
          }
          productGroups.get(baseName)!.push(product);
        } else {
          // For non-Innosin products, treat each as individual
          productGroups.set(product.id, [product]);
        }
      });

      // Process each product group
      const statusPromises = Array.from(productGroups.entries()).map(async ([groupKey, groupProducts]) => {
        if (groupProducts.length === 1 && !groupProducts[0].category.toLowerCase().includes('innosin')) {
          // Single product (non-Innosin)
          const product = groupProducts[0];
          const glbExists = await checkAssetExists(product.modelPath);
          const jpgExists = await checkAssetExists(product.thumbnail);
          
          const hasGLB = glbExists && !product.modelPath.includes('PLACEHOLDER');
          const hasJPG = jpgExists && !product.thumbnail.includes('PLACEHOLDER');
          
          let status: 'complete' | 'partial' | 'missing' = 'missing';
          let completionPercentage = 0;
          
          if (hasGLB && hasJPG) {
            status = 'complete';
            completionPercentage = 100;
          } else if (hasGLB || hasJPG) {
            status = 'partial';
            completionPercentage = 50;
          }

          const brand = product.category.toLowerCase().includes('broen') ? 'broen-lab' :
                        product.category.toLowerCase().includes('oriental') ? 'oriental-giken' :
                        product.category.toLowerCase().includes('hamilton') ? 'hamilton-lab' : 'unknown';

          return {
            productId: product.id,
            productName: product.name,
            category: product.category,
            brand,
            hasGLB,
            hasJPG,
            glbPath: product.modelPath,
            jpgPath: product.thumbnail,
            status,
            completionPercentage
          };
        } else {
          // Innosin Lab product group with variants
          const variants: VariantAssetStatus[] = await Promise.all(
            groupProducts.map(async (variant) => {
              const glbExists = await checkAssetExists(variant.modelPath);
              const jpgExists = await checkAssetExists(variant.thumbnail);
              
              const hasGLB = glbExists && !variant.modelPath.includes('PLACEHOLDER');
              const hasJPG = jpgExists && !variant.thumbnail.includes('PLACEHOLDER');
              
              let status: 'complete' | 'partial' | 'missing' = 'missing';
              let completionPercentage = 0;
              
              if (hasGLB && hasJPG) {
                status = 'complete';
                completionPercentage = 100;
              } else if (hasGLB || hasJPG) {
                status = 'partial';
                completionPercentage = 50;
              }

              // Extract variant info from product name
              const variantMatch = variant.name.match(/\(([^)]*)\)$/);
              const variantInfo = variantMatch ? variantMatch[1] : 'Standard';

              return {
                variantId: variant.id,
                variantName: variant.name,
                parentProductId: groupKey,
                variantInfo,
                hasGLB,
                hasJPG,
                glbPath: variant.modelPath,
                jpgPath: variant.thumbnail,
                status,
                completionPercentage
              };
            })
          );

          // Calculate overall status for the product group
          const totalVariants = variants.length;
          const completeVariants = variants.filter(v => v.status === 'complete').length;
          const partialVariants = variants.filter(v => v.status === 'partial').length;
          
          let overallStatus: 'complete' | 'partial' | 'missing' = 'missing';
          let overallPercentage = 0;
          
          if (completeVariants === totalVariants) {
            overallStatus = 'complete';
            overallPercentage = 100;
          } else if (completeVariants > 0 || partialVariants > 0) {
            overallStatus = 'partial';
            overallPercentage = Math.round(((completeVariants * 100) + (partialVariants * 50)) / totalVariants);
          }

          const firstProduct = groupProducts[0];
          return {
            productId: groupKey,
            productName: groupKey,
            category: firstProduct.category,
            brand: 'innosin-lab',
            hasGLB: false, // Group level doesn't have individual assets
            hasJPG: false,
            status: overallStatus,
            completionPercentage: overallPercentage,
            variants
          };
        }
      });

      const statusResults = await Promise.all(statusPromises);
      setAssetStatus(statusResults);
    } catch (error) {
      console.error('Error loading product data:', error);
      toast({
        title: "Error",
        description: "Failed to load product data",
        variant: "destructive",
      });
    }
  };

  const checkAssetExists = async (path: string): Promise<boolean> => {
    if (!path || path.includes('PLACEHOLDER')) return false;
    
    try {
      // Check if file exists in Supabase storage
      const storagePath = path.replace('/products/', 'products/');
      const { data, error } = await supabase.storage
        .from('documents')
        .list(storagePath.split('/').slice(0, -1).join('/'), {
          search: storagePath.split('/').pop()
        });
      
      return !error && data && data.length > 0;
    } catch {
      return false;
    }
  };

  const startUploadSession = (productId: string) => {
    setUploadSessions(prev => {
      const exists = prev.find(session => session.productId === productId);
      if (exists) return prev;
      
      return [...prev, {
        productId,
        uploading: false,
        progress: 0
      }];
    });
  };

  const updateUploadSession = (productId: string, updates: Partial<UploadSession>) => {
    setUploadSessions(prev => prev.map(session => 
      session.productId === productId ? { ...session, ...updates } : session
    ));
  };

  const handleFileSelect = (productId: string, fileType: 'glb' | 'jpg', file: File) => {
    updateUploadSession(productId, { [fileType + 'File']: file });
  };

  const uploadAssets = async (productId: string) => {
    const session = uploadSessions.find(s => s.productId === productId);
    if (!session) return;

    updateUploadSession(productId, { uploading: true, progress: 0 });

    try {
      // Find product or variant
      let product = assetStatus.find(p => p.productId === productId);
      let variant: VariantAssetStatus | undefined;
      
      if (!product) {
        // Look for variant in product variants
        for (const prod of assetStatus) {
          if (prod.variants) {
            variant = prod.variants.find(v => v.variantId === productId);
            if (variant) {
              product = prod;
              break;
            }
          }
        }
      }

      if (!product && !variant) throw new Error('Product or variant not found');

      let completedUploads = 0;
      const totalUploads = (session.glbFile ? 1 : 0) + (session.jpgFile ? 1 : 0);

      // Determine file paths based on whether it's a variant or main product
      const fileBaseName = variant ? variant.variantId : productId;
      const folderName = variant ? variant.variantId : productId;

      // Upload GLB file
      if (session.glbFile) {
        const glbPath = `products/${folderName}/${fileBaseName}.glb`;
        const { error: glbError } = await supabase.storage
          .from('documents')
          .upload(glbPath, session.glbFile, { upsert: true });

        if (glbError) throw glbError;
        completedUploads++;
        updateUploadSession(productId, { progress: (completedUploads / totalUploads) * 100 });
      }

      // Upload JPG file
      if (session.jpgFile) {
        const jpgPath = `products/${folderName}/${fileBaseName}.jpg`;
        const { error: jpgError } = await supabase.storage
          .from('documents')
          .upload(jpgPath, session.jpgFile, { upsert: true });

        if (jpgError) throw jpgError;
        completedUploads++;
        updateUploadSession(productId, { progress: 100 });
      }

      const displayName = variant ? variant.variantName : product.productName;
      toast({
        title: "Upload Successful",
        description: `Assets uploaded for ${displayName}`,
      });

      // Remove upload session and reload data
      setUploadSessions(prev => prev.filter(s => s.productId !== productId));
      await loadProductData();

    } catch (error) {
      console.error('Upload error:', error);
      updateUploadSession(productId, { uploading: false });
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800">Complete</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800">Missing</Badge>;
    }
  };

  // Toggle variant expansion
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

  // Filter and search logic
  const filteredProducts = assetStatus.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.productId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || product.status === filterStatus;
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesFilter && matchesCategory;
  });

  // Statistics
  const totalProducts = assetStatus.length;
  const completeProducts = assetStatus.filter(p => p.status === 'complete').length;
  const partialProducts = assetStatus.filter(p => p.status === 'partial').length;
  const missingProducts = assetStatus.filter(p => p.status === 'missing').length;

  const categories = Array.from(new Set(assetStatus.map(p => p.category)));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Enhanced Product Asset Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Statistics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{totalProducts}</div>
              <div className="text-sm text-blue-600">Total Products</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{completeProducts}</div>
              <div className="text-sm text-green-600">Complete Assets</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">{partialProducts}</div>
              <div className="text-sm text-yellow-600">Partial Assets</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{missingProducts}</div>
              <div className="text-sm text-red-600">Missing Assets</div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="complete">Complete</option>
                <option value="partial">Partial</option>
                <option value="missing">Missing</option>
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Asset Grid */}
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const uploadSession = uploadSessions.find(s => s.productId === product.productId);
              const isExpanded = expandedProducts.has(product.productId);
              const hasVariants = product.variants && product.variants.length > 0;
              
              return (
                <div key={product.productId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {hasVariants && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleProductExpansion(product.productId)}
                            className="h-6 w-6 p-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {getStatusIcon(product.status)}
                        <h3 className="font-medium">{product.productName}</h3>
                        {getStatusBadge(product.status)}
                        {hasVariants && (
                          <Badge variant="secondary" className="text-xs">
                            {product.variants.length} variants
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        ID: {product.productId} | Category: {product.category}
                      </div>
                      {!hasVariants && (
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Box className="h-4 w-4" />
                            <span className={product.hasGLB ? 'text-green-600' : 'text-red-600'}>
                              GLB Model {product.hasGLB ? '✓' : '✗'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Image className="h-4 w-4" />
                            <span className={product.hasJPG ? 'text-green-600' : 'text-red-600'}>
                              JPG Image {product.hasJPG ? '✓' : '✗'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium mb-1">{product.completionPercentage}%</div>
                      <Progress value={product.completionPercentage} className="w-20 h-2" />
                    </div>
                  </div>

                  {/* Variants List for Innosin Lab Products */}
                  {hasVariants && isExpanded && (
                    <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4 mb-4">
                      {product.variants!.map((variant) => {
                        const variantUploadSession = uploadSessions.find(s => s.productId === variant.variantId);
                        
                        return (
                          <div key={variant.variantId} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {getStatusIcon(variant.status)}
                                  <h4 className="font-medium text-sm">{variant.variantName}</h4>
                                  {getStatusBadge(variant.status)}
                                </div>
                                <div className="text-xs text-gray-600 mb-2">
                                  Variant ID: {variant.variantId} | Info: {variant.variantInfo}
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                  <div className="flex items-center gap-1">
                                    <Box className="h-3 w-3" />
                                    <span className={variant.hasGLB ? 'text-green-600' : 'text-red-600'}>
                                      GLB {variant.hasGLB ? '✓' : '✗'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Image className="h-3 w-3" />
                                    <span className={variant.hasJPG ? 'text-green-600' : 'text-red-600'}>
                                      JPG {variant.hasJPG ? '✓' : '✗'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-medium mb-1">{variant.completionPercentage}%</div>
                                <Progress value={variant.completionPercentage} className="w-16 h-1" />
                              </div>
                            </div>

                            {/* Variant Upload Interface */}
                            {!variantUploadSession ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startUploadSession(variant.variantId)}
                                disabled={variant.status === 'complete'}
                                className="h-7 text-xs"
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                Upload Variant Assets
                              </Button>
                            ) : (
                              <div className="space-y-2 bg-white p-2 rounded border">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {!variant.hasGLB && (
                                    <div>
                                      <Label className="text-xs">GLB Model</Label>
                                      <Input
                                        type="file"
                                        accept=".glb"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleFileSelect(variant.variantId, 'glb', file);
                                        }}
                                        className="h-7 text-xs"
                                      />
                                    </div>
                                  )}
                                  {!variant.hasJPG && (
                                    <div>
                                      <Label className="text-xs">JPG Image</Label>
                                      <Input
                                        type="file"
                                        accept=".jpg,.jpeg"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleFileSelect(variant.variantId, 'jpg', file);
                                        }}
                                        className="h-7 text-xs"
                                      />
                                    </div>
                                  )}
                                </div>
                                
                                {variantUploadSession.uploading && (
                                  <div className="space-y-1">
                                    <div className="text-xs">Uploading... {variantUploadSession.progress.toFixed(0)}%</div>
                                    <Progress value={variantUploadSession.progress} className="h-1" />
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => uploadAssets(variant.variantId)}
                                    disabled={variantUploadSession.uploading || (!variantUploadSession.glbFile && !variantUploadSession.jpgFile)}
                                    className="h-7 text-xs"
                                  >
                                    Upload Files
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setUploadSessions(prev => prev.filter(s => s.productId !== variant.variantId))}
                                    disabled={variantUploadSession.uploading}
                                    className="h-7 text-xs"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Main Product Upload Interface (for non-variant products) */}
                  {!hasVariants && !uploadSession && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startUploadSession(product.productId)}
                      disabled={product.status === 'complete'}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Assets
                    </Button>
                  )}

                  {!hasVariants && uploadSession && (
                    <div className="space-y-3 bg-gray-50 p-3 rounded">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {!product.hasGLB && (
                          <div>
                            <Label className="text-sm">GLB Model</Label>
                            <Input
                              type="file"
                              accept=".glb"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileSelect(product.productId, 'glb', file);
                              }}
                              className="h-8"
                            />
                          </div>
                        )}
                        {!product.hasJPG && (
                          <div>
                            <Label className="text-sm">JPG Image</Label>
                            <Input
                              type="file"
                              accept=".jpg,.jpeg"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileSelect(product.productId, 'jpg', file);
                              }}
                              className="h-8"
                            />
                          </div>
                        )}
                      </div>
                      
                      {uploadSession.uploading && (
                        <div className="space-y-2">
                          <div className="text-sm">Uploading... {uploadSession.progress.toFixed(0)}%</div>
                          <Progress value={uploadSession.progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => uploadAssets(product.productId)}
                          disabled={uploadSession.uploading || (!uploadSession.glbFile && !uploadSession.jpgFile)}
                        >
                          Upload Files
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setUploadSessions(prev => prev.filter(s => s.productId !== product.productId))}
                          disabled={uploadSession.uploading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedAssetManager;