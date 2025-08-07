
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, Ruler, Palette, Wrench, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import productService from '@/services/productService';
import { Product as ProductType } from '@/types/product';
import { DatabaseProduct } from '@/types/supabase';
import ModelViewer from '@/components/3d/ModelViewer';

// Transform any database object to proper DatabaseProduct with defaults
const ensureDatabaseProduct = (rawProduct: any): DatabaseProduct => {
  return {
    id: rawProduct.id || '',
    name: rawProduct.name || '',
    category: rawProduct.category || '',
    dimensions: rawProduct.dimensions || '',
    model_path: rawProduct.model_path || '',
    thumbnail_path: rawProduct.thumbnail_path || '',
    additional_images: rawProduct.additional_images || [],
    description: rawProduct.description || '',
    full_description: rawProduct.full_description || '',
    specifications: rawProduct.specifications || [],
    finish_type: rawProduct.finish_type || '',
    orientation: rawProduct.orientation || '',
    door_type: rawProduct.door_type || '',
    variant_type: rawProduct.variant_type || '',
    drawer_count: rawProduct.drawer_count || 0,
    cabinet_class: rawProduct.cabinet_class || 'standard',
    product_code: rawProduct.product_code || '',
    mounting_type: rawProduct.mounting_type || '',
    mixing_type: rawProduct.mixing_type || '',
    handle_type: rawProduct.handle_type || '',
    emergency_shower_type: rawProduct.emergency_shower_type || '',
    company_tags: rawProduct.company_tags || [],
    product_series: rawProduct.product_series || '',
    parent_series_id: rawProduct.parent_series_id || '',
    is_series_parent: rawProduct.is_series_parent || false,
    is_active: rawProduct.is_active !== undefined ? rawProduct.is_active : true,
    series_model_path: rawProduct.series_model_path || '',
    series_thumbnail_path: rawProduct.series_thumbnail_path || '',
    series_overview_image_path: rawProduct.series_overview_image_path || '',
    overview_image_path: rawProduct.overview_image_path || '',
    series_order: rawProduct.series_order || 0,
    variant_order: rawProduct.variant_order || 0,
    created_at: rawProduct.created_at || '',
    updated_at: rawProduct.updated_at || '',
    editable_title: rawProduct.editable_title || rawProduct.name || '',
    editable_description: rawProduct.editable_description || rawProduct.description || ''
  };
};

// Transform DatabaseProduct to ProductType
const transformDatabaseProduct = (dbProduct: DatabaseProduct): ProductType => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category,
    dimensions: dbProduct.dimensions || '',
    modelPath: dbProduct.model_path || '',
    thumbnail: dbProduct.thumbnail_path || '',
    images: dbProduct.additional_images || [],
    description: dbProduct.description || '',
    fullDescription: dbProduct.editable_description || dbProduct.full_description || dbProduct.description || '',
    specifications: Array.isArray(dbProduct.specifications) ? dbProduct.specifications : [],
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
    cabinet_class: dbProduct.cabinet_class || 'standard',
    company_tags: dbProduct.company_tags || [],
    product_series: dbProduct.product_series,
    editable_title: dbProduct.editable_title,
    editable_description: dbProduct.editable_description,
    is_active: dbProduct.is_active || false,
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at
  };
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      return await productService.getProductById(id);
    },
    enabled: !!id,
  });

  const { data: allProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getAllProducts(),
  });

  useEffect(() => {
    if (product && allProducts) {
      // Find related products in the same category or series
      const related = allProducts
        .filter(p => 
          p.id !== product.id && 
          (p.category === product.category || p.product_series === product.product_series)
        )
        .slice(0, 4);
      
      setRelatedProducts(related);
    }
  }, [product, allProducts]);

  const handleDownloadSpec = () => {
    toast({
      title: "Download Started",
      description: "Specification sheet download will begin shortly.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/catalog')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Catalog
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/catalog')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Catalog
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* 3D Model and Images */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
                {product.modelPath ? (
                  <ModelViewer modelPath={product.modelPath} />
                ) : product.thumbnail ? (
                  <img 
                    src={product.thumbnail} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-24 w-24 text-gray-400" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Images */}
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((image, index) => (
                <Card key={index} className="aspect-square overflow-hidden">
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold">{product.editable_title || product.name}</h1>
              <Badge variant="secondary">{product.category}</Badge>
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              {product.product_code}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {product.editable_description || product.fullDescription || product.description}
            </p>
          </div>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.dimensions && (
                <div className="flex justify-between">
                  <span className="font-medium">Dimensions:</span>
                  <span>{product.dimensions}</span>
                </div>
              )}
              {product.finish_type && (
                <div className="flex justify-between">
                  <span className="font-medium">Finish:</span>
                  <span>{product.finish_type}</span>
                </div>
              )}
              {product.orientation && (
                <div className="flex justify-between">
                  <span className="font-medium">Orientation:</span>
                  <span>{product.orientation}</span>
                </div>
              )}
              {product.drawer_count && product.drawer_count > 0 && (
                <div className="flex justify-between">
                  <span className="font-medium">Drawers:</span>
                  <span>{product.drawer_count}</span>
                </div>
              )}
              {product.door_type && (
                <div className="flex justify-between">
                  <span className="font-medium">Door Type:</span>
                  <span>{product.door_type}</span>
                </div>
              )}
              {product.mounting_type && (
                <div className="flex justify-between">
                  <span className="font-medium">Mounting:</span>
                  <span>{product.mounting_type}</span>
                </div>
              )}
              {product.cabinet_class && (
                <div className="flex justify-between">
                  <span className="font-medium">Class:</span>
                  <span>{product.cabinet_class}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Specifications List */}
          {product.specifications && product.specifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Technical Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {product.specifications.map((spec, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                      <span className="text-sm">{spec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Company Tags */}
          {product.company_tags && product.company_tags.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.company_tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleDownloadSpec} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Specification
            </Button>
            <Button variant="outline">
              <Palette className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card 
                key={relatedProduct.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/product/${relatedProduct.id}`)}
              >
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    {relatedProduct.thumbnail ? (
                      <img 
                        src={relatedProduct.thumbnail} 
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium mb-1 line-clamp-2">{relatedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {relatedProduct.product_code}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
