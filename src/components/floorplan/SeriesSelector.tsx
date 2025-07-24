import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Package, ChevronDown, ChevronUp } from 'lucide-react';
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

interface SeriesSelectorProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  currentTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
}

const SeriesSelector: React.FC<SeriesSelectorProps> = ({ products, onProductSelect, currentTool, onToolChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState(true);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Product Series
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={toggleExpanded}>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>
      {expanded && (
        <CardContent className="py-2">
          <div className="grid gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search series..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <ScrollArea className="h-[200px] w-full rounded-md border">
              <div className="p-2">
                {filteredProducts.map((product) => (
                  <Button
                    key={product.id}
                    variant="ghost"
                    className="w-full justify-start rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200/50 disabled:pointer-events-none data-[state=open]:bg-gray-100 dark:hover:bg-gray-800 dark:focus:ring-gray-600/50 dark:data-[state=open]:bg-gray-800"
                    onClick={() => onProductSelect(product)}
                  >
                    {product.name}
                  </Button>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No series found.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default SeriesSelector;
