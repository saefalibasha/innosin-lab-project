import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, ShoppingCart, Download, AlertCircle, Building2 } from 'lucide-react';
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
    specifications: Array.isArray(variant.specifications) ? variant.specifications : [],
    product_code: variant.product_code,
    thumbnail_path: variant.thumbnail_path,
    model_path: variant.model_path,
    company_tags: variant.company_tags || [],
    product_series: variant.product_series
  });

  useEffect(() => {
    const fetchVariantsFromProductsTable = async (productId: string) => {
      try {
        const { data: variants, error } = await supabase
          .from('products')
          .select('*')
          .eq('parent_series_id', productId)
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching variants:', error);
          setError(error.message);
          return [];
        }

        return variants || [];
      } catch (err) {
        console.error('Unexpected error fetching variants:', err);
        setError("Unexpected error occurred while loading product variants.");
        return [];
      }
    };

    const fetchVariants = async () => {
      if (!product || productLoading) return;
      startLoading();
      reset();

      try {
        console.log("Fetching variants for product:", product.name);

        const variants = await fetchVariantsFromProductsTable(product.id);

        console.log("Variants fetched:", variants);

        const allVariants = [product, ...(variants || [])].map(transformVariantToProduct);
        console.log("Transformed Variants:", allVariants);

        setSeriesVariants(allVariants);
      } catch (err) {
        console.error("Error Fetching Variants:", err);
        setSeriesVariants([]);
        setError(err instanceof Error ? err.message : "Failed to load product variants");
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
    if (displayProduct.thumbnail && !displayProduct.thumbnail.includes('placeholder')) {
      images.push(displayProduct.thumbnail);
    }
    if (displayProduct.images && displayProduct.images.length > 0) {
      const imagesList = displayProduct.images.filter(img => img && !img.includes('placeholder'));
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
            thumbnail={displayProduct.thumbnail || ''}
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
          </div>

          <Separator />

          {/* Product Configuration Tab */}
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
              ) : (
                <ProductVariantSelector
                  products={seriesVariants}
                  selectedVariants={selectedVariants}
                  onVariantChange={handleVariantChange}
                  onProductSelect={handleProductSelect}
                  selectedProduct={selectedVariant}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
