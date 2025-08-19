
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

import { Product, ProductVariant } from '@/types/product';
import { useShoppingCart } from '@/hooks/useShoppingCart'
import { getProduct, getProducts } from '@/lib/shopify';
import ProductCarousel from '@/components/product/ProductCarousel';
import SeriesProductConfigurator from '@/components/product/SeriesProductConfigurator';
import VirtualizedProductList from '@/components/product/VirtualizedProductList';
import { detectSeriesType } from '@/utils/seriesUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import { useToast } from '@/hooks/use-toast';
import { useProductPerformance, useImagePreloader } from '@/hooks/useProductPerformance';

const EnhancedProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [seriesVariants, setSeriesVariants] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedFinish, setSelectedFinish] = useState<string>('PC');
  const [quantity, setQuantity] = useState(1);
  const [seriesType, setSeriesType] = useState<string>('standard');
  const [showVirtualizedList, setShowVirtualizedList] = useState(false);
  
  const { addItem } = useShoppingCart()
  const { toast } = useToast()

  // Performance optimizations
  const {
    filteredProducts: optimizedVariants,
    isLoading: performanceLoading,
    getPerformanceMetrics
  } = useProductPerformance(seriesVariants, {
    cacheEnabled: true,
    enableVirtualization: seriesVariants.length > 50
  });

  // Preload images for better UX
  useImagePreloader(seriesVariants);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const productData = await getProduct(id as string);
        if (productData) {
          setProduct(productData);

          // Fetch all products to find variants of the same series
          const allProducts = await getProducts();
          const relatedVariants = allProducts.filter(p => p.product_series === productData.product_series);
          setSeriesVariants(relatedVariants);

          // Set initial selected variant to the first one found
          if (relatedVariants.length > 0) {
            setSelectedVariantId(relatedVariants[0].id);
          }

          setSeriesType(detectSeriesType(productData, relatedVariants));
          
          // Enable virtualized list for large datasets
          if (relatedVariants.length > 50) {
            setShowVirtualizedList(true);
          }
        } else {
          console.error("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = useCallback(async () => {
    if (!selectedVariantId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a product variant."
      })
      return;
    }

    const selectedVariant = seriesVariants.find(v => v.id === selectedVariantId);
    if (!selectedVariant) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selected variant not found."
      })
      return;
    }

    try {
      const id = selectedVariant.id;
      addItem({
        id,
        quantity: quantity
      })
      toast({
        title: "Success",
        description: "Item added to cart."
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item to cart."
      })
    }
  }, [addItem, quantity, seriesVariants, selectedVariantId, toast]);

  const handleVariantSelect = useCallback((selectedProduct: Product) => {
    setSelectedVariantId(selectedProduct.id);
  }, []);

  if (loading || performanceLoading) {
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
    return <div className="text-center py-10">Product not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <ProductCarousel product={product} />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
            <p className="text-muted-foreground mb-4">{product.description}</p>
          </div>

          {/* Enhanced Series Configuration or Virtualized List */}
          {seriesVariants.length > 0 && (
            <>
              {showVirtualizedList ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Select Variant</CardTitle>
                    <CardDescription>
                      Large product catalog - showing {seriesVariants.length} variants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VirtualizedProductList
                      products={seriesVariants}
                      onProductSelect={handleVariantSelect}
                      selectedProductId={selectedVariantId}
                      itemHeight={100}
                      containerHeight={400}
                    />
                  </CardContent>
                </Card>
              ) : (
                <SeriesProductConfigurator
                  series={product}
                  variants={seriesVariants}
                  selectedVariantId={selectedVariantId}
                  onVariantChange={setSelectedVariantId}
                  selectedFinish={selectedFinish}
                  onFinishChange={setSelectedFinish}
                />
              )}
            </>
          )}

          {/* Price and Add to Cart */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">
                  Price: {formatCurrency({ amount: 100, currencyCode: 'USD' })}
                </h2>
                <Button className="w-full" onClick={handleAddToCart}>
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics (Development) */}
          {process.env.NODE_ENV === 'development' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-muted-foreground">
                  {JSON.stringify(getPerformanceMetrics(), null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Full Description and Specifications */}
      <div className="mt-12">
        <Separator className="mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Full Description</h3>
            <p className="text-muted-foreground">{product.fullDescription}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Specifications</h3>
            <ul className="space-y-2">
              {product.specifications &&
                Object.entries(product.specifications).map(([key, value]) => (
                  <li key={key} className="flex justify-between">
                    <span className="font-medium">{key}:</span>
                    <span className="text-muted-foreground">{value}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductDetail;
