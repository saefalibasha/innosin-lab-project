
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import ProductImageGallery from '@/components/ProductImageGallery';
import AnimatedSection from '@/components/AnimatedSection';
import { Product } from '@/types/product';
import { enhanceProductWithAssets } from '@/utils/productAssets';

interface ProductGridProps {
  products: Product[];
  onAddToQuote: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToQuote }) => {
  const [enhancedProducts, setEnhancedProducts] = useState<Product[]>(products);
  const [loading, setLoading] = useState(false);

  // Enhance products with dynamic assets
  useEffect(() => {
    const enhanceProducts = async () => {
      setLoading(true);
      try {
        const enhanced = await Promise.all(
          products.map(product => enhanceProductWithAssets(product))
        );
        setEnhancedProducts(enhanced);
      } catch (error) {
        console.error('Error enhancing products with assets:', error);
        setEnhancedProducts(products);
      } finally {
        setLoading(false);
      }
    };

    enhanceProducts();
  }, [products]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product, index) => (
          <AnimatedSection key={product.id} animation="bounce-in" delay={100 + index * 100}>
            <Card className="hover:shadow-xl transition-all duration-500 glass-card">
              <CardHeader className="p-0">
                <div className="w-full h-64 bg-gray-200 animate-pulse rounded-t-lg" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-6 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {enhancedProducts.map((product, index) => (
        <AnimatedSection key={product.id} animation="bounce-in" delay={100 + index * 100}>
          <Card className="hover:shadow-xl transition-all duration-500 glass-card hover:scale-105 group">
            <CardHeader className="p-0">
              <ProductImageGallery
                images={product.overviewImage ? [product.overviewImage] : product.images}
                thumbnail={product.overviewImage || product.thumbnail}
                productName={product.name}
                className="w-full h-64"
              />
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="mb-4">
                <Badge variant="outline" className="mb-2 border-sea text-sea">
                  {product.category}
                </Badge>
                <h3 className="text-lg font-serif font-semibold mb-2 group-hover:text-sea transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {product.description}
                </p>
              </div>
              
              {!product.category.includes('Innosin') && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Key Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {product.specifications.slice(0, 3).map((spec, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Link to={`/products/${product.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </Link>
                <Button
                  onClick={() => onAddToQuote(product)}
                  className="flex-1 bg-sea hover:bg-sea-dark transition-all duration-300"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Quote
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      ))}
    </div>
  );
};

export default ProductGrid;
