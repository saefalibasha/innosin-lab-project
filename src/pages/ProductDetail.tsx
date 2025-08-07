import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Package, Download, ExternalLink } from 'lucide-react';
import { useEnhancedProducts } from '@/hooks/useEnhancedProducts';
import { Product as ProductType } from '@/types/product';
import { DatabaseProduct } from '@/types/supabase';
import ModelViewer from '@/components/ModelViewer';

// Transform any product-like object to ProductType
const ensureProductType = (item: ProductType | DatabaseProduct | any): ProductType => {
  // If it's already a ProductType (has modelPath, thumbnail, etc.), return as is
  if ('modelPath' in item && 'thumbnail' in item) {
    return item as ProductType;
  }

  // Otherwise, transform from database format
  return {
    id: item.id || '',
    name: item.name || '',
    category: item.category || '',
    dimensions: item.dimensions || '',
    modelPath: item.model_path || '',
    thumbnail: item.thumbnail_path || '',
    images: item.additional_images || [],
    description: item.description || '',
    fullDescription: item.editable_description || item.full_description || item.description || '',
    specifications: Array.isArray(item.specifications) ? item.specifications : [],
    finish_type: item.finish_type || '',
    orientation: item.orientation || '',
    drawer_count: item.drawer_count || 0,
    door_type: item.door_type || '',
    product_code: item.product_code || '',
    thumbnail_path: item.thumbnail_path || '',
    model_path: item.model_path || '',
    mounting_type: item.mounting_type || '',
    mixing_type: item.mixing_type || '',
    handle_type: item.handle_type || '',
    emergency_shower_type: item.emergency_shower_type || '',
    cabinet_class: item.cabinet_class || 'standard',
    company_tags: item.company_tags || [],
    product_series: item.product_series || '',
    editable_title: item.editable_title || item.name || '',
    editable_description: item.editable_description || item.description || '',
    is_active: item.is_active || false,
    created_at: item.created_at || '',
    updated_at: item.updated_at || ''
  };
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading } = useEnhancedProducts();
  const [selectedVariant, setSelectedVariant] = useState<ProductType | null>(null);

  const product = useMemo(() => {
    if (!id || !products.length) return null;
    
    const found = products.find(p => p.id === id);
    return found ? ensureProductType(found) : null;
  }, [id, products]);

  const variants = useMemo(() => {
    if (!product || !products.length) return [];
    
    return products
      .filter(p => p.product_series === product.product_series && p.id !== product.id)
      .map(ensureProductType);
  }, [product, products]);

  const relatedProducts = useMemo(() => {
    if (!product || !products.length) return [];
    
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4)
      .map(ensureProductType);
  }, [product, products]);

  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      setSelectedVariant(variants[0]);
    }
  }, [variants, selectedVariant]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/catalog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }

  const currentProduct = selectedVariant || product;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/catalog')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Catalog
            </Button>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">{product.category}</Badge>
              {product.product_code && (
                <Badge variant="secondary">{product.product_code}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 3D Model Viewer */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-square">
                  {currentProduct.modelPath || currentProduct.model_path ? (
                    <ModelViewer
                      modelPath={currentProduct.modelPath || currentProduct.model_path}
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <div className="text-center">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">3D Model Not Available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {currentProduct.images && currentProduct.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {currentProduct.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="aspect-square bg-muted rounded-md overflow-hidden">
                    <img
                      src={image}
                      alt={`${currentProduct.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{currentProduct.name}</h1>
              <p className="text-lg text-muted-foreground mb-4">
                {currentProduct.description}
              </p>
              
              {currentProduct.dimensions && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="w-4 h-4" />
                  <span>Dimensions: {currentProduct.dimensions}</span>
                </div>
              )}
            </div>

            {/* Variants Selection */}
            {variants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Variants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={!selectedVariant ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedVariant(null)}
                    >
                      {product.name}
                    </Button>
                    {variants.map((variant) => (
                      <Button
                        key={variant.id}
                        variant={selectedVariant?.id === variant.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedVariant(variant)}
                        className="text-xs"
                      >
                        {variant.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentProduct.finish_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Finish:</span>
                    <span className="capitalize">
                      {currentProduct.finish_type.replace('-', ' ')}
                    </span>
                  </div>
                )}
                
                {currentProduct.orientation && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Orientation:</span>
                    <span>{currentProduct.orientation}</span>
                  </div>
                )}
                
                {currentProduct.door_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Door Type:</span>
                    <span>{currentProduct.door_type}</span>
                  </div>
                )}

                {currentProduct.mounting_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mounting:</span>
                    <span>{currentProduct.mounting_type}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download Specs
              </Button>
              <Button variant="outline" className="flex-1">
                <ExternalLink className="w-4 h-4 mr-2" />
                Request Quote
              </Button>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <Card>
          <Tabs defaultValue="description" className="w-full">
            <CardHeader>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                {currentProduct.company_tags && currentProduct.company_tags.length > 0 && (
                  <TabsTrigger value="features">Features</TabsTrigger>
                )}
              </TabsList>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="description" className="mt-0">
                <div className="prose max-w-none">
                  <p>{currentProduct.fullDescription || currentProduct.description}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="specifications" className="mt-0">
                <div className="grid gap-4">
                  {currentProduct.specifications && currentProduct.specifications.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {currentProduct.specifications.map((spec, index) => (
                        <li key={index}>{spec}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">
                      Detailed specifications are not available for this product.
                    </p>
                  )}
                </div>
              </TabsContent>
              
              {currentProduct.company_tags && currentProduct.company_tags.length > 0 && (
                <TabsContent value="features" className="mt-0">
                  <div className="flex flex-wrap gap-2">
                    {currentProduct.company_tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>
              )}
            </CardContent>
          </Tabs>
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Related Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <Card
                    key={relatedProduct.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/catalog/product/${relatedProduct.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-muted rounded-md mb-3 flex items-center justify-center">
                        {relatedProduct.thumbnail || relatedProduct.thumbnail_path ? (
                          <img
                            src={relatedProduct.thumbnail || relatedProduct.thumbnail_path}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="font-medium text-sm mb-1">{relatedProduct.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {relatedProduct.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
