import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  X,
  Search,
  Filter,
  Download,
  Eye,
  Edit3
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
  const { toast } = useToast();

  useEffect(() => {
    loadProductData();
  }, []);

  const loadProductData = async () => {
    try {
      // Load all products from the catalog
      const allProducts = getProductsSync();
      setProducts(allProducts);

      // Check asset status for each product
      const statusPromises = allProducts.map(async (product) => {
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

        const brand = product.category.toLowerCase().includes('innosin') ? 'innosin-lab' :
                      product.category.toLowerCase().includes('broen') ? 'broen-lab' :
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
      const response = await fetch(path, { method: 'HEAD' });
      return response.ok;
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
      const product = assetStatus.find(p => p.productId === productId);
      if (!product) throw new Error('Product not found');

      let completedUploads = 0;
      const totalUploads = (session.glbFile ? 1 : 0) + (session.jpgFile ? 1 : 0);

      // Upload GLB file
      if (session.glbFile) {
        const glbPath = `products/${productId}/${productId}.glb`;
        const { error: glbError } = await supabase.storage
          .from('documents')
          .upload(glbPath, session.glbFile, { upsert: true });

        if (glbError) throw glbError;
        completedUploads++;
        updateUploadSession(productId, { progress: (completedUploads / totalUploads) * 100 });
      }

      // Upload JPG file
      if (session.jpgFile) {
        const jpgPath = `products/${productId}/${productId}.jpg`;
        const { error: jpgError } = await supabase.storage
          .from('documents')
          .upload(jpgPath, session.jpgFile, { upsert: true });

        if (jpgError) throw jpgError;
        completedUploads++;
        updateUploadSession(productId, { progress: 100 });
      }

      toast({
        title: "Upload Successful",
        description: `Assets uploaded for ${product.productName}`,
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
        return <X className="h-5 w-5 text-red-600" />;
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
              
              return (
                <div key={product.productId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(product.status)}
                        <h3 className="font-medium">{product.productName}</h3>
                        {getStatusBadge(product.status)}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        ID: {product.productId} | Category: {product.category}
                      </div>
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
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium mb-1">{product.completionPercentage}%</div>
                      <Progress value={product.completionPercentage} className="w-20 h-2" />
                    </div>
                  </div>

                  {/* Upload Interface */}
                  {!uploadSession ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startUploadSession(product.productId)}
                      disabled={product.status === 'complete'}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Assets
                    </Button>
                  ) : (
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