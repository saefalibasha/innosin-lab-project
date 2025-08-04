import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, Ruler, FileText, ShoppingCart, Download, AlertCircle, Building2 } from 'lucide-react';
import { useProductById } from '@/hooks/useEnhancedProducts';
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

  const transformVariantToProduct = (variant: any): Product => {
    console.log('🔄 Transforming variant:', {
      id: variant.id,
      name: variant.name,
      emergency_shower_type: variant.emergency_shower_type,
      mounting_type: variant.mounting_type,
      mixing_type: variant.mixing_type,
      handle_type: variant.handle_type,
      cabinet_class: variant.cabinet_class,
      finish_type: variant.finish_type,
      dimensions: variant.dimensions,
      parent_series_id: variant.parent_series_id,
      is_series_parent: variant.is_series_parent
    });

    const transformed = {
      id: variant.id,
      name: variant.name,
      category: variant.category,
      dimensions: variant.dimensions && variant.dimensions.trim() ? variant.dimensions.trim() : '',
      modelPath: variant.model_path || '/placeholder.glb',
      thumbnail: variant.thumbnail_path || '/placeholder.svg',
      images: variant.images || [variant.thumbnail_path || '/placeholder.svg'],
      description: variant.description || '',
      fullDescription: variant.full_description || variant.description || '',
      specifications: Array.isArray(variant.specifications) ? variant.specifications : variant.specifications ? [variant.specifications] : [],
      product_code: variant.product_code,
      thumbnail_path: variant.thumbnail_path,
      model_path: variant.model_path,
      
      // Configuration fields - convert empty strings to undefined
      finish_type: variant.finish_type && variant.finish_type.trim() ? variant.finish_type.trim() : undefined,
      orientation: variant.orientation && variant.orientation.trim() && variant.orientation.trim() !== 'None' ? variant.orientation.trim() : undefined,
      drawer_count: variant.drawer_count && variant.drawer_count > 0 ? variant.drawer_count : undefined,
      door_type: variant.door_type && variant.door_type.trim() ? variant.door_type.trim() : undefined,
      
      // Enhanced configuration fields - convert empty strings to undefined
      mounting_type: variant.mounting_type && variant.mounting_type.trim() ? variant.mounting_type.trim() : undefined,
      mixing_type: variant.mixing_type && variant.mixing_type.trim() ? variant.mixing_type.trim() : undefined,
      handle_type: variant.handle_type && variant.handle_type.trim() ? variant.handle_type.trim() : undefined,
      emergency_shower_type: variant.emergency_shower_type && variant.emergency_shower_type.trim() ? variant.emergency_shower_type.trim() : undefined,
      cabinet_class: variant.cabinet_class && variant.cabinet_class.trim() ? variant.cabinet_class.trim() : undefined,
      
      // Additional fields
      company_tags: variant.company_tags || [],
      product_series: variant.product_series,
      
      // Series relationship fields
      parent_series_id: variant.parent_series_id,
      is_series_parent: variant.is_series_parent
    };

    console.log('✅ Transformed product:', transformed);
    return transformed;
  };

  useEffect(() => {
    const fetchVariants = async () => {
      if (!product || productLoading) return;
      
      startLoading();
      reset();
      
      console.log('🔍 Starting variant fetch for product:', {
        id: product.id,
        name: product.name,
        product_series: product.product_series,
        category: product.category,
        parent_series_id: product.parent_series_id
      });

      try {
        let fetchedVariants: any[] = [];
        
        // Strategy 1: Use parent_series_id if available (most reliable)
        if (product.parent_series_id) {
          console.log('📋 Using parent_series_id strategy:', product.parent_series_id);
          
          // Fetch the parent
          const { data: parentData, error: parentError } = await supabase
            .from('products')
            .select('*')
            .eq('id', product.parent_series_id)
            .eq('is_active', true)
            .single();

          if (parentError) {
            console.error('❌ Error fetching parent:', parentError);
          }

          // Fetch all siblings (including current product)
          const { data: siblingsData, error: siblingsError } = await supabase
            .from('products')
            .select('*')
            .eq('parent_series_id', product.parent_series_id)
            .eq('is_active', true);

          if (siblingsError) {
            console.error('❌ Error fetching siblings:', siblingsError);
          }

          // Combine parent and siblings
          const allVariants = [];
          if (parentData) allVariants.push(parentData);
          if (siblingsData) allVariants.push(...siblingsData);
          
          fetchedVariants = allVariants;
          console.log('✅ Found variants using parent_series_id:', fetchedVariants.length);
        }
        
        // Strategy 2: Check if current product is a series parent
        else if (product.is_series_parent) {
          console.log('👑 Product is series parent, fetching children');
          
          const { data: childrenData, error: childrenError } = await supabase
            .from('products')
            .select('*')
            .eq('parent_series_id', product.id)
            .eq('is_active', true);

          if (childrenError) {
            console.error('❌ Error fetching children:', childrenError);
          }

          // Include parent + children
          fetchedVariants = [product, ...(childrenData || [])];
          console.log('✅ Found variants as series parent:', fetchedVariants.length);
        }
        
        // Strategy 3: Fallback to product_series string matching with exact database names
        else {
          console.log('🔧 Using fallback product_series string matching');
          
          const seriesName = product.product_series;
          let query = supabase.from('products').select('*').eq('is_active', true);
          
          // Use exact series names from database
          if (seriesName?.includes('Emergency Shower') || seriesName?.includes('Broen-Lab Emergency')) {
            console.log('🚿 Detected Emergency Shower series');
            query = query.eq('product_series', 'Broen-Lab Emergency Shower Systems');
          } else if (seriesName?.includes('UNIFLEX') || seriesName?.includes('Single Way')) {
            console.log('🚰 Detected UNIFLEX/Single Way series');
            query = query.eq('product_series', 'Single Way Taps');
          } else if (seriesName?.includes('Safe Aire')) {
            console.log('💨 Detected Safe Aire series');
            query = query.eq('product_series', 'Safe Aire II Fume Hoods');
          } else if (seriesName?.includes('NOCE')) {
            console.log('🏭 Detected NOCE series');
            query = query.eq('product_series', 'NOCE Series Fume Hood');
          } else if (seriesName?.includes('TANGERINE') || seriesName?.includes('Bio Safety')) {
            console.log('🧪 Detected Bio Safety Cabinet series');
            query = query.eq('product_series', 'Bio Safety Cabinet - TANGERINE');
          } else {
            // Generic fallback
            query = query.eq('product_series', seriesName);
          }
          
          const { data, error } = await query.order('name');
          
          if (error) {
            console.error('❌ Error in fallback query:', error);
            throw error;
          }
          
          fetchedVariants = data || [];
          console.log('✅ Found variants using fallback:', fetchedVariants.length);
        }

        console.log('📊 Final variants found:', fetchedVariants.map(v => ({ id: v.id, name: v.name })));

        const transformedVariants = fetchedVariants.map(transformVariantToProduct);
        setSeriesVariants(transformedVariants);

        // Set selected variant (prefer current product, fallback to first)
        const currentVariant = transformedVariants.find(v => v.id === product.id);
        setSelectedVariant(currentVariant || (transformedVariants.length > 0 ? transformedVariants[0] : null));
        
        console.log('✅ Selected variant:', currentVariant?.name || 'First available');

      } catch (err) {
        console.error('❌ Error fetching variants:', err);
        setSeriesVariants([]);
        setError(err instanceof Error ? err.message : 'Failed to load product variants');
      } finally {
        stopLoading();
      }
    };

    fetchVariants();
  }, [product, productLoading]);

  const handleVariantChange = (variantType: string, value: string) => {
    setSelectedVariants(prev => ({ ...prev, [variantType]: value }));
  };

  const handleProductSelect = (selectedProduct: Product) => {
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
