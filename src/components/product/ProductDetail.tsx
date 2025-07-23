import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { Product, ProductVariant } from '@/types/product';
import { useProductById } from '@/hooks/useEnhancedProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImagePlus, Loader2 } from 'lucide-react';
import { getVariantAssetUrls } from '@/services/variantService';
import { WallCabinetConfigurator } from './WallCabinetConfigurator';
import { ModularCabinetConfigurator } from './ModularCabinetConfigurator';

interface ProductDetailProps {
  product?: Product;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product: initialProduct }) => {
  const { id } = useParams<{ id: string }>();
  const { product: fetchedProduct, loading, error } = useProductById(id);
  const product = initialProduct || fetchedProduct;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [variants, setVariants] = useState<ProductVariant[] | null>(null);

  useEffect(() => {
    if (product?.variants) {
      setVariants(product.variants);
    }
  }, [product]);

  const handleVariantSelect = useCallback((variant: ProductVariant) => {
    setSelectedVariant(variant);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading product...
    </div>;
  }

  if (!product) {
    return <div className="flex items-center justify-center h-screen">
      {error || 'Product not found'}
    </div>;
  }

  const renderConfigurator = () => {
    if (!variants || variants.length === 0) {
      return null;
    }

    // Check if this is a wall cabinet series
    const isWallCabinet = product.product_series?.toLowerCase().includes('wall cabinet') || 
                         product.name.toLowerCase().includes('wall cabinet');

    // Check if this is a modular cabinet series
    const isModularCabinet = product.product_series?.toLowerCase().includes('modular cabinet') ||
                           product.product_series?.toLowerCase().includes('mobile cabinet') ||
                           product.name.toLowerCase().includes('mobile cabinet');

    if (isWallCabinet) {
      return (
        <WallCabinetConfigurator 
          variants={variants}
          onVariantSelect={handleVariantSelect}
          selectedVariant={selectedVariant}
        />
      );
    } else if (isModularCabinet) {
      return (
        <ModularCabinetConfigurator 
          variants={variants}
          onVariantSelect={handleVariantSelect}
          selectedVariant={selectedVariant}
        />
      );
    }

    // Default variant selector for other product types
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Select Variant</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {variants.map((variant) => (
            <Card 
              key={variant.id} 
              className={`cursor-pointer transition-all ${selectedVariant?.id === variant.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => handleVariantSelect(variant)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {variant.thumbnail_path && (
                    <img 
                      src={getVariantAssetUrls(variant).thumbnail || undefined}
                      alt={variant.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{variant.name}</h4>
                    <p className="text-sm text-muted-foreground">{variant.dimensions}</p>
                    <p className="text-sm text-muted-foreground">Code: {variant.product_code}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const assetUrls = selectedVariant ? getVariantAssetUrls(selectedVariant) : getVariantAssetUrls({
    ...product,
    thumbnail_path: product.thumbnail,
    model_path: product.modelPath,
    additional_images: product.images
  } as ProductVariant);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - 3D Viewer and Images */}
        <div>
          {/* 3D Model Viewer */}
          {assetUrls.model ? (
            <div className="relative">
              <div className="absolute top-2 right-2 z-10">
                <Badge>3D Model Available</Badge>
              </div>
              <AspectRatio ratio={16 / 9}>
                <iframe
                  src={`https://3d.innosin.com/?url=${assetUrls.model}`}
                  title="3D Model Viewer"
                  className="w-full h-full rounded-md"
                />
              </AspectRatio>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center p-4">
                <div className="text-center">
                  <ImagePlus className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No 3D model available</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Image Carousel */}
          {assetUrls.images && assetUrls.images.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>More Images</CardTitle>
              </CardHeader>
              <CardContent>
                <Carousel className="w-full">
                  <CarouselContent>
                    {assetUrls.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <AspectRatio ratio={16 / 9}>
                          <img
                            src={image}
                            alt={`${product.name} - Image ${index + 1}`}
                            className="object-cover rounded-md"
                          />
                        </AspectRatio>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Right Column - Product Information */}
        <div className="space-y-6">
          {/* Product Information */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">{product.name}</h2>
            <p className="text-muted-foreground">{product.description}</p>
            <Badge variant="secondary">{product.category}</Badge>
          </div>
          
          {/* Product Configurator */}
          {renderConfigurator()}
          
          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] w-full rounded-md border">
                <ul className="list-disc pl-5">
                  {product.specifications.map((spec, index) => (
                    <li key={index}>{spec}</li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Full Description */}
          <Card>
            <CardHeader>
              <CardTitle>Full Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{product.fullDescription}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
