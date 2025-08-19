
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import { useToast } from '@/components/ui/use-toast';

import { Product } from '@/types/product';
import ProductCarousel from '@/components/product/ProductCarousel';
import InnosinLabConfigurator from '@/components/product/InnosinLabConfigurator';
import { productService } from '@/services/productService';

const EnhancedProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [seriesVariants, setSeriesVariants] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const productData = await productService.getProductById(id);
        
        if (productData) {
          setProduct(productData);

          // Fetch all products to find variants of the same series
          const allProducts = await productService.getAllProducts();
          const relatedVariants = allProducts.filter(p => 
            p.product_series === productData.product_series && p.is_active
          );
          setSeriesVariants(relatedVariants);

          // Set initial selected variant to the current product
          setSelectedVariantId(productData.id);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, toast]);

  const handleVariantChange = useCallback((variantId: string) => {
    setSelectedVariantId(variantId);
    // Navigate to the new product variant
    navigate(`/products/${variantId}`);
  }, [navigate]);

  const isInnosinLab = (product: Product) => {
    return product?.category?.toLowerCase().includes('innosin') || 
           product?.product_series?.toLowerCase().includes('innosin') ||
           product?.product_series?.toLowerCase().includes('mobile cabinet');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Skeleton className="w-full aspect-square rounded-md" />
          </div>
          <div>
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-10 w-1/4 mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Button onClick={() => navigate('/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const selectedVariant = seriesVariants.find(v => v.id === selectedVariantId) || product;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <ProductCarousel product={selectedVariant} />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{selectedVariant.name}</h1>
            <p className="text-muted-foreground mb-4">{selectedVariant.description}</p>
            {selectedVariant.product_code && (
              <Badge variant="outline" className="mb-4">
                {selectedVariant.product_code}
              </Badge>
            )}
          </div>

          {/* Innosin Lab Configuration */}
          {isInnosinLab(product) && seriesVariants.length > 0 && (
            <InnosinLabConfigurator
              variants={seriesVariants}
              selectedVariantId={selectedVariantId}
              onVariantChange={handleVariantChange}
            />
          )}

          {/* Product Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedVariant.dimensions && (
                <div>
                  <span className="font-medium">Dimensions:</span>
                  <p className="text-muted-foreground">{selectedVariant.dimensions}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedVariant.finish_type && (
                  <div>
                    <span className="font-medium">Finish:</span>
                    <p className="text-muted-foreground">{selectedVariant.finish_type}</p>
                  </div>
                )}
                {selectedVariant.orientation && (
                  <div>
                    <span className="font-medium">Orientation:</span>
                    <p className="text-muted-foreground">{selectedVariant.orientation}</p>
                  </div>
                )}
                {selectedVariant.door_type && (
                  <div>
                    <span className="font-medium">Door Type:</span>
                    <p className="text-muted-foreground">{selectedVariant.door_type}</p>
                  </div>
                )}
                {selectedVariant.drawer_count && selectedVariant.drawer_count > 0 && (
                  <div>
                    <span className="font-medium">Drawers:</span>
                    <p className="text-muted-foreground">{selectedVariant.drawer_count}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-4">
            <Button className="w-full" size="lg">
              Request Quote
            </Button>
            <Button variant="outline" className="w-full">
              Download Specifications
            </Button>
          </div>
        </div>
      </div>

      {/* Full Description and Specifications */}
      {selectedVariant.fullDescription && (
        <div className="mt-12">
          <Separator className="mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Full Description</h3>
              <p className="text-muted-foreground">{selectedVariant.fullDescription}</p>
            </div>

            {selectedVariant.specifications && selectedVariant.specifications.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Specifications</h3>
                <div className="space-y-2">
                  {selectedVariant.specifications.map((spec: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span className="font-medium">{spec.name || spec.key}:</span>
                      <span className="text-muted-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedProductDetail;
