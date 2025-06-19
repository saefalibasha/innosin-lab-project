
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Eye } from 'lucide-react';
import Enhanced3DViewer from '@/components/Enhanced3DViewer';
import ProductImageGallery from '@/components/ProductImageGallery';
import AnimatedSection from '@/components/AnimatedSection';
import { Product } from '@/types/product';

interface ProductGridProps {
  products: Product[];
  onAddToQuote: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToQuote }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product, index) => (
        <AnimatedSection key={product.id} animation="bounce-in" delay={100 + index * 100}>
          <Card className="hover:shadow-xl transition-all duration-500 glass-card hover:scale-105 group">
            <CardHeader className="p-0">
              <Tabs defaultValue="3d" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="3d">3D Model</TabsTrigger>
                  <TabsTrigger value="images">Photos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="3d" className="mt-0">
                  <Enhanced3DViewer
                    modelPath={product.modelPath}
                    className="w-full h-48"
                  />
                </TabsContent>
                
                <TabsContent value="images" className="mt-0">
                  <ProductImageGallery
                    images={product.images}
                    thumbnail={product.thumbnail}
                    productName={product.name}
                    className="w-full h-48"
                  />
                </TabsContent>
              </Tabs>
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
