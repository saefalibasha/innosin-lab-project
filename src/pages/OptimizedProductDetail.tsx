
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Package, Eye, Download, Wrench, Settings } from 'lucide-react';
import { useOptimizedProductDetail } from '@/hooks/useOptimizedProductDetail';
import OptimizedProductViewer3D from '@/components/product/OptimizedProductViewer3D';
import EnhancedSeriesConfigurator from '@/components/product/EnhancedSeriesConfigurator';
import VariantSelector from '@/components/product/VariantSelector';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { toast } from 'sonner';

const ProductSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-20" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-[300px] w-full rounded-lg" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>
    </div>
  </div>
);

const OptimizedProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedFinish, setSelectedFinish] = useState<string>('PC');
  const [modelLoaded, setModelLoaded] = useState(false);

  const { product, variants, loading, error, loadingStates } = useOptimizedProductDetail(id);
  const { renderCount } = usePerformanceMonitor('OptimizedProductDetail');

  React.useEffect(() => {
    if (variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(variants[0].id);
    }
  }, [variants, selectedVariantId]);

  const handleBack = () => {
    navigate(-1);
  };

  const getDisplayProduct = () => {
    if (variants.length > 0 && selectedVariantId) {
      return variants.find(v => v.id === selectedVariantId) || product;
    }
    return product;
  };

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
    navigate(`/products/${variantId}`, { replace: true });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={handleBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Product Not Found</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => navigate('/products')}>
                Browse All Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show skeleton while loading product basics
  if (loading && !product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <ProductSkeleton />
        </div>
      </div>
    );
  }

  const displayProduct = getDisplayProduct();
  const isSeriesParent = product?.is_series_parent && variants.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header - Shows immediately when product loads */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack} className="shrink-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{displayProduct?.name || 'Loading...'}</h1>
              <div className="flex items-center gap-2 mt-2">
                {displayProduct?.category && (
                  <Badge variant="secondary">{displayProduct.category}</Badge>
                )}
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
            <Button variant="outline" onClick={() => toast.info('Download feature coming soon!')}>
              <Download className="w-4 h-4 mr-2" />
              Download Specs
            </Button>
            <Button onClick={() => toast.info('Quote feature coming soon!')}>
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
                  {!modelLoaded && <span className="text-sm text-muted-foreground">(Loading...)</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <OptimizedProductViewer3D
                    modelPath={displayProduct?.modelPath || ''}
                    productName={displayProduct?.name || ''}
                    onLoadComplete={() => setModelLoaded(true)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Configuration */}
          <div className="space-y-6">
            {loadingStates.variants ? (
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-32 mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ) : isSeriesParent ? (
              <EnhancedSeriesConfigurator
                series={product!}
                variants={variants}
                selectedVariantId={selectedVariantId}
                onVariantChange={handleVariantChange}
                selectedFinish={selectedFinish}
                onFinishChange={setSelectedFinish}
              />
            ) : (
              <VariantSelector
                variants={variants}
                selectedVariantId={selectedVariantId}
                onVariantChange={handleVariantChange}
                selectedFinish={selectedFinish}
                onFinishChange={setSelectedFinish}
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
                <Button className="w-full" onClick={() => toast.info('Quote feature coming soon!')}>
                  <Wrench className="w-4 h-4 mr-2" />
                  Request Custom Quote
                </Button>
                <Button variant="outline" className="w-full" onClick={() => toast.info('Download feature coming soon!')}>
                  <Download className="w-4 h-4 mr-2" />
                  Download All Specs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Information - Progressive Loading */}
        {displayProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {displayProduct.product_code && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Product Code</dt>
                    <dd className="text-sm">{displayProduct.product_code}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                  <dd className="text-sm">
                    <Badge variant="outline">{displayProduct.category}</Badge>
                  </dd>
                </div>
                {displayProduct.product_series && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Series</dt>
                    <dd className="text-sm">{displayProduct.product_series}</dd>
                  </div>
                )}
              </CardContent>
            </Card>

            {displayProduct.dimensions && (
              <Card>
                <CardHeader>
                  <CardTitle>Dimensions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{displayProduct.dimensions}</p>
                </CardContent>
              </Card>
            )}

            {displayProduct.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{displayProduct.description}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 text-xs text-muted-foreground">
            Renders: {renderCount} | Model Loaded: {modelLoaded ? 'Yes' : 'No'} | 
            Product: {loadingStates.product ? 'Loading' : 'Loaded'} | 
            Variants: {loadingStates.variants ? 'Loading' : 'Loaded'}
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizedProductDetail;
