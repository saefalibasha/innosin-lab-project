import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import ProductImageGallery from '@/components/ProductImageGallery';
import AnimatedSection from '@/components/AnimatedSection';
import { Product } from '@/types/product';

interface ProductGridProps {
  products: Product[];
  onAddToQuote: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToQuote }) => {
  const getProductImages = (product: Product) => {
    const validImages: string[] = [];
    
    if (product.seriesOverviewImage && !product.seriesOverviewImage.includes('placeholder')) {
      validImages.push(product.seriesOverviewImage);
    } else if (product.overviewImage && !product.overviewImage.includes('placeholder')) {
      validImages.push(product.overviewImage);
    } else if (product.thumbnail && !product.thumbnail.includes('placeholder')) {
      validImages.push(product.thumbnail);
    }
    
    if (product.images && product.images.length > 0) {
      const additionalImages = product.images.filter(img => 
        img && 
        !img.includes('placeholder') && 
        !validImages.includes(img)
      );
      validImages.push(...additionalImages);
    }
    
    return validImages;
  };

  const getThumbnail = (product: Product) => {
    return product.seriesOverviewImage || 
           product.overviewImage || 
           product.thumbnail || 
           (product.images && product.images.length > 0 ? product.images[0] : '') ||
           '/placeholder.svg';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product, index) => (
        <AnimatedSection key={product.id} animation="bounce-in" delay={100 + index * 100}>
          <Card className="hover:shadow-xl transition-all duration-500 glass-card hover:scale-105 group">
            {/* IMAGE */}
            <CardHeader className="p-0">
              <div className="w-full h-64 flex items-center justify-center bg-white">
                <ProductImageGallery
                  images={getProductImages(product)}
                  thumbnail={getThumbnail(product)}
                  productName={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </CardHeader>
            
            {/* CONTENT */}
            <CardContent className="p-6 flex flex-col justify-between h-[300px]">
              <div className="mb-4">
                <Badge variant="outline" className="mb-2 border-sea text-sea">
                  {product.category}
                </Badge>
                <h3 className="text-lg font-serif font-semibold mb-2 group-hover:text-sea transition-colors">
                  {product.name}
                </h3>
                {/* Fixed height description */}
                <p className="text-sm text-muted-foreground mb-3 line-clamp-4">
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
              
              {/* ACTION BUTTONS */}
              <div className="flex gap-2 mt-auto">
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
