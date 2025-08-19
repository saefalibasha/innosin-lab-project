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
import { getProduct, getProducts } from '@/lib/shopify';
import ProductCarousel from '@/components/product/ProductCarousel';
import SeriesProductConfigurator from '@/components/product/SeriesProductConfigurator';
import { detectSeriesType } from '@/utils/seriesUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import { useToast } from '@/hooks/use-toast';

const EnhancedProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [seriesVariants, setSeriesVariants] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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
        } else {
          // Handle product not found
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
        <div>
          <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
          <p className="text-gray-500 mb-4">{product.description}</p>

          {/* Series Configuration */}
          {seriesVariants.length > 0 && (
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
        <p className="text-gray-700">{product.fullDescription}</p>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Specifications</h3>
          <ul>
            {product.specifications &&
              Object.entries(product.specifications).map(([key, value]) => (
                <li key={key} className="mb-2">
                  <strong>{key}:</strong> {value}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductDetail;
