
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingCart, Maximize } from 'lucide-react';
import Product3DViewer from '@/components/Product3DViewer';
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
              <div className="relative">
                <Product3DViewer
                  productType={product.modelType}
                  color={product.modelColor}
                  className="w-full h-48"
                />
                <div className="absolute top-2 right-2 flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                        <Maximize className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="font-serif">{product.name} - 3D View</DialogTitle>
                      </DialogHeader>
                      <Product3DViewer
                        productType={product.modelType}
                        color={product.modelColor}
                        className="w-full h-96"
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-3">
                <Badge variant="outline" className="mb-2 border-sea text-sea">
                  {product.category}
                </Badge>
                <CardTitle className="text-lg font-serif font-semibold mb-2 group-hover:text-sea transition-colors">
                  {product.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mb-2">
                  Dimensions: {product.dimensions}
                </p>
              </div>
              
              <p className="text-muted-foreground text-sm mb-4">
                {product.description}
              </p>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Key Features:</h4>
                <div className="flex flex-wrap gap-1">
                  {product.specifications.map((spec, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={() => onAddToQuote(product)}
                className="w-full bg-sea hover:bg-sea-dark transition-all duration-300 hover:scale-105"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Quote
              </Button>
            </CardContent>
          </Card>
        </AnimatedSection>
      ))}
    </div>
  );
};

export default ProductGrid;
