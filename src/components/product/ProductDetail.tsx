import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Package, Ruler, FileText, ShoppingCart, Download, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import VariantSelector from './product/VariantSelector';
import ProductImageGallery from './ProductImageGallery';
import TechnicalSpecifications from './TechnicalSpecifications';

// NOTE: This version expects your route to use /product/:seriesId, where seriesId is the parent product's ID.

const ProductDetail: React.FC = () => {
  const { seriesId } = useParams<{ seriesId: string }>();
  const [seriesParent, setSeriesParent] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedFinish, setSelectedFinish] = useState<string>('PC');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Fetch the series parent product (the main parent)
        const { data: parent, error: parentError } = await supabase
          .from('products')
          .select('*')
          .eq('id', seriesId)
          .eq('is_series_parent', true)
          .single();

        if (parentError || !parent) throw new Error('Series parent not found');
        setSeriesParent(parent);

        // 2. Fetch all variants (children) for this series
        const { data: children, error: childrenError } = await supabase
          .from('products')
          .select('*')
          .eq('parent_series_id', seriesId)
          .eq('is_active', true);

        if (childrenError) throw childrenError;

        // Optionally include parent in list
        const allVariants = [parent, ...(children ?? [])];
        setVariants(allVariants);

        // Default selection: first variant
        setSelectedVariantId(allVariants.length > 0 ? allVariants[0].id : '');
      } catch (err: any) {
        setError(err.message || 'Failed to load series and variants');
      } finally {
        setLoading(false);
      }
    };
    fetchSeries();
  }, [seriesId]);

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
  };

  const selectedVariant = variants.find(v => v.id === selectedVariantId);

  // Get product images for the gallery
  const getProductImages = () => {
    const images = [];
    if (selectedVariant?.thumbnail_path) images.push(selectedVariant.thumbnail_path);
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      images.push(...selectedVariant.images);
    }
    return images.length > 0 ? images : ['/placeholder.svg'];
  };

  // UI rendering
  if (loading) {
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

  if (error || !seriesParent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Series Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'The series you are looking for does not exist.'}
          </p>
          <Button onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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
            thumbnail={selectedVariant?.thumbnail_path || '/placeholder.svg'}
            productName={selectedVariant?.name || seriesParent.name}
            isProductPage={true}
          />
        </div>

        {/* Right Column - Product Information */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              {selectedVariant?.category || seriesParent.category}
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {selectedVariant?.name || seriesParent.name}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              {selectedVariant?.description || seriesParent.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                <span>{selectedVariant?.product_code || seriesParent.product_code}</span>
              </div>
              {selectedVariant?.dimensions && (
                <div className="flex items-center gap-1">
                  <Ruler className="w-4 h-4" />
                  <span>{selectedVariant.dimensions}</span>
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
              {variants.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">
                  No variants available for this product series.
                </div>
              ) : (
                <VariantSelector
                  variants={variants}
                  selectedVariantId={selectedVariantId}
                  onVariantChange={handleVariantChange}
                  selectedFinish={selectedFinish}
                  onFinishChange={setSelectedFinish}
                  groupByDimensions={true}
                  seriesSlug={seriesParent.series_slug}
                />
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button className="flex-1 gap-2" disabled={loading}>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </Button>
            <Button variant="outline" className="gap-2" disabled={loading}>
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
                {selectedVariant?.editable_description || selectedVariant?.full_description || selectedVariant?.description || seriesParent?.description}
              </p>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <TechnicalSpecifications 
            product={selectedVariant || seriesParent} 
            selectedVariant={selectedVariant}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
