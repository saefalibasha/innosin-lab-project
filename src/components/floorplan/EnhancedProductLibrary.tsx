import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Grid, List, Package, Wrench, Beaker, Filter } from 'lucide-react';
import { DrawingTool } from '@/types/floorPlanTypes';

interface Product {
  id: string;
  name: string;
  category: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  color?: string;
  price?: number;
  description?: string;
  thumbnail?: string;
}

interface EnhancedProductLibraryProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  currentTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
}

const EnhancedProductLibrary: React.FC<EnhancedProductLibraryProps> = ({
  products,
  onProductSelect,
  currentTool,
  onToolChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gridView, setGridView] = useState(true);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToolSelection = (tool: DrawingTool) => {
    onToolChange(tool);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Search and View Toggle */}
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Product Library</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center">
          <Search className="w-4 h-4 mr-2 text-gray-500" />
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">
            {filteredProducts.length} Products
          </span>
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGridView(!gridView)}
            >
              {gridView ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              {gridView ? 'List' : 'Grid'}
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Product List */}
      <ScrollArea className="flex-1 p-2">
        <div className={gridView ? 'grid gap-4 grid-cols-2' : 'flex flex-col space-y-2'}>
          {filteredProducts.map((product) => (
            <Card key={product.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <div
                onClick={() => {
                  onProductSelect(product);
                  handleToolSelection('product');
                }}
                className="cursor-pointer"
              >
                {product.thumbnail && (
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-t-md"
                  />
                )}
                <CardContent className="p-3">
                  <CardTitle className="text-sm font-medium">{product.name}</CardTitle>
                  <p className="text-xs text-gray-500">{product.category}</p>
                  {product.price && (
                    <Badge variant="secondary" className="mt-2">
                      ${product.price.toFixed(2)}
                    </Badge>
                  )}
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EnhancedProductLibrary;
