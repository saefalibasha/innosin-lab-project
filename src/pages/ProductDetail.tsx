
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Package, Ruler, Tag } from 'lucide-react';
import { useProductById } from '@/hooks/useEnhancedProducts';
import SeriesProductConfigurator from '@/components/product/SeriesProductConfigurator';
import ProductAssetViewer from '@/components/product/ProductAssetViewer';
import { useToast } from '@/hooks/use-toast';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProductById(id);
  const { toast } = useToast();

  const handleBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          <span>Loading product details...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-500 mb-4">{error || 'Product not found'}</p>
            <Button onClick={handleBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-muted-foreground mb-4">{product.description}</p>
            
            {/* Company Tags */}
            {product.company_tags && product.company_tags.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  {product.company_tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="default" 
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Badge variant={product.is_active ? "default" : "secondary"}>
            {product.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Product Assets (Images & 3D Model) */}
        <div className="lg:col-span-2">
          <ProductAssetViewer 
            currentAssets={{
              thumbnail: product.thumbnail,
              model: product.modelPath,
              images: product.images
            }}
            productName={product.name}
            productId={product.id}
          />
        </div>

        {/* Right Column - Series Configurator */}
        <div className="space-y-6">
          <SeriesProductConfigurator 
            series={product}
            variants={[product]}
            selectedVariantId={product.id}
            onVariantChange={(variantId) => {
              // Navigate to the selected variant
              window.location.href = `/products/${variantId}`;
            }}
            selectedFinish={product.finish_type || 'PC'}
            onFinishChange={(finish) => {
              // Handle finish change
              console.log('Finish changed to:', finish);
            }}
          />
        </div>
      </div>

      {/* Product Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {product.product_code && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Product Code</dt>
                <dd className="text-sm">{product.product_code}</dd>
              </div>
            )}
            
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Category</dt>
              <dd className="text-sm">
                <Badge variant="outline">{product.category}</Badge>
              </dd>
            </div>

            {product.product_series && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Series</dt>
                <dd className="text-sm">{product.product_series}</dd>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dimensions */}
        {product.dimensions && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Dimensions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{product.dimensions}</p>
            </CardContent>
          </Card>
        )}

        {/* Additional Details - Only show if we have finish_type */}
        {product.finish_type && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Finish</dt>
                <dd className="text-sm">{product.finish_type}</dd>
              </div>
              
              {product.orientation && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Orientation</dt>
                  <dd className="text-sm">{product.orientation}</dd>
                </div>
              )}
              
              {product.door_type && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Door Type</dt>
                  <dd className="text-sm">{product.door_type}</dd>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Full Description */}
      {product.fullDescription && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Full Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {product.fullDescription.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductDetail;
