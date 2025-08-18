import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Download, Share2, Heart, Eye, Box } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { productService } from '@/services/productService';
import ProductImageGallery from '@/components/ProductImageGallery';
import Enhanced3DViewer from '@/components/Enhanced3DViewer';
import UniversalProductConfigurator from '@/components/product/UniversalProductConfigurator';
import { useProductConfigurator } from '@/hooks/useProductConfigurator';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { toast } from 'sonner';
import { useMissingModelsTracker } from '@/hooks/useMissingModelsTracker';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import StickyProductAssets from '@/components/product/StickyProductAssets';
import { useToast } from '@/components/ui/use-toast';

const ProductDetail = () => {
  const { productNumber } = useParams<{ productNumber: string }>();
  const navigate = useNavigate();
  const { addItemToCart } = useShoppingCart();
  const { trackMissingModel } = useMissingModelsTracker();
  const { toast } = useToast();

  const {
    selectedConfig,
    updateConfig,
    resetConfig,
    getConfiguratorOptions,
    currentAssets,
    isLoading: isConfigLoading,
    error: configError,
  } = useProductConfigurator(productNumber || '');

  const {
    data: product,
    isLoading: isProductLoading,
    error: productError,
  } = useQuery({
    queryKey: ['product', productNumber],
    queryFn: () => productService.getProductDetails(productNumber || ''),
    enabled: !!productNumber,
  });

  useEffect(() => {
    if (product) {
      resetConfig(product);
    }
  }, [product, resetConfig]);

  const handleAddToCart = () => {
    if (product) {
      addItemToCart({
        ...product,
        assets: currentAssets,
        selectedConfig: selectedConfig,
      });
      toast({
        title: "Added to cart",
        description: "Your product has been added to the cart.",
      })
    }
  };

  const handleMissingModel = (productId: string, productName: string) => {
    trackMissingModel(productId, productName);
  };

  if (isProductLoading) {
    return <p>Loading product details...</p>;
  }

  if (productError) {
    return <p>Error loading product details.</p>;
  }

  if (!product) {
    return <p>Product not found.</p>;
  }

  const {
    name,
    description,
    price,
    // assets,
    details,
    category,
    id: productId,
  } = product;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumbs or Navigation */}
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Image Gallery / 3D Viewer */}
        <div className="lg:col-span-1">
          <StickyProductAssets
            currentAssets={currentAssets}
            productName={name}
            productId={productId}
            onMissingModel={handleMissingModel}
            className="sticky top-20"
          />
        </div>

        {/* Product Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold">{name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Badge>{category}</Badge>
                <Badge variant="secondary">
                  <Eye className="mr-1 h-3 w-3" />
                  {/* {views} */}
                  Views
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">{description}</p>

                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold">${price}</div>
                  <Button size="lg" onClick={handleAddToCart}>
                    Add to Cart
                    <ShoppingCart className="ml-2 h-5 w-5" />
                  </Button>
                </div>

                <Separator />

                {/* Product Configuration - UniversalProductConfigurator */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Configure Product</h3>
                  {isConfigLoading ? (
                    <div className="flex flex-col space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : configError ? (
                    <p className="text-red-500">Error loading configurator options.</p>
                  ) : (
                    <UniversalProductConfigurator
                      options={getConfiguratorOptions()}
                      selectedConfig={selectedConfig}
                      onConfigChange={updateConfig}
                    />
                  )}
                </div>

                <Separator />

                {/* Product Details Accordion */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Product Details</h3>
                  <Accordion type="single" collapsible>
                    {details &&
                      Object.entries(details).map(([key, value]) => (
                        <AccordionItem value={key} key={key}>
                          <AccordionTrigger>{key}</AccordionTrigger>
                          <AccordionContent>{value}</AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2">
                  <Button variant="secondary">
                    <Download className="mr-2 h-4 w-4" />
                    Download Specs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
