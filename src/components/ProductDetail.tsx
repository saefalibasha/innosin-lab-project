import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, Ruler, FileText, ShoppingCart, Download } from 'lucide-react';
import { useProductById } from '@/hooks/useEnhancedProducts';
import { fetchSeriesWithVariants } from '@/services/variantService';
import ProductImageGallery from './ProductImageGallery';
import ProductOrientationSelector from './ProductOrientationSelector';
import TechnicalSpecifications from './TechnicalSpecifications';
import OpenRackConfigurator from './product/OpenRackConfigurator';
import TallCabinetConfigurator from './product/TallCabinetConfigurator';
import WallCabinetConfigurator from './product/WallCabinetConfigurator';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProductById(id);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedFinish, setSelectedFinish] = useState<string>('PC');
  const [seriesVariants, setSeriesVariants] = useState<any[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Extract series information from product category or name
  const getSeriesInfo = (product: any) => {
    if (!product) return { series: '', slug: '' };
    
    const name = product.name.toLowerCase();
    const category = product.category.toLowerCase();
    
    if (name.includes('open rack') || category.includes('open rack')) {
      return { series: 'Open Rack', slug: 'open-rack' };
    }
    if (name.includes('tall cabinet') || category.includes('tall cabinet')) {
      return { series: 'Tall Cabinet', slug: 'tall-cabinet' };
    }
    if (name.includes('wall cabinet') || category.includes('wall cabinet')) {
      return { series: 'Wall Cabinet', slug: 'wall-cabinet' };
    }
    
    return { series: product.category, slug: product.category.toLowerCase().replace(/\s+/g, '-') };
  };

  useEffect(() => {
    const fetchVariants = async () => {
      if (!product) return;

      setLoadingVariants(true);
      try {
        const seriesInfo = getSeriesInfo(product);
        const fetchedVariants = await fetchSeriesWithVariants(seriesInfo.slug);
        if (fetchedVariants && fetchedVariants.length > 0) {
          setSeriesVariants(fetchedVariants[0].variants || []);
        } else {
          setSeriesVariants([]);
        }
      } catch (err) {
        console.error("Failed to fetch variants:", err);
        setSeriesVariants([]);
      } finally {
        setLoadingVariants(false);
      }
    };

    fetchVariants();
  }, [product]);

  // Handle variant selection - convert between ID and object
  const handleVariantChange = (variantId: string) => {
    const variant = seriesVariants.find(v => v.id === variantId);
    setSelectedVariant(variant || null);
  };

  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant);
  };

  // Determine which configurator to use based on product series
  const getConfiguratorComponent = () => {
    if (!product) return null;

    const seriesInfo = getSeriesInfo(product);
    const series = seriesInfo.series.toLowerCase();
    
    if (series.includes('open rack')) {
      return (
        <OpenRackConfigurator
          variants={seriesVariants}
          selectedVariantId={selectedVariant?.id || ''}
          onVariantChange={handleVariantChange}
          selectedFinish={selectedFinish}
          onFinishChange={setSelectedFinish}
        />
      );
    }
    
    if (series.includes('tall cabinet')) {
      return (
        <TallCabinetConfigurator
          variants={seriesVariants}
          selectedVariantId={selectedVariant?.id || ''}
          onVariantChange={handleVariantChange}
          selectedFinish={selectedFinish}
          onFinishChange={setSelectedFinish}
        />
      );
    }
    
    if (series.includes('wall cabinet')) {
      return (
        <WallCabinetConfigurator
          variants={seriesVariants}
          selectedVariant={selectedVariant}
          onVariantSelect={handleVariantSelect}
        />
      );
    }

    // Default to simple variant display for other series
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {seriesVariants.length > 0 ? `${seriesVariants.length} variants available` : 'No variants available'}
        </p>
        {seriesVariants.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {seriesVariants.slice(0, 4).map((variant: any, index: number) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setSelectedVariant(variant)}
                className={selectedVariant?.id === variant.id ? 'bg-primary text-primary-foreground' : ''}
              >
                {variant.name || `Variant ${index + 1}`}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

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
          <ProductImageGallery
            images={getProductImages()}
            thumbnail={displayProduct.thumbnail || '/placeholder.svg'}
            productName={displayProduct.name}
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
                <span>{displayProduct.id}</span>
              </div>
              <div className="flex items-center gap-1">
                <Ruler className="w-4 h-4" />
                <span>{displayProduct.dimensions}</span>
              </div>
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
              {loadingVariants ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading variants...</p>
                  </div>
                </div>
              ) : (
                getConfiguratorComponent()
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button className="flex-1 gap-2">
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </Button>
            <Button variant="outline" className="gap-2">
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
