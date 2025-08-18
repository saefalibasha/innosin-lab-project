
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';
import { Product } from '@/types/product';
import { fetchProductWithVariants } from '@/services/enhancedProductService';
import UniversalProductConfigurator from '@/components/product/UniversalProductConfigurator';
import StickyProductAssets from '@/components/product/StickyProductAssets';
import { useMissingModelsTracker } from '@/hooks/useMissingModelsTracker';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Product | null>(null);
  const [selectedFinish, setSelectedFinish] = useState('PC');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const missingModelsTracker = useMissingModelsTracker();

  // Enhanced product type detection for all series
  const getProductType = useCallback((product: Product) => {
    if (!product) return 'unknown';
    
    const name = product.name?.toLowerCase() || '';
    const category = product.category?.toLowerCase() || '';
    const series = product.product_series?.toLowerCase() || '';
    const companyTags = product.company_tags || [];
    
    // Broen-Lab series
    if (name.includes('emergency') && name.includes('shower')) return 'emergency_shower';
    if (name.includes('uniflex') || name.includes('tap')) return 'uniflex_tap';
    
    // Safe Aire II
    if (name.includes('fume') && name.includes('hood')) return 'fume_hood';
    
    // Oriental Giken and Innosin Lab series
    if (companyTags.includes('Oriental Giken') || companyTags.includes('Innosin') || 
        category.includes('oriental') || category.includes('innosin')) {
      
      if (name.includes('modular') || series.includes('modular')) return 'modular_cabinet';
      if ((name.includes('mc-') || name.includes('mcc-') || name.includes('mobile')) && name.includes('cabinet')) return 'mobile_cabinet';
      if ((name.includes('wcg-') || name.includes('wall')) && name.includes('cabinet')) return 'wall_cabinet';
      if ((name.includes('tcg-') || name.includes('tall')) && name.includes('cabinet')) return 'tall_cabinet';
      if (name.includes('or-') && (name.includes('open') || name.includes('rack'))) return 'open_rack';
      if (name.includes('sink')) return 'sink_cabinet';
    }
    
    // Fallback patterns
    if (name.includes('cabinet')) {
      if (name.includes('mobile')) return 'mobile_cabinet';
      if (name.includes('wall')) return 'wall_cabinet';
      if (name.includes('tall')) return 'tall_cabinet';
      return 'modular_cabinet';
    }
    
    return 'unknown';
  }, []);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 Fetching product details for ID: ${productId}`);
      
      const { product: fetchedProduct, variants: fetchedVariants } = await fetchProductWithVariants(productId);
      
      if (!fetchedProduct) {
        setError('Product not found');
        return;
      }
      
      setProduct(fetchedProduct);
      setVariants(fetchedVariants);
      setSelectedVariant(fetchedVariants[0] || fetchedProduct);
      
      console.log(`✅ Successfully loaded product: ${fetchedProduct.name}`);
      console.log(`✅ Found ${fetchedVariants.length} variants`);
      
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleVariantChange = useCallback((variantId: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      setSelectedVariant(variant);
      console.log(`🔄 Switched to variant: ${variant.name}`);
    }
  }, [variants]);

  const handleFinishChange = useCallback((finish: string) => {
    setSelectedFinish(finish);
    console.log(`🎨 Changed finish to: ${finish}`);
  }, []);

  // Enhanced configurator eligibility check
  const isConfiguratorEligible = useCallback((product: Product, variants: Product[]) => {
    if (!product || !variants || variants.length <= 1) return false;
    
    // Check if variants have meaningful differences
    const hasVariantDifferences = variants.some(variant => 
      variant.dimensions !== variants[0].dimensions ||
      variant.door_type !== variants[0].door_type ||
      variant.orientation !== variants[0].orientation ||
      variant.drawer_count !== variants[0].drawer_count ||
      variant.mounting_type !== variants[0].mounting_type ||
      variant.mixing_type !== variants[0].mixing_type ||
      variant.handle_type !== variants[0].handle_type ||
      variant.emergency_shower_type !== variants[0].emergency_shower_type ||
      variant.product_code !== variants[0].product_code
    );
    
    return hasVariantDifferences;
  }, []);

  const getCurrentAssets = useCallback(() => {
    const currentVariant = selectedVariant || product;
    if (!currentVariant) return null;
    
    return {
      thumbnail: currentVariant.thumbnail_path || currentVariant.thumbnail || '',
      model: currentVariant.model_path || currentVariant.modelPath || '',
      images: currentVariant.images || []
    };
  }, [selectedVariant, product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'The requested product could not be found.'}</p>
        </div>
      </div>
    );
  }

  const currentProductType = getProductType(product);
  const showConfigurator = isConfiguratorEligible(product, variants);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Sticky Product Assets */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <StickyProductAssets
              currentAssets={getCurrentAssets()}
              productName={selectedVariant?.name || product.name}
              className="w-full"
              onMissingModel={missingModelsTracker.trackMissingModel}
              productId={selectedVariant?.id || product.id}
            />
          </div>

          {/* Right Column - Product Information */}
          <div className="space-y-8">
            {/* Product Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    {selectedVariant?.editable_title || selectedVariant?.name || product.name}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary">{product.category}</Badge>
                    {product.company_tags?.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                    {selectedVariant?.product_code && (
                      <Badge variant="outline">Code: {selectedVariant.product_code}</Badge>
                    )}
                    {currentProductType !== 'unknown' && (
                      <Badge variant="outline">
                        {currentProductType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-lg text-muted-foreground">
                {selectedVariant?.editable_description || selectedVariant?.description || product.description}
              </p>
            </div>

            {/* Universal Product Configurator */}
            {showConfigurator && (
              <Card>
                <CardHeader>
                  <CardTitle>Configure Your Product</CardTitle>
                  <CardDescription>
                    Customize this {currentProductType.replace('_', ' ')} to meet your specific requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UniversalProductConfigurator
                    variants={variants}
                    selectedVariantId={selectedVariant?.id || ''}
                    onVariantChange={handleVariantChange}
                    selectedFinish={selectedFinish}
                    onFinishChange={handleFinishChange}
                    productType={currentProductType}
                  />
                </CardContent>
              </Card>
            )}

            {/* Product Information Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-muted-foreground">
                        {selectedVariant?.fullDescription || product.fullDescription || 
                         selectedVariant?.description || product.description ||
                         'No detailed description available.'}
                      </p>
                    </div>
                    
                    {selectedVariant?.dimensions && (
                      <div>
                        <h4 className="font-medium mb-2">Dimensions</h4>
                        <p className="text-muted-foreground">{selectedVariant.dimensions}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="specifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Technical Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {product.specifications && product.specifications.length > 0 ? (
                      <div className="space-y-2">
                        {product.specifications.map((spec, index) => (
                          <div key={index} className="flex justify-between py-2 border-b last:border-b-0">
                            <span className="font-medium">{spec.name || `Specification ${index + 1}`}</span>
                            <span className="text-muted-foreground">{spec.value || spec}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No specifications available for this product.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedVariant?.product_code && (
                        <div>
                          <h4 className="font-medium">Product Code</h4>
                          <p className="text-muted-foreground">{selectedVariant.product_code}</p>
                        </div>
                      )}
                      
                      {selectedVariant?.finish_type && (
                        <div>
                          <h4 className="font-medium">Finish Type</h4>
                          <p className="text-muted-foreground">{selectedVariant.finish_type}</p>
                        </div>
                      )}
                      
                      {selectedVariant?.cabinet_class && (
                        <div>
                          <h4 className="font-medium">Cabinet Class</h4>
                          <p className="text-muted-foreground">{selectedVariant.cabinet_class}</p>
                        </div>
                      )}
                      
                      {selectedVariant?.drawer_count && selectedVariant.drawer_count > 0 && (
                        <div>
                          <h4 className="font-medium">Drawer Count</h4>
                          <p className="text-muted-foreground">{selectedVariant.drawer_count}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
