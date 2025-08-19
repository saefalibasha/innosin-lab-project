
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Package, Wrench, FileText, Download, Eye, Settings } from 'lucide-react';
import { toast } from 'sonner';
import productService from '@/services/productService';
import { Product } from '@/types/product';
import ProductViewer3D from '@/components/product/ProductViewer3D';
import SeriesProductConfigurator from '@/components/product/SeriesProductConfigurator';
import VariantSelector from '@/components/product/VariantSelector';

const EnhancedProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedFinish, setSelectedFinish] = useState<string>('powder_coat');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const productData = await productService.getProductById(id);
      
      if (!productData) {
        setError('Product not found');
        return;
      }

      setProduct(productData);

      // If this is a series parent, fetch its variants
      if (productData.parent_series_id === null || productData.parent_series_id === undefined) {
        const variantData = await productService.getVariantsBySeriesId(id);
        setVariants(variantData);
        
        // Set the first variant as selected if available
        if (variantData.length > 0) {
          setSelectedVariantId(variantData[0].id);
        }
      } else {
        // This is a variant, so fetch siblings
        const parentId = productData.parent_series_id;
        if (parentId) {
          const variantData = await productService.getVariantsBySeriesId(parentId);
          setVariants(variantData);
          setSelectedVariantId(id);
        }
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Failed to load product details');
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayProduct = () => {
    if (variants.length > 0 && selectedVariantId) {
      return variants.find(v => v.id === selectedVariantId) || product;
    }
    return product;
  };

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
    // Navigate to the selected variant
    navigate(`/products/${variantId}`, { replace: true });
  };

  const handleFinishChange = (finish: string) => {
    setSelectedFinish(finish);
  };

  const handleDownloadSpecs = () => {
    toast.info('Specification download feature coming soon!');
  };

  const handleRequestQuote = () => {
    toast.info('Quote request feature coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading product details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Product Not Found</h2>
              <p className="text-muted-foreground mb-4">
                {error || 'The requested product could not be found.'}
              </p>
              <Button onClick={() => navigate('/products')}>
                Browse All Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayProduct = getDisplayProduct();
  const isSeriesParent = variants.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{displayProduct?.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{displayProduct?.category}</Badge>
                {displayProduct?.product_code && (
                  <Badge variant="outline">Code: {displayProduct.product_code}</Badge>
                )}
                {isSeriesParent && (
                  <Badge variant="default">
                    <Package className="w-3 h-3 mr-1" />
                    Product Series
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleDownloadSpecs}>
              <Download className="w-4 h-4 mr-2" />
              Download Specs
            </Button>
            <Button onClick={handleRequestQuote}>
              <Wrench className="w-4 h-4 mr-2" />
              Request Quote
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 3D Viewer */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  3D Product View
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <ProductViewer3D
                    modelPath={displayProduct?.modelPath || ''}
                    productName={displayProduct?.name || ''}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tabs for detailed information */}
            <Card className="mt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <CardHeader className="pb-3">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="specifications">Specifications</TabsTrigger>
                    <TabsTrigger value="documentation">Documentation</TabsTrigger>
                  </TabsList>
                </CardHeader>
                
                <CardContent>
                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Product Description</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {displayProduct?.fullDescription || displayProduct?.description || 'No description available.'}
                      </p>
                    </div>
                    
                    {displayProduct?.dimensions && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Dimensions</h3>
                        <p className="text-muted-foreground">{displayProduct.dimensions}</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="specifications" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Technical Specifications</h3>
                      {displayProduct?.specifications && displayProduct.specifications.length > 0 ? (
                        <div className="grid gap-3">
                          {displayProduct.specifications.map((spec, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                              <span className="font-medium">{spec.name || `Specification ${index + 1}`}</span>
                              <span className="text-muted-foreground">{spec.value || spec}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No specifications available.</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="documentation" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Available Documentation</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Product Specification Sheet</p>
                              <p className="text-sm text-muted-foreground">Detailed technical specifications</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Download</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Installation Guide</p>
                              <p className="text-sm text-muted-foreground">Step-by-step installation instructions</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Download</Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Configuration */}
          <div className="space-y-6">
            {isSeriesParent ? (
              <SeriesProductConfigurator
                series={product}
                variants={variants}
                selectedVariantId={selectedVariantId}
                onVariantChange={handleVariantChange}
                selectedFinish={selectedFinish}
                onFinishChange={handleFinishChange}
              />
            ) : (
              <VariantSelector
                variants={variants}
                selectedVariantId={selectedVariantId}
                onVariantChange={handleVariantChange}
                selectedFinish={selectedFinish}
                onFinishChange={handleFinishChange}
                groupByDimensions={false}
              />
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleRequestQuote}>
                  <Wrench className="w-4 h-4 mr-2" />
                  Request Custom Quote
                </Button>
                <Button variant="outline" className="w-full" onClick={handleDownloadSpecs}>
                  <Download className="w-4 h-4 mr-2" />
                  Download All Specs
                </Button>
                <Button variant="outline" className="w-full">
                  <Package className="w-4 h-4 mr-2" />
                  View Related Products
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductDetail;
