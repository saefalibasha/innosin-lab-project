import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Package, Info, FileText, Download } from 'lucide-react';
import { fetchProductById, fetchProductsByParentSeriesId } from '@/api/products';
import { DatabaseProduct } from '@/types/supabase';
import { Product } from '@/types/product';
import ProductImageGallery from '@/components/ProductImageGallery';
import { VariantSelector } from '@/components/product/VariantSelector';
import { Model3DViewer } from '@/components/Model3DViewer';
import { motion } from 'framer-motion';

const transformDatabaseProduct = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category,
    dimensions: dbProduct.dimensions || '',
    modelPath: dbProduct.model_path || '',
    thumbnail: dbProduct.thumbnail_path || '',
    images: dbProduct.additional_images || [],
    description: dbProduct.description || '',
    fullDescription: dbProduct.full_description || dbProduct.description || '',
    specifications: Array.isArray(dbProduct.specifications) ? dbProduct.specifications : [],
    finishes: [],
    variants: [],
    baseProductId: dbProduct.parent_series_id,
    finish_type: dbProduct.finish_type,
    orientation: dbProduct.orientation,
    drawer_count: dbProduct.drawer_count || 0,
    door_type: dbProduct.door_type,
    product_code: dbProduct.product_code || '',
    thumbnail_path: dbProduct.thumbnail_path,
    model_path: dbProduct.model_path,
    mounting_type: dbProduct.mounting_type,
    mixing_type: dbProduct.mixing_type,
    handle_type: dbProduct.handle_type,
    emergency_shower_type: dbProduct.emergency_shower_type,
    company_tags: dbProduct.company_tags || [],
    product_series: dbProduct.product_series,
    parent_series_id: dbProduct.parent_series_id,
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
    is_active: dbProduct.is_active
  };
};

const AnimatedSection = ({ children, delay }: { children: React.ReactNode; delay: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
};

const EnhancedProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchProductData(id);
    }
  }, [id]);

  const fetchProductData = async (productId: string) => {
    try {
      setLoading(true);
      
      // Fetch the main product
      const productData = await fetchProductById(productId);
      const transformedProduct = transformDatabaseProduct(productData);
      setProduct(transformedProduct);
      setSelectedVariant(transformedProduct);

      // If this is a series parent, fetch its variants
      if (productData.is_series_parent && productData.id) {
        const variantData = await fetchProductsByParentSeriesId(productData.id);
        const transformedVariants = variantData.map(transformDatabaseProduct);
        
        // If we have variants, set the first active one as selected
        const firstActiveVariant = transformedVariants.find(v => v.is_active);
        if (firstActiveVariant) {
          setSelectedVariant(firstActiveVariant);
        }
      }
      
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
  const hasVariants = product.variants && product.variants.length > 0;
  const modelPath = displayProduct.modelPath;
  const images = displayProduct.images || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{displayProduct.name}</h1>
              <p className="text-gray-600">{displayProduct.product_code}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - 3D Viewer and Images */}
          <div className="space-y-6">
            {modelPath ? (
              <AnimatedSection delay={0}>
                <Card>
                  <CardContent>
                    <Model3DViewer modelPath={modelPath} />
                  </CardContent>
                </Card>
              </AnimatedSection>
            ) : (
              <AnimatedSection delay={0}>
                <ProductImageGallery
                  thumbnail={displayProduct.thumbnail}
                  images={images}
                  productName={displayProduct.name}
                />
              </AnimatedSection>
            )}
          </div>

          {/* Right Column - Details */}
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

            {/* Show Configurator for all products with variants */}
            {product.category && (
              <AnimatedSection delay={0.4}>
                <VariantSelector
                  baseProduct={product}
                  seriesSlug={generateSlugFromName(product.name)}
                  onVariantSelect={handleVariantSelect}
                  onAddToRFQ={handleAddToRFQ}
                />
              </AnimatedSection>
            )}

            {/* Specifications */}
            {displayProduct.specifications && displayProduct.specifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Specifications
                  </CardTitle>
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
                  <Button variant="outline" className="flex-1">
                    Request Quote
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

export default EnhancedProductDetail;
