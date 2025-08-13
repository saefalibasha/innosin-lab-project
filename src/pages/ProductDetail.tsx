import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, ShoppingCart } from 'lucide-react';
import ProductImageGallery from '@/components/ProductImageGallery';
import { VariantSelector } from '@/components/product/VariantSelector';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types/product';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProductData(id);
    }
  }, [id]);

  const fetchProductData = async (productId: string) => {
    try {
      setLoading(true);
      // Fetch product data logic here
      // This would typically involve API calls to get product details
      // For now, we'll set loading to false
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSelect = (variant: Product) => {
    setSelectedVariant(variant);
  };

  const handleAddToRFQ = (product: Product) => {
    toast({
      title: "Added to RFQ",
      description: `${product.name} has been added to your request for quote.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );
  }

  const displayProduct = selectedVariant || product;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{displayProduct.name}</h1>
              <p className="text-muted-foreground">{displayProduct.product_code}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <ProductImageGallery
              thumbnail={displayProduct.thumbnail}
              images={displayProduct.images || []}
              productName={displayProduct.name}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Product Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{displayProduct.name}</CardTitle>
                    <p className="text-muted-foreground mt-1">{displayProduct.category}</p>
                  </div>
                  <Badge variant="outline">{displayProduct.product_code}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{displayProduct.description}</p>
                </div>
                
                {displayProduct.dimensions && (
                  <div>
                    <h4 className="font-medium mb-2">Dimensions</h4>
                    <p className="text-muted-foreground">{displayProduct.dimensions}</p>
                  </div>
                )}

                <Separator />

                {/* Product Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {displayProduct.finish_type && (
                    <div>
                      <span className="font-medium">Finish:</span>
                      <p className="text-muted-foreground">{displayProduct.finish_type}</p>
                    </div>
                  )}
                  {displayProduct.orientation && (
                    <div>
                      <span className="font-medium">Orientation:</span>
                      <p className="text-muted-foreground">{displayProduct.orientation}</p>
                    </div>
                  )}
                  {displayProduct.door_type && (
                    <div>
                      <span className="font-medium">Door Type:</span>
                      <p className="text-muted-foreground">{displayProduct.door_type}</p>
                    </div>
                  )}
                  {displayProduct.drawer_count && displayProduct.drawer_count > 0 && (
                    <div>
                      <span className="font-medium">Drawers:</span>
                      <p className="text-muted-foreground">{displayProduct.drawer_count}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Variant Selector */}
            <VariantSelector
              baseProduct={product}
              seriesSlug={generateSlugFromName(product.name)}
              onVariantSelect={handleVariantSelect}
              onAddToRFQ={handleAddToRFQ}
            />

            {/* Specifications */}
            {displayProduct.specifications && displayProduct.specifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {displayProduct.specifications.map((spec: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span className="font-medium">{spec.name || spec.key}:</span>
                        <span className="text-muted-foreground">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardContent className="py-6">
                <div className="flex gap-3">
                  <Button className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download Datasheet
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => handleAddToRFQ(displayProduct)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to RFQ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate slug from product name
const generateSlugFromName = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

export default ProductDetail;
