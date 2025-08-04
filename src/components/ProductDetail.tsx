
import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Package, Ruler, FileText, ShoppingCart, Download, AlertCircle } from 'lucide-react';
import { useProductById } from '@/hooks/useEnhancedProducts';
import { supabase } from '@/integrations/supabase/client';
import { useLoadingState } from '@/hooks/useLoadingState';
import ProductImageGallery from './ProductImageGallery';
import ProductOrientationSelector from './ProductOrientationSelector';
import TechnicalSpecifications from './TechnicalSpecifications';
import VariantSelector from './product/VariantSelector';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading: productLoading, error } = useProductById(id);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedFinish, setSelectedFinish] = useState<string>('PC');
  const [seriesVariants, setSeriesVariants] = useState<any[]>([]);
  
  // Enhanced loading state management
  const {
    isLoading: variantsLoading,
    error: variantError,
    startLoading,
    stopLoading,
    setError,
    reset
  } = useLoadingState(false);

  // Extract series information from product
  const getSeriesInfo = (product: any) => {
    if (!product) return { series: '', slug: '' };
    
    const name = product.name?.toLowerCase() || '';
    const series = product.product_series?.toLowerCase() || '';
    const category = product.category?.toLowerCase() || '';
    
    console.log('🔍 Product data for series detection:', {
      name: product.name,
      product_series: product.product_series,
      category: product.category,
      emergency_shower_type: product.emergency_shower_type,
      mounting_type: product.mounting_type,
      mixing_type: product.mixing_type,
      handle_type: product.handle_type
    });
    
    // Bio Safety Cabinet - TANGERINE detection
    if (series.includes('bio safety cabinet - tangerine') || category.includes('bio safety cabinet - tangerine')) {
      return { series: 'Bio Safety Cabinet - TANGERINE', slug: 'bio-safety-cabinet-tangerine' };
    }
    
    // Broen-Lab Emergency Shower Systems detection (note: trailing space in DB)
    if (series.includes('broen-lab emergency shower') || category.includes('broen-lab emergency shower') || series.includes('emergency shower')) {
      return { series: 'Broen-Lab Emergency Shower Systems', slug: 'broen-lab-emergency-shower' };
    }
    
    // NOCE Series Fume Hood detection
    if (series.includes('noce series fume hood') || category.includes('noce series fume hood') || series.includes('noce')) {
      return { series: 'NOCE Series Fume Hood', slug: 'noce-series-fume-hood' };
    }
    
    // Safe Aire II Fume Hoods detection
    if (series.includes('safe aire ii fume hoods') || category.includes('safe aire ii fume hoods') || series.includes('safe aire')) {
      return { series: 'Safe Aire II Fume Hoods', slug: 'safe-aire-ii-fume-hoods' };
    }
    
    // Single Way Taps (UNIFLEX) detection
    if (series.includes('single way taps') || category.includes('single way taps') || series.includes('uniflex')) {
      return { series: 'Single Way Taps', slug: 'single-way-taps' };
    }
    
    // Emergency Shower detection (legacy)
    if (series.includes('emergency shower') || name.includes('emergency shower') || category.includes('emergency')) {
      return { series: 'Emergency Shower', slug: 'emergency-shower' };
    }
    
    // UNIFLEX detection (legacy)
    if (series.includes('uniflex') || name.includes('uniflex') || category.includes('uniflex')) {
      return { series: 'UNIFLEX', slug: 'uniflex' };
    }
    
    // Safe Aire detection (legacy)
    if (series.includes('safe aire') || name.includes('safe aire') || category.includes('safe aire')) {
      return { series: 'Safe Aire', slug: 'safe-aire' };
    }
    
    return { series: product.product_series || product.category, slug: product.product_series?.toLowerCase().replace(/\s+/g, '-') || 'unknown' };
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
        
        const startTime = performance.now();
        let fetchedVariants = [];
        
        // Fetch variants based on series type
        if (seriesInfo.series === 'Bio Safety Cabinet - TANGERINE') {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .or('product_series.ilike.%Bio Safety Cabinet - TANGERINE%,category.ilike.%Bio Safety Cabinet - TANGERINE%')
            .eq('is_active', true)
            .order('name');
          
          if (error) throw error;
          fetchedVariants = data || [];
        } else if (seriesInfo.series === 'Broen-Lab Emergency Shower Systems') {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .or('product_series.ilike.%Broen-Lab Emergency Shower%,category.ilike.%Broen-Lab Emergency Shower%')
            .eq('is_active', true)
            .order('name');
          
          if (error) throw error;
          fetchedVariants = data || [];
        } else if (seriesInfo.series === 'NOCE Series Fume Hood') {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .or('product_series.ilike.%NOCE Series Fume Hood%,category.ilike.%NOCE Series Fume Hood%')
            .eq('is_active', true)
            .order('name');
          
          if (error) throw error;
          fetchedVariants = data || [];
        } else if (seriesInfo.series === 'Safe Aire II Fume Hoods') {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .or('product_series.ilike.%Safe Aire II Fume Hoods%,category.ilike.%Safe Aire II Fume Hoods%')
            .eq('is_active', true)
            .order('name');
          
          if (error) throw error;
          fetchedVariants = data || [];
        } else if (seriesInfo.series === 'Single Way Taps') {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .or('product_series.ilike.%Single Way Taps%,category.ilike.%Single Way Taps%')
            .eq('is_active', true)
            .order('name');
          
          if (error) throw error;
          fetchedVariants = data || [];
        } else if (seriesInfo.series === 'Emergency Shower') {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .or('product_series.ilike.%emergency shower%,name.ilike.%emergency shower%,category.ilike.%emergency%')
            .eq('is_active', true)
            .order('name');
          
          if (error) throw error;
          fetchedVariants = data || [];
        } else if (seriesInfo.series === 'UNIFLEX') {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .or('product_series.ilike.%uniflex%,name.ilike.%uniflex%,category.ilike.%uniflex%')
            .eq('is_active', true)
            .order('name');
          
          if (error) throw error;
          fetchedVariants = data || [];
        } else if (seriesInfo.series === 'Safe Aire') {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .or('product_series.ilike.%safe aire%,name.ilike.%safe aire%,category.ilike.%safe aire%')
            .eq('is_active', true)
            .order('name');
          
          if (error) throw error;
          fetchedVariants = data || [];
        } else {
          // Fallback: try to find products with same series or category
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .or(`product_series.eq.${product.product_series},category.eq.${product.category}`)
            .eq('is_active', true)
            .order('name');
          
          if (error) throw error;
          fetchedVariants = data || [];
        }
        
        const endTime = performance.now();
        
        console.log(`⏱️ Variant fetch took ${endTime - startTime}ms`);
        console.log('📦 Raw fetched variants response:', fetchedVariants);
        
        if (fetchedVariants && fetchedVariants.length > 0) {
          console.log('📊 Comprehensive variant analysis:');
          console.log('- Total variants:', fetchedVariants.length);
          console.log('- Emergency shower types:', [...new Set(fetchedVariants.map(v => v.emergency_shower_type).filter(Boolean))]);
          console.log('- Mounting types:', [...new Set(fetchedVariants.map(v => v.mounting_type).filter(Boolean))]);
          console.log('- Mixing types:', [...new Set(fetchedVariants.map(v => v.mixing_type).filter(Boolean))]);
          console.log('- Handle types:', [...new Set(fetchedVariants.map(v => v.handle_type).filter(Boolean))]);
          console.log('- Cabinet classes:', [...new Set(fetchedVariants.map(v => v.cabinet_class).filter(Boolean))]);
          console.log('- Unique dimensions:', [...new Set(fetchedVariants.map(v => v.dimensions).filter(Boolean))]);
          console.log('- Unique finishes:', [...new Set(fetchedVariants.map(v => v.finish_type).filter(Boolean))]);
          
          setSeriesVariants(fetchedVariants);
          
          // Set the current product as selected variant if it's in the list
          const currentVariant = fetchedVariants.find(v => v.id === product.id);
          if (currentVariant) {
            setSelectedVariant(currentVariant);
          } else if (fetchedVariants.length > 0) {
            setSelectedVariant(fetchedVariants[0]);
          }
        } else {
          console.log('⚠️ No variants found for series:', seriesInfo.slug);
          setSeriesVariants([]);
          setSelectedVariant(product); // Use the current product as fallback
        }
      } catch (err) {
        console.error("❌ Failed to fetch variants:", err);
        setSeriesVariants([]);
        setSelectedVariant(product); // Use the current product as fallback
        setError(err instanceof Error ? err.message : 'Failed to load product variants');
      } finally {
        stopLoading();
      }
    };

    fetchVariants();
  }, [product, productLoading]);

  // Handle variant selection - convert between ID and object
  const handleVariantChange = (variantId: string) => {
    const variant = seriesVariants.find(v => v.id === variantId);
    console.log('🎯 Variant selected by ID:', variantId, 'found:', variant);
    setSelectedVariant(variant || null);
  };

  // Determine which configurator to use based on product series
  const getConfiguratorComponent = () => {
    if (!product || seriesVariants.length === 0) return null;

    const seriesInfo = getSeriesInfo(product);
    console.log('🏗️ Rendering configurator for series:', seriesInfo.series, 'with variants:', seriesVariants.length);
    
    return (
      <VariantSelector
        variants={seriesVariants.map(v => ({
          id: v.id,
          name: v.name,
          product_code: v.product_code,
          dimensions: v.dimensions,
          orientation: v.orientation || 'None',
          door_type: v.door_type,
          variant_type: v.variant_type || 'standard',
          drawer_count: v.drawer_count,
          finish_type: v.finish_type,
          // Additional fields for special series
          emergency_shower_type: v.emergency_shower_type,
          mounting_type: v.mounting_type,
          mixing_type: v.mixing_type,
          handle_type: v.handle_type,
          cabinet_class: v.cabinet_class
        }))}
        selectedVariantId={selectedVariant?.id || ''}
        onVariantChange={handleVariantChange}
        selectedFinish={selectedFinish}
        onFinishChange={setSelectedFinish}
        groupByDimensions={true}
      />
    );
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

  // Get product images for the gallery - using 'images' property instead of 'additional_images'
  const getProductImages = () => {
    const images = [];
    if (displayProduct.thumbnail_path) images.push(displayProduct.thumbnail_path);
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
          <ProductImageGallery
            images={getProductImages()}
            thumbnail={displayProduct.thumbnail_path || '/placeholder.svg'}
            productName={displayProduct.name}
            isProductPage={true}
          />
        </div>

        {/* Right Column - Product Information */}
        <div className="space-y-6">
          <div>
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
                <span>{displayProduct.product_code}</span>
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
              ) : variantsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                getConfiguratorComponent()
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
                {displayProduct.editable_description || displayProduct.full_description || displayProduct.description}
              </p>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <TechnicalSpecifications 
            product={displayProduct} 
            selectedVariant={selectedVariant}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
