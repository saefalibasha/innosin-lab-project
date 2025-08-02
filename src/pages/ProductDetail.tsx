import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, Ruler, FileText, ShoppingCart, Download, AlertCircle, Building2 } from 'lucide-react';
import { useProductById } from '@/hooks/useEnhancedProducts';
import { fetchSeriesWithVariants } from '@/services/variantService';
import { useLoadingState } from '@/hooks/useLoadingState';
import { ProductVariantSelector } from '@/components/floorplan/ProductVariantSelector';
import ProductImageGallery from '@/components/ProductImageGallery';
import { Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRFQ } from '@/contexts/RFQContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useRFQ();
  const { product, loading: productLoading, error } = useProductById(id);
  const [selectedVariant, setSelectedVariant] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<any>({});
  const [seriesVariants, setSeriesVariants] = useState<Product[]>([]);

  const {
    isLoading: variantsLoading,
    error: variantError,
    startLoading,
    stopLoading,
    setError,
    reset
  } = useLoadingState(false);

  const getSeriesInfo = (product: any) => {
    if (!product) return { series: '', slug: '', isSpecific: false };
    
    console.log('🔍 ProductDetail - Full product data for series detection:', {
      id: product.id,
      name: product.name,
      category: product.category,
      product_series: product.product_series,
      company_tags: product.company_tags,
      allProductProperties: Object.keys(product)
    });

    const name = product.name?.toLowerCase() || '';
    const category = product.category?.toLowerCase() || '';
    const productSeries = product.product_series?.toLowerCase() || '';
    const companyTags = product.company_tags?.join(' ').toLowerCase() || '';

    // Enhanced series detection with exact matching and comprehensive logging
    console.log('🔍 Series detection strings:', {
      name,
      category, 
      productSeries,
      companyTags,
      originalProductSeries: product.product_series
    });

    // NOCE Series Fume Hood detection
    if (product.product_series === 'NOCE Series Fume Hood' || 
        productSeries.includes('noce series fume hood') ||
        productSeries.includes('noce') ||
        name.includes('noce') ||
        category.includes('noce')) {
      console.log('✅ NOCE Series detected');
      return { series: 'NOCE Series Fume Hood', slug: 'noce-series', isSpecific: true };
    }

    // Bio Safety Cabinet - TANGERINE Series detection
    if (product.product_series === 'Bio Safety Cabinet - TANGERINE' || 
        product.product_series === 'TANGERINE Series' ||
        productSeries.includes('bio safety cabinet - tangerine') ||
        productSeries.includes('tangerine series') ||
        productSeries.includes('tangerine') || 
        name.includes('tangerine') ||
        category.includes('tangerine')) {
      console.log('✅ TANGERINE Series detected');
      return { series: 'Bio Safety Cabinet - TANGERINE', slug: 'tangerine-series', isSpecific: true };
    }

    // Safe Aire II Fume Hoods detection
    if (product.product_series === 'Safe Aire II Fume Hoods' || 
        productSeries.includes('safe aire ii fume hoods') ||
        productSeries.includes('safe aire ii') ||
        productSeries.includes('safe aire') || 
        name.includes('safe aire') ||
        category.includes('safe aire')) {
      console.log('✅ Safe Aire II Series detected');
      return { series: 'Safe Aire II Fume Hoods', slug: 'safe-aire-ii', isSpecific: true };
    }

    // Broen-Lab UNIFLEX Taps Series detection (Enhanced)
    if (product.product_series === 'Single Way Taps' ||
        product.product_series === 'Broen-Lab UNIFLEX Taps Series' ||
        productSeries.includes('single way taps') ||
        productSeries.includes('broen-lab uniflex') ||
        productSeries.includes('uniflex taps') ||
        productSeries.includes('uniflex') ||
        name.includes('uniflex') ||
        name.includes('single way') ||
        name.includes('tap') ||
        category.includes('uniflex') ||
        category.includes('single way') ||
        category.includes('tap')) {
      console.log('✅ UNIFLEX Series detected');
      return { series: 'Single Way Taps', slug: 'uniflex-series', isSpecific: true };
    }

    // Broen-Lab Emergency Shower Series detection (Enhanced)
    if (product.product_series === 'Broen-Lab Emergency Shower Systems' || 
        product.product_series === 'Broen-Lab Emergency Shower Systems ' ||
        product.product_series === 'Broen-Lab Emergency Shower Series' ||
        productSeries.includes('broen-lab emergency shower') ||
        productSeries.includes('emergency shower systems') ||
        productSeries.includes('emergency shower series') ||
        productSeries.includes('emergency shower') || 
        name.includes('emergency shower') ||
        name.includes('emergency') ||
        category.includes('emergency')) {
      console.log('✅ Emergency Shower Series detected');
      return { series: 'Broen-Lab Emergency Shower Systems', slug: 'emergency-shower', isSpecific: true };
    }

    // Standard series detection for non-specific series
    if (name.includes('open rack') || category.includes('open rack')) {
      console.log('✅ Open Rack Series detected (non-specific)');
      return { series: 'Open Rack', slug: 'open-rack', isSpecific: false };
    }
    if (name.includes('tall cabinet') || category.includes('tall cabinet')) {
      console.log('✅ Tall Cabinet Series detected (non-specific)');
      return { series: 'Tall Cabinet', slug: 'tall-cabinet', isSpecific: false };
    }
    if (name.includes('wall cabinet') || category.includes('wall cabinet')) {
      console.log('✅ Wall Cabinet Series detected (non-specific)');
      return { series: 'Wall Cabinet', slug: 'wall-cabinet', isSpecific: false };
    }
    if (name.includes('mobile cabinet') || category.includes('mobile cabinet') || name.includes('mc-pc') || name.includes('mcc-pc')) {
      console.log('✅ Mobile Cabinet Series detected (non-specific)');
      return { series: 'Mobile Cabinet', slug: 'mobile-cabinet', isSpecific: false };
    }

    console.log('⚠️ No specific series matched, using category as fallback:', product.category);
    return { series: product.category, slug: product.category.toLowerCase().replace(/\s+/g, '-'), isSpecific: false };
  };

  const transformVariantToProduct = (variant: any): Product => ({
    id: variant.id,
    name: variant.name,
    category: variant.category,
    dimensions: variant.dimensions || '',
    modelPath: variant.model_path || '/placeholder.glb',
    thumbnail: variant.thumbnail_path || '/placeholder.svg',
    images: variant.images || [variant.thumbnail_path || '/placeholder.svg'],
    description: variant.description || '',
    fullDescription: variant.full_description || variant.description || '',
    specifications: Array.isArray(variant.specifications) ? variant.specifications : variant.specifications ? [variant.specifications] : [],
    product_code: variant.product_code,
    thumbnail_path: variant.thumbnail_path,
    model_path: variant.model_path,
    finish_type: variant.finish_type,
    orientation: variant.orientation,
    drawer_count: variant.drawer_count,
    door_type: variant.door_type,
    mounting_type: variant.mounting_type,
    mixing_type: variant.mixing_type,
    handle_type: variant.handle_type,
    emergency_shower_type: variant.emergency_shower_type,
    cabinet_class: variant.cabinet_class,
    company_tags: variant.company_tags || [],
    product_series: variant.product_series
  });

  useEffect(() => {
    const fetchVariants = async () => {
      if (!product || productLoading) return;
      
      console.log('🚀 Starting variant fetch process for product:', {
        id: product.id,
        name: product.name,
        product_series: product.product_series,
        category: product.category
      });
      
      startLoading();
      reset();

      try {
        const seriesInfo = getSeriesInfo(product);
        console.log('📊 Series Info determined:', seriesInfo);
        
        if (seriesInfo.isSpecific) {
          let query;
          let queryDescription = '';
          
          // Handle different querying strategies based on series
          if (seriesInfo.series === 'Single Way Taps') {
            console.log('🔍 Querying for UNIFLEX (Single Way Taps) products...');
            queryDescription = 'Single Way Taps exact match';
            query = supabase
              .from('products')
              .select('*')
              .eq('product_series', 'Single Way Taps')
              .eq('is_active', true)
              .order('product_code');
          } else if (seriesInfo.series === 'Broen-Lab Emergency Shower Systems') {
            console.log('🔍 Querying for Emergency Shower products...');
            queryDescription = 'Broen-Lab Emergency Shower Systems (with space variations)';
            query = supabase
              .from('products')
              .select('*')
              .or('product_series.eq.Broen-Lab Emergency Shower Systems,product_series.eq.Broen-Lab Emergency Shower Systems ')
              .eq('is_active', true)
              .order('product_code');
          } else if (seriesInfo.series === 'Safe Aire II Fume Hoods') {
            console.log('🔍 Querying for Safe Aire products...');
            queryDescription = 'Safe Aire II Fume Hoods exact match';
            query = supabase
              .from('products')
              .select('*')
              .eq('product_series', 'Safe Aire II Fume Hoods')
              .eq('is_active', true)
              .order('product_code');
          } else if (seriesInfo.series === 'Bio Safety Cabinet - TANGERINE') {
            console.log('🔍 Querying for TANGERINE products...');
            queryDescription = 'Bio Safety Cabinet - TANGERINE exact match';
            query = supabase
              .from('products')
              .select('*')
              .eq('product_series', 'Bio Safety Cabinet - TANGERINE')
              .eq('is_active', true)
              .order('product_code');
          } else if (seriesInfo.series === 'NOCE Series Fume Hood') {
            console.log('🔍 Querying for NOCE products...');
            queryDescription = 'NOCE Series Fume Hood exact match';
            query = supabase
              .from('products')
              .select('*')
              .eq('product_series', 'NOCE Series Fume Hood')
              .eq('is_active', true)
              .order('product_code');
          } else {
            console.log('🔍 Querying for other specific series:', product.product_series);
            queryDescription = `Other specific series: ${product.product_series}`;
            query = supabase
              .from('products')
              .select('*')
              .eq('product_series', product.product_series)
              .eq('is_active', true)
              .order('product_code');
          }

          console.log('📝 Executing query:', queryDescription);
          const { data: variants, error: variantsError } = await query;

          if (variantsError) {
            console.error('❌ Error fetching variants:', variantsError);
            throw variantsError;
          }

          console.log('📦 Raw variants from database:', {
            count: variants?.length || 0,
            variants: variants?.map(v => ({
              id: v.id,
              name: v.name,
              product_series: v.product_series,
              product_code: v.product_code
            }))
          });
          
          const transformedVariants = variants?.map(transformVariantToProduct) || [];
          console.log('🔄 Transformed variants:', {
            count: transformedVariants.length,
            firstFew: transformedVariants.slice(0, 3).map(v => ({ id: v.id, name: v.name }))
          });
          
          setSeriesVariants(transformedVariants);
          
          // Set the current product as selected variant if it's in the list
          const currentVariant = transformedVariants.find(v => v.id === product.id);
          if (currentVariant) {
            console.log('✅ Setting current product as selected variant:', currentVariant.name);
            setSelectedVariant(currentVariant);
          } else if (transformedVariants.length > 0) {
            console.log('✅ Setting first variant as selected:', transformedVariants[0].name);
            setSelectedVariant(transformedVariants[0]);
          } else {
            console.log('⚠️ No variants found, variants array is empty');
          }
        } else {
          console.log('🔄 Non-specific series, using fallback method for:', seriesInfo.slug);
          // For non-specific series, use the old variant fetching method
          const fetchedVariants = await fetchSeriesWithVariants(seriesInfo.slug);
          if (fetchedVariants && fetchedVariants.length > 0) {
            const variants = fetchedVariants[0].variants || [];
            const transformedVariants = variants.map((variant: any) => ({
              ...variant,
              thumbnail: variant.thumbnail || '/placeholder.svg',
              modelPath: variant.modelPath || '/placeholder.glb',
              images: variant.images || [variant.thumbnail || '/placeholder.svg'],
              fullDescription: variant.fullDescription || variant.description,
              specifications: Array.isArray(variant.specifications)
                ? variant.specifications
                : variant.specifications
                  ? [variant.specifications]
                  : []
            }));
            setSeriesVariants(transformedVariants);
          } else {
            console.log('⚠️ No variants found for non-specific series');
            setSeriesVariants([]);
          }
        }
      } catch (err) {
        console.error('❌ ProductDetail - Error fetching variants:', err);
        setSeriesVariants([]);
        setError(err instanceof Error ? err.message : 'Failed to load product variants');
      } finally {
        stopLoading();
      }
    };

    fetchVariants();
  }, [product, productLoading]);

  const handleVariantChange = (variantType: string, value: string) => {
    console.log('🔄 ProductDetail - Variant change:', variantType, value);
    setSelectedVariants(prev => ({ ...prev, [variantType]: value }));
  };

  const handleProductSelect = (selectedProduct: Product) => {
    console.log('✅ ProductDetail - Product selected:', selectedProduct.name);
    setSelectedVariant(selectedProduct);
  };

  const handleAddToQuote = () => {
    const item = selectedVariant || product;
    if (!item) return;
    addItem({
      id: item.id,
      name: item.name,
      category: item.category,
      dimensions: item.dimensions,
      image: item.thumbnail || item.thumbnail_path || '/placeholder.svg'
    });
    toast.success(`${item.name} added to quote.`);
  };

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
          <p className="text-muted-foreground mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <Button onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const displayProduct = selectedVariant || product;
  const getProductImages = () => {
    const images = [];
    if (displayProduct.seriesOverviewImage && !displayProduct.seriesOverviewImage.includes('placeholder')) {
      images.push(displayProduct.seriesOverviewImage);
    } else if (displayProduct.overviewImage && !displayProduct.overviewImage.includes('placeholder')) {
      images.push(displayProduct.overviewImage);
    } else if (displayProduct.thumbnail && !displayProduct.thumbnail.includes('placeholder')) {
      images.push(displayProduct.thumbnail);
    } else if (displayProduct.thumbnail_path && !displayProduct.thumbnail_path.includes('placeholder')) {
      images.push(displayProduct.thumbnail_path);
    }
    if (displayProduct.images && displayProduct.images.length > 0) {
      const imagesList = displayProduct.images.filter(img =>
        img && !img.includes('placeholder') && !images.includes(img)
      );
      images.push(...imagesList);
    }
    return images.length > 0 ? images : ['/placeholder.svg'];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button onClick={() => window.history.back()} variant="ghost" className="mb-6 gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <ProductImageGallery
            images={getProductImages()}
            thumbnail={displayProduct.thumbnail || displayProduct.thumbnail_path || ''}
            productName={displayProduct.name}
            isProductPage={true}
            className="mx-auto w-full max-w-[600px] aspect-[4/3] flex items-center justify-center"
          />
        </div>

        <div className="space-y-6">
          <div>
            {displayProduct.company_tags && displayProduct.company_tags.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {displayProduct.company_tags.map((tag, index) => (
                    <Badge key={index} variant="default" className="text-sm bg-blue-500 hover:bg-blue-600 text-white">
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
                  <p className="text-xs mt-1">Series: {getSeriesInfo(product).series}</p>
                  <p className="text-xs mt-1">Loading: {variantsLoading ? 'Yes' : 'No'}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button className="flex-1 gap-2" onClick={handleAddToQuote} disabled={variantsLoading}>
              <ShoppingCart className="w-4 h-4" />
              Add to Quote
            </Button>
            <Button variant="outline" className="gap-2" disabled={variantsLoading}>
              <Download className="w-4 h-4" />
              Download Specs
            </Button>
          </div>

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
