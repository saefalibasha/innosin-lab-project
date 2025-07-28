
import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Package, Ruler, FileText, ShoppingCart, Download, AlertCircle, Building2 } from 'lucide-react';
import { useProductById } from '@/hooks/useEnhancedProducts';
import { fetchSeriesWithVariants } from '@/services/variantService';
import { useLoadingState } from '@/hooks/useLoadingState';
import { ProductVariantSelector } from '@/components/floorplan/ProductVariantSelector';
import { Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading: productLoading, error } = useProductById(id);
  const [selectedVariant, setSelectedVariant] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<any>({});
  const [seriesVariants, setSeriesVariants] = useState<Product[]>([]);
  
  // Enhanced loading state management
  const {
    isLoading: variantsLoading,
    error: variantError,
    startLoading,
    stopLoading,
    setError,
    reset
  } = useLoadingState(false);

  // Extract series information from product category or name
  const getSeriesInfo = (product: any) => {
    if (!product) return { series: '', slug: '' };
    
    const name = product.name.toLowerCase();
    const category = product.category.toLowerCase();
    const productSeries = product.product_series?.toLowerCase() || '';
    
    // Check for specific series first
    if (productSeries.includes('emergency shower') || name.includes('emergency') || category.includes('emergency')) {
      return { series: 'Emergency Shower', slug: 'emergency-shower' };
    }
    if (productSeries.includes('tangerine') || name.includes('tangerine')) {
      return { series: 'TANGERINE Series', slug: 'tangerine-series' };
    }
    if (productSeries.includes('noce') || name.includes('noce')) {
      return { series: 'NOCE Series', slug: 'noce-series' };
    }
    if (productSeries.includes('uniflex') || name.includes('uniflex')) {
      return { series: 'UNIFLEX Series', slug: 'uniflex-series' };
    }
    if (productSeries.includes('safe aire') || name.includes('safe aire')) {
      return { series: 'Safe Aire II', slug: 'safe-aire-ii' };
    }
    
    // Fallback to category-based detection
    if (name.includes('open rack') || category.includes('open rack')) {
      return { series: 'Open Rack', slug: 'open-rack' };
    }
    if (name.includes('tall cabinet') || category.includes('tall cabinet')) {
      return { series: 'Tall Cabinet', slug: 'tall-cabinet' };
    }
    if (name.includes('wall cabinet') || category.includes('wall cabinet')) {
      return { series: 'Wall Cabinet', slug: 'wall-cabinet' };
    }
    if (name.includes('mobile cabinet') || category.includes('mobile cabinet') || 
        name.includes('modular cabinet') || category.includes('modular cabinet') ||
        name.includes('mc-pc') || name.includes('mcc-pc')) {
      return { series: 'Mobile Cabinet', slug: 'mobile-cabinet' };
    }
    
    return { series: product.category, slug: product.category.toLowerCase().replace(/\s+/g, '-') };
  };

  // Progressive loading: fetch variants after product is loaded
  useEffect(() => {
    const fetchVariants = async () => {
      if (!product || productLoading) return;

      console.log('🚀 Starting variant fetch process for product:', product.id);
      startLoading();
      reset();
      
      try {
        const seriesInfo = getSeriesInfo(product);
        console.log('🔍 Series info determined:', seriesInfo);
        
        // For specific series, fetch from the series variants
        if (seriesInfo.series === 'Emergency Shower' || 
            seriesInfo.series === 'TANGERINE Series' || 
            seriesInfo.series === 'NOCE Series' || 
            seriesInfo.series === 'UNIFLEX Series' || 
            seriesInfo.series === 'Safe Aire II') {
          
          // Fetch variants directly from the database using the product series
          const { data: variants, error: variantsError } = await supabase
            .from('products')
            .select('*')
            .eq('product_series', product.product_series)
            .eq('is_active', true)
            .order('product_code');

          if (variantsError) throw variantsError;
          
          const transformedVariants = variants?.map(variant => ({
            ...variant,
            thumbnail: variant.thumbnail_path || '/placeholder.svg',
            modelPath: variant.model_path || '/placeholder.glb',
            images: variant.additional_images || [variant.thumbnail_path || '/placeholder.svg'],
            fullDescription: variant.full_description || variant.description
          })) || [];
          
          setSeriesVariants(transformedVariants);
        } else {
          // Use the existing fetch method for other series
          const startTime = performance.now();
          const fetchedVariants = await fetchSeriesWithVariants(seriesInfo.slug);
          const endTime = performance.now();
          
          console.log(`⏱️ Variant fetch took ${endTime - startTime}ms`);
          console.log('📦 Raw fetched variants response:', fetchedVariants);
          
          if (fetchedVariants && fetchedVariants.length > 0) {
            const variants = fetchedVariants[0].variants || [];
            console.log('🎯 Extracted variants array:', variants);
            
            const transformedVariants = variants.map((variant: any) => ({
              ...variant,
              thumbnail: variant.thumbnail || '/placeholder.svg',
              modelPath: variant.modelPath || '/placeholder.glb',
              images: variant.images || [variant.thumbnail || '/placeholder.svg'],
              fullDescription: variant.fullDescription || variant.description
            }));
            
            setSeriesVariants(transformedVariants);
          } else {
            console.log('⚠️ No variants found for series:', seriesInfo.slug);
            setSeriesVariants([]);
          }
        }
      } catch (err) {
        console.error("❌ Failed to fetch variants:", err);
        setSeriesVariants([]);
        setError(err instanceof Error ? err.message : 'Failed to load product variants');
      } finally {
        stopLoading();
      }
    };

    fetchVariants();
  }, [product, productLoading]);

  // Handle variant selection
  const handleVariantChange = (variantType: string, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantType]: value
    }));
  };

  // Handle product selection
  const handleProductSelect = (selectedProduct: Product) => {
    setSelectedVariant(selectedProduct);
  };

  // Enhanced loading state with progressive loading
  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'The product you are looking for does not exist.'}
          </p>
          <Button onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const displayProduct = selectedVariant || product;

  // Get product images for the gallery
  const getProductImages = () => {
    const images = [];
    if (displayProduct.thumbnail_path) images.push(displayProduct.thumbnail_path);
    if (displayProduct.thumbnail) images.push(displayProduct.thumbnail);
    if (displayProduct.images && displayProduct.images.length > 0) {
      images.push(...displayProduct.images);
    }
    return images.length > 0 ? images : ['/placeholder.svg'];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        onClick={() => window.history.back()}
        variant="ghost"
        className="mb-6 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Images */}
        <div className="space-y-6">
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
            <img
              src={getProductImages()[0]}
              alt={displayProduct.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>

        {/* Right Column - Product Information */}
        <div className="space-y-6">
          <div>
            {/* Company Tags Display */}
            {displayProduct.company_tags && displayProduct.company_tags.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {displayProduct.company_tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="default" 
                      className="text-sm bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <Badge variant="secondary" className="mb-2">
              {displayProduct.category}
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {displayProduct.name}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              {displayProduct.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                <span>{displayProduct.product_code || displayProduct.id}</span>
              </div>
              {displayProduct.dimensions && (
                <div className="flex items-center gap-1">
                  <Ruler className="w-4 h-4" />
                  <span>{displayProduct.dimensions}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Product Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {variantError ? (
                <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-md">
                  <AlertCircle className="w-5 h-5" />
                  <span>{variantError}</span>
                </div>
              ) : seriesVariants.length > 0 ? (
                <ProductVariantSelector
                  products={seriesVariants}
                  selectedVariants={selectedVariants}
                  onVariantChange={handleVariantChange}
                  onProductSelect={handleProductSelect}
                  selectedProduct={selectedVariant}
                />
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No variants available for this product</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button className="flex-1 gap-2" disabled={variantsLoading}>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </Button>
            <Button variant="outline" className="gap-2" disabled={variantsLoading}>
              <Download className="w-4 h-4" />
              Download Specs
            </Button>
          </div>

          {/* Product Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Product Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {displayProduct.fullDescription || displayProduct.description}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
