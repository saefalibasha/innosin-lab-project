import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, ShoppingCart, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductImageGallery from '@/components/ProductImageGallery';
import ModelViewer from '@/components/ModelViewer';
import AnimatedSection from '@/components/AnimatedSection';
import { useRFQ } from '@/contexts/RFQContext';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { productPageContent } from '@/data/productPageContent';
import { usePerformanceLogger } from '@/hooks/usePerformanceLogger';
import { useProductById } from '@/hooks/useEnhancedProducts';
import VariantSelector from '@/components/VariantSelector';
import WallCabinetConfigurator from '@/components/product/WallCabinetConfigurator';
import ModularCabinetConfigurator from '@/components/product/ModularCabinetConfigurator';

const ProductDetail = () => {
  usePerformanceLogger('ProductDetail');
  const { id } = useParams<{ id: string }>();
  const { addItem } = useRFQ();
  const [activeTab, setActiveTab] = useState('overview');

  // Use the enhanced hook instead of manual fetching
  const { product, loading, error } = useProductById(id);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const handleAddToQuote = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      name: product.name,
      category: product.category,
      dimensions: product.dimensions,
      image: product.thumbnail
    });
    toast.success(`${product.name} ${productPageContent.productDetail.addToQuoteSuccess}`);
  };

  const getProductImages = (product: Product): string[] => {
    const validImages: string[] = [];
    
    // Priority: seriesOverviewImage > overviewImage > thumbnail > images
    if (product.seriesOverviewImage && !product.seriesOverviewImage.includes('placeholder')) {
      validImages.push(product.seriesOverviewImage);
    } else if (product.overviewImage && !product.overviewImage.includes('placeholder')) {
      validImages.push(product.overviewImage);
    } else if (product.thumbnail && !product.thumbnail.includes('placeholder')) {
      validImages.push(product.thumbnail);
    }
    
    // Add additional images if available and not placeholders
    if (product.images && product.images.length > 0) {
      const additionalImages = product.images.filter(img => 
        img && 
        !img.includes('placeholder') && 
        !validImages.includes(img)
      );
      validImages.push(...additionalImages);
    }
    
    return validImages.length > 0 ? validImages : ['/placeholder.svg'];
  };

  const getThumbnail = (product: Product): string => {
    // Return the best available image, avoiding placeholders
    return product.seriesOverviewImage || 
           product.overviewImage || 
           product.thumbnail || 
           (product.images && product.images.length > 0 ? product.images[0] : '') ||
           '/placeholder.svg';
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-20">
          <div className="container-custom py-12">
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading product details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-20">
          <div className="container-custom py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading Product</h1>
              <p className="text-muted-foreground mb-8">{error}</p>
              <Link to="/products">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-20">
          <div className="container-custom py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
              <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
              <Link to="/products">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const images = getProductImages(product);
  const thumbnail = getThumbnail(product);

  // Enhanced variant configuration section
  const renderVariantSelector = () => {
    if (!product.variants || product.variants.length === 0) {
      return null;
    }

    // Check if this is a wall cabinet
    const isWallCabinet = product.category?.toLowerCase().includes('wall cabinet') || 
                         product.name.toLowerCase().includes('wall cabinet');

    // Enhanced modular cabinet detection
    const productSeries = (product as any).product_series?.toLowerCase() || '';
    const productCode = (product as any).product_code?.toUpperCase() || '';
    const isModularCabinet = productSeries.includes('modular cabinet') ||
                           productSeries.includes('mobile cabinet') ||
                           product.category?.toLowerCase().includes('modular cabinet') ||
                           product.category?.toLowerCase().includes('mobile cabinet') ||
                           product.name.toLowerCase().includes('mobile cabinet') ||
                           product.name.toLowerCase().includes('modular cabinet') ||
                           productCode.includes('MC-') ||
                           productCode.includes('MCC-');

    console.log('🔍 Product detection:', {
      id: product.id,
      category: product.category,
      name: product.name,
      product_series: productSeries,
      product_code: productCode,
      isWallCabinet,
      isModularCabinet,
      variantCount: product.variants.length
    });

    if (isWallCabinet) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Wall Cabinet Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <WallCabinetConfigurator
              variants={product.variants.map(v => ({
                id: v.id,
                name: (v as any).name || product.name,
                product_code: (v as any).product_code || '',
                dimensions: v.dimensions,
                finish_type: (v as any).finish_type || 'PC',
                orientation: v.orientation || 'None',
                door_type: (v as any).door_type || 'Single-Door',
                thumbnail_path: v.thumbnail,
                model_path: v.modelPath,
                additional_images: v.images || []
              }))}
              onVariantSelect={handleVariantSelect}
              selectedVariant={selectedVariant ? {
                id: selectedVariant.id,
                name: (selectedVariant as any).name || product.name,
                product_code: (selectedVariant as any).product_code || '',
                dimensions: selectedVariant.dimensions,
                finish_type: (selectedVariant as any).finish_type || 'PC',
                orientation: selectedVariant.orientation || 'None',
                door_type: (selectedVariant as any).door_type || 'Single-Door',
                thumbnail_path: selectedVariant.thumbnail,
                model_path: selectedVariant.modelPath,
                additional_images: selectedVariant.images || []
              } : undefined}
            />
          </CardContent>
        </Card>
      );
    }

    if (isModularCabinet) {
      console.log('🔧 Rendering ModularCabinetConfigurator with variants:', product.variants.length);
      return (
        <Card>
          <CardHeader>
            <CardTitle>Modular Cabinet Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <ModularCabinetConfigurator
              variants={product.variants.map(v => ({
                id: v.id,
                name: (v as any).name || product.name,
                product_code: (v as any).product_code || '',
                dimensions: v.dimensions,
                finish_type: (v as any).finish_type || 'PC',
                orientation: v.orientation || 'None',
                door_type: (v as any).door_type || '',
                drawer_count: (v as any).drawer_count || undefined,
                thumbnail_path: v.thumbnail,
                model_path: v.modelPath,
                additional_images: v.images || []
              }))}
              onVariantSelect={handleVariantSelect}
              selectedVariant={selectedVariant ? {
                id: selectedVariant.id,
                name: (selectedVariant as any).name || product.name,
                product_code: (selectedVariant as any).product_code || '',
                dimensions: selectedVariant.dimensions,
                finish_type: (selectedVariant as any).finish_type || 'PC',
                orientation: selectedVariant.orientation || 'None',
                door_type: (selectedVariant as any).door_type || '',
                drawer_count: (selectedVariant as any).drawer_count || undefined,
                thumbnail_path: selectedVariant.thumbnail,
                model_path: selectedVariant.modelPath,
                additional_images: selectedVariant.images || []
              } : undefined}
            />
          </CardContent>
        </Card>
      );
    }

    // Default variant selector for other products
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <VariantSelector
            variants={product.variants}
            onVariantSelect={handleVariantSelect}
            selectedVariant={selectedVariant}
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20">
        <div className="container-custom py-8">
          {/* Breadcrumb */}
          <AnimatedSection animation="fade-in" delay={100}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link to="/products" className="hover:text-foreground transition-colors">
                Products
              </Link>
              <span>/</span>
              <span className="text-foreground">{product.name}</span>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <AnimatedSection animation="slide-in-left" delay={200}>
              <div className="space-y-6">
                <ProductImageGallery
                  images={images}
                  thumbnail={thumbnail}
                  productName={product.name}
                  className="w-full h-96 lg:h-[500px]"
                />
              </div>
            </AnimatedSection>

            {/* Product Details */}
            <AnimatedSection animation="slide-in-right" delay={300}>
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <Badge variant="outline" className="mb-3 border-sea text-sea">
                    {product.category}
                  </Badge>
                  <h1 className="text-3xl font-serif font-bold text-primary mb-2">
                    {product.name}
                  </h1>
                  {product.dimensions && (
                    <p className="text-lg text-muted-foreground">
                      {productPageContent.productDetail.dimensions}: {product.dimensions}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.fullDescription || product.description}
                  </p>
                </div>

                {/* Specifications */}
                {product.specifications && product.specifications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">{productPageContent.productDetail.keyFeatures}</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.specifications.map((spec, index) => (
                        <Badge key={index} variant="secondary">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    onClick={handleAddToQuote}
                    className="flex-1 bg-sea hover:bg-sea-dark transition-all duration-300"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {productPageContent.productDetail.addToQuote}
                  </Button>
                  {product.modelPath && !product.modelPath.includes('placeholder') && (
                    <Button variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View 3D Model
                    </Button>
                  )}
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Variant Configuration */}
          {product.variants && product.variants.length > 0 && (
            <AnimatedSection animation="fade-in" delay={350}>
              {renderVariantSelector()}
            </AnimatedSection>
          )}

          {/* Detailed Information Tabs */}
          <AnimatedSection animation="fade-in" delay={400}>
            <div className="mt-16">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                  <TabsTrigger value="overview">{productPageContent.productDetail.tabs.overview}</TabsTrigger>
                  <TabsTrigger value="specifications">{productPageContent.productDetail.tabs.specifications}</TabsTrigger>
                  <TabsTrigger value="3d-model">{productPageContent.productDetail.tabs.model3D}</TabsTrigger>
                  <TabsTrigger value="downloads">{productPageContent.productDetail.tabs.downloads}</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{productPageContent.productDetail.productOverview}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {product.fullDescription || product.description}
                      </p>
                      {product.specifications && product.specifications.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-semibold mb-3">{productPageContent.productDetail.keyFeatures}:</h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {product.specifications.map((spec, index) => (
                              <li key={index}>{spec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="specifications" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{productPageContent.productDetail.technicalSpecs}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.dimensions && (
                          <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">{productPageContent.productDetail.dimensions}</span>
                            <span className="text-muted-foreground">{product.dimensions}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">{productPageContent.productDetail.category}</span>
                          <span className="text-muted-foreground">{product.category}</span>
                        </div>
                        {product.specifications && product.specifications.map((spec, index) => (
                          <div key={index} className="flex justify-between py-2 border-b">
                            <span className="font-medium">Feature {index + 1}</span>
                            <span className="text-muted-foreground">{spec}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="3d-model" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{productPageContent.productDetail.interactiveModel}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {product.modelPath && !product.modelPath.includes('placeholder') ? (
                        <div className="h-96 bg-muted rounded-lg">
                          <ModelViewer modelPath={product.modelPath} />
                        </div>
                      ) : (
                        <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                          <p className="text-muted-foreground">3D model not available for this product</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="downloads" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{productPageContent.productDetail.downloadResources}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">Product Specification Sheet</h4>
                            <p className="text-sm text-muted-foreground">Detailed technical specifications</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                        </div>
                        {product.modelPath && !product.modelPath.includes('placeholder') && (
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">3D Model File</h4>
                              <p className="text-sm text-muted-foreground">GLB format for 3D visualization</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download 3D Model
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
