
import React, { useState } from 'react';
import { PlacedProduct } from '@/types/floorPlanTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Package, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ProductSidebarProps {
  placedProducts: PlacedProduct[];
  setPlacedProducts: (products: PlacedProduct[]) => void;
  scale: number;
}

// Mock product data
const mockProducts = [
  {
    id: 'mc-pc-755065',
    name: 'MC-PC (755065)',
    category: 'Mobile Cabinet',
    dimensions: { length: 750, width: 500, height: 650 },
    color: 'hsl(var(--primary))',
    image: '/products/innosin-mc-pc-755065/MC-PC (755065).jpg'
  },
  {
    id: 'wcg-pc-753375',
    name: 'WCG-PC (753375)',
    category: 'Wall Cabinet',
    dimensions: { length: 750, width: 330, height: 750 },
    color: 'hsl(var(--secondary))',
    image: '/products/innosin-wcg-pc-753375/WCG-PC (753375).jpg'
  },
  {
    id: 'tcg-pc-754018',
    name: 'TCG-PC (754018)',
    category: 'Tall Cabinet',
    dimensions: { length: 750, width: 400, height: 1800 },
    color: 'hsl(var(--accent))',
    image: '/products/innosin-tcg-pc-754018/TCG-PC (754018).jpg'
  }
];

const ProductSidebar: React.FC<ProductSidebarProps> = ({
  placedProducts,
  setPlacedProducts,
  scale
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductDragStart = (e: React.DragEvent<HTMLDivElement>, product: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify(product));
  };

  const handleRemoveProduct = (productId: string) => {
    setPlacedProducts(placedProducts.filter(p => p.id !== productId));
  };

  return (
    <div className="w-80 bg-background border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Products</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Product Library */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">Product Library</h3>
            {filteredProducts.map(product => (
              <Card 
                key={product.id} 
                className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                draggable
                onDragStart={(e) => handleProductDragStart(e, product)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.dimensions.length}×{product.dimensions.width}×{product.dimensions.height}mm
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Placed Products */}
      {placedProducts.length > 0 && (
        <div className="border-t">
          <ScrollArea className="h-64">
            <div className="p-4 space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">Placed Products</h3>
              {placedProducts.map(product => (
                <Card key={product.id} className="p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.dimensions.length}×{product.dimensions.width}mm
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProduct(product.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default ProductSidebar;
