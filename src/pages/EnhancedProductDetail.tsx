import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { fetchProductById, fetchProductsByParentSeriesId } from '@/api/products';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { UniversalProductConfigurator } from '@/components/product/UniversalProductConfigurator';
import { StickyProductAssets } from '@/components/product/StickyProductAssets';

const transformDatabaseProduct = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category,
    dimensions: dbProduct.dimensions || '',
    modelPath: dbProduct.model_path || '',
    thumbnail: dbProduct.thumbnail_path || '',
    images: dbProduct.additional_images || [],
    description: dbProduct.description || '',
    fullDescription: dbProduct.full_description || dbProduct.description || '',
    specifications: Array.isArray(dbProduct.specifications) ? dbProduct.specifications : [],
    finishes: [],
    variants: [],
    baseProductId: dbProduct.parent_series_id,
    finish_type: dbProduct.finish_type,
    orientation: dbProduct.orientation,
    drawer_count: dbProduct.drawer_count || 0,
    door_type: dbProduct.door_type,
    product_code: dbProduct.product_code || '',
    thumbnail_path: dbProduct.thumbnail_path,
    model_path: dbProduct.model_path,
    mounting_type: dbProduct.mounting_type,
    mixing_type: dbProduct.mixing_type,
    handle_type: dbProduct.handle_type,
    emergency_shower_type: dbProduct.emergency_shower_type,
    company_tags: dbProduct.company_tags || [],
    product_series: dbProduct.product_series,
    parent_series_id: dbProduct.parent_series_id,
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
    is_active: dbProduct.is_active
  };
};

const EnhancedProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const assetsSectionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchProductData(id);
    }
  }, [id]);

  // Sticky scroll behavior for assets
  useEffect(() => {
    const handleScroll = () => {
      if (assetsSectionRef.current) {
        const rect = assetsSectionRef.current.getBoundingClientRect();
        const shouldStick = rect.top <= 100; // Stick when 100px from top
        setIsSticky(shouldStick);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProductData = async (productId: string) => {
    try {
      setLoading(true);
      
      // Fetch the main product
      const productData = await fetchProductById(productId);
      const transformedProduct = transformDatabaseProduct(productData);
      setProduct(transformedProduct);
      setSelectedVariant(transformedProduct);

      // Fetch variants for this series
      let variantData: any[] = [];
      
      if (productData.is_series_parent && productData.id) {
        // This is a series parent, fetch all variants
        variantData = await fetchProductsByParentSeriesId(productData.id);
      } else if (productData.parent_series_id) {
        // This is a variant, fetch all variants in the same series
        variantData = await fetchProductsByParentSeriesId(productData.parent_series_id);
      } else if (productData.product_series) {
        // No explicit parent relationship, try to find other products in the same series
        const { data: seriesProducts } = await supabase
          .from('products')
          .select('*')
          .eq('product_series', productData.product_series)
          .eq('is_active', true);
        
        variantData = seriesProducts || [];
      }

      const transformedVariants = variantData.map(transformDatabaseProduct);
      setVariants(transformedVariants);
      
      // If we have variants and the current product isn't in the list, add it
      if (transformedVariants.length > 0) {
        const hasCurrentProduct = transformedVariants.some(v => v.id === transformedProduct.id);
        if (!hasCurrentProduct) {
          setVariants([transformedProduct, ...transformedVariants]);
        }
        
        // Set the first active variant as selected if we have variants
        const firstActiveVariant = transformedVariants.find(v => v.is_active) || transformedVariants[0];
        if (firstActiveVariant) {
          setSelectedVariant(firstActiveVariant);
        }
      }
      
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSelect = (variant: Product) => {
    setSelectedVariant(variant);
    // Smooth scroll to top to show the new variant
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine if we should show the configurator
  const shouldShowConfigurator = (product: Product, variants: Product[]) => {
    if (!product) return false;
    
    // Show configurator if we have multiple variants
    if (variants.length > 1) return true;
    
    // Check for specific series patterns that should have configurators
    const series = product.product_series?.toLowerCase() || '';
    
    // UNIFLEX Taps series
    if (series.includes('uniflex') || series.includes('single way taps') || 
        product.mixing_type || product.handle_type) {
      return true;
    }
    
    // Emergency Shower series
    if (series.includes('emergency shower') || product.emergency_shower_type) {
      return true;
    }
    
    // Safe Aire II / Fume Hoods
    if (series.includes('safe aire') || series.includes('fume hood') || 
        product.mounting_type) {
      return true;
    }
    
    // Innosin Lab series (existing logic)
    if (product.category?.includes('innosin') || series.includes('innosin')) {
      return true;
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );
  }

  const displayProduct = selectedVariant || product;
  const showConfigurator = shouldShowConfigurator(displayProduct, variants);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{displayProduct.name}</h1>
              <p className="text-gray-600">{displayProduct.product_code}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Sticky Assets */}
          <div 
            ref={assetsSectionRef}
            className={`${isSticky ? 'lg:sticky lg:top-24 lg:h-fit' : ''}`}
          >
            <StickyProductAssets 
              product={displayProduct}
              className="space-y-6"
            />
          </div>

          {/* Right Column - Details and Configurator */}
          <div className="space-y-6">
            {/* Product Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{displayProduct.name}</CardTitle>
                    <p className="text-muted-foreground mt-1">{displayProduct.category}</p>
                  </div>
                  <Badge variant="outline">{displayProduct.product_code}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{displayProduct.description}</p>
                </div>
                
                {displayProduct.dimensions && (
                  <div>
                    <h4 className="font-medium mb-2">Dimensions</h4>
                    <p className="text-muted-foreground">{displayProduct.dimensions}</p>
                  </div>
                )}

                <Separator />

                {/* Product Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {displayProduct.finish_type && (
                    <div>
                      <span className="font-medium">Finish:</span>
                      <p className="text-muted-foreground">{displayProduct.finish_type}</p>
                    </div>
                  )}
                  {displayProduct.orientation && (
                    <div>
                      <span className="font-medium">Orientation:</span>
                      <p className="text-muted-foreground">{displayProduct.orientation}</p>
                    </div>
                  )}
                  {displayProduct.door_type && (
                    <div>
                      <span className="font-medium">Door Type:</span>
                      <p className="text-muted-foreground">{displayProduct.door_type}</p>
                    </div>
                  )}
                  {displayProduct.drawer_count && displayProduct.drawer_count > 0 && (
                    <div>
                      <span className="font-medium">Drawers:</span>
                      <p className="text-muted-foreground">{displayProduct.drawer_count}</p>
                    </div>
                  )}
                  {displayProduct.mixing_type && (
                    <div>
                      <span className="font-medium">Mixing Type:</span>
                      <p className="text-muted-foreground">{displayProduct.mixing_type}</p>
                    </div>
                  )}
                  {displayProduct.handle_type && (
                    <div>
                      <span className="font-medium">Handle Type:</span>
                      <p className="text-muted-foreground">{displayProduct.handle_type}</p>
                    </div>
                  )}
                  {displayProduct.emergency_shower_type && (
                    <div>
                      <span className="font-medium">Emergency Type:</span>
                      <p className="text-muted-foreground">{displayProduct.emergency_shower_type}</p>
                    </div>
                  )}
                  {displayProduct.mounting_type && (
                    <div>
                      <span className="font-medium">Mounting:</span>
                      <p className="text-muted-foreground">{displayProduct.mounting_type}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Universal Product Configuration */}
            {showConfigurator && (
              <UniversalProductConfigurator
                products={variants.length > 1 ? variants : [displayProduct]}
                selectedProduct={selectedVariant}
                onProductSelect={handleVariantSelect}
                seriesName={displayProduct.product_series}
              />
            )}

            {/* Specifications */}
            {displayProduct.specifications && displayProduct.specifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {displayProduct.specifications.map((spec: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span className="font-medium">{spec.name || spec.key}:</span>
                        <span className="text-muted-foreground">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardContent className="py-6">
                <div className="flex gap-3">
                  <Button className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download Datasheet
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Request Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductDetail;
