
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
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
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

import { Product, ProductVariant } from '@/types/product';
import { Variant } from '@/types/variant';
import { useShoppingCart } from '@/hooks/useShoppingCart'
import ProductCarousel from '@/components/product/ProductCarousel';
import SeriesProductConfigurator from '@/components/product/SeriesProductConfigurator';
import { detectSeriesType } from '@/utils/seriesUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import { useToast } from '@/hooks/use-toast';
import productService from '@/services/productService';

const EnhancedProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [seriesVariants, setSeriesVariants] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedFinish, setSelectedFinish] = useState<string>('PC');
  const [quantity, setQuantity] = useState(1);
  const [seriesType, setSeriesType] = useState<string>('standard');
  const { addItem } = useShoppingCart()
	const { toast } = useToast()

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        console.log('Fetching product with ID:', id);
        setLoading(true);
        setError(null);
        
        // Fetch the specific product
        const productData = await productService.getProductById(id as string);
        console.log('Product data received:', productData);
        
        if (productData) {
          setProduct(productData);

          // Fetch all products to find variants of the same series
          const allProducts = await productService.getAllProducts();
          console.log('All products:', allProducts.length);
          
          // Filter for products in the same series
          const relatedVariants = allProducts.filter(p => 
            p.product_series === productData.product_series && 
            p.product_series // Only if product_series exists
          );
          console.log('Related variants found:', relatedVariants.length);
          
          setSeriesVariants(relatedVariants);

          // Set initial selected variant to the current product
          setSelectedVariantId(productData.id);

          setSeriesType(detectSeriesType(productData, relatedVariants));
        } else {
          console.error("Product not found for ID:", id);
          setError("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to load product");
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

    const selectedVariant = seriesVariants.find(v => v.id === selectedVariantId) || product;
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
  }, [addItem, quantity, seriesVariants, selectedVariantId, toast, product]);

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

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <ProductCarousel product={product} />
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
          <p className="text-gray-500 mb-4">{product.description}</p>

          {/* Series Configuration */}
          {seriesVariants.length > 1 && (
            <SeriesProductConfigurator
              series={product}
              variants={seriesVariants}
              selectedVariantId={selectedVariantId}
              onVariantChange={setSelectedVariantId}
              selectedFinish={selectedFinish}
              onFinishChange={setSelectedFinish}
            />
          )}

          {/* Price and Add to Cart */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold">
              Price: {formatCurrency({ amount: 100, currencyCode: 'USD' })} {/* Replace 100 with actual price if available */}
            </h2>
            <Button className="w-full mt-4" onClick={handleAddToCart}>
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Full Description and Specifications */}
      <div className="mt-12">
        <Separator className="mb-6" />
        <h3 className="text-xl font-semibold mb-4">Full Description</h3>
        <p className="text-gray-700">{product.fullDescription || product.description}</p>

        {product.specifications && product.specifications.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Specifications</h3>
            <ul>
              {product.specifications.map((spec: any, index: number) => (
                <li key={index} className="mb-2">
                  {typeof spec === 'object' ? (
                    Object.entries(spec).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {String(value)}
                      </div>
                    ))
                  ) : (
                    <span>{String(spec)}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedProductDetail;
