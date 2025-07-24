import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Grid, List, Package, Wrench, Beaker } from 'lucide-react';
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

interface ObjectLibraryProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  currentTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
}

const ObjectLibrary: React.FC<ObjectLibraryProps> = ({ products, onProductSelect, currentTool, onToolChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const handleToolSelect = (tool: DrawingTool) => {
    onToolChange(tool);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Object Library</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full p-2">
        <div className="flex items-center space-x-2 mb-2">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex space-x-2 mb-2">
          <Button
            variant={categoryFilter === 'storage' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter(categoryFilter === 'storage' ? null : 'storage')}
          >
            <Package className="w-3 h-3 mr-2" />
            Storage
          </Button>
          <Button
            variant={categoryFilter === 'furniture' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter(categoryFilter === 'furniture' ? null : 'furniture')}
          >
            <Wrench className="w-3 h-3 mr-2" />
            Furniture
          </Button>
          <Button
            variant={categoryFilter === 'equipment' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter(categoryFilter === 'equipment' ? null : 'equipment')}
          >
            <Beaker className="w-3 h-3 mr-2" />
            Equipment
          </Button>
          {categoryFilter && (
            <Button variant="ghost" size="sm" onClick={() => setCategoryFilter(null)}>
              <X className="w-3 h-3 mr-2" />
              Clear Filter
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="relative border rounded-md p-2 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  onClick={() => onProductSelect(product)}
                >
                  {product.thumbnail && (
                    <img src={product.thumbnail} alt={product.name} className="w-full h-20 object-cover rounded-md mb-2" />
                  )}
                  <div className="text-xs font-medium">{product.name}</div>
                  <div className="text-xs text-gray-500">{product.category}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="flex items-center space-x-2 border rounded-md p-2 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  onClick={() => onProductSelect(product)}
                >
                  {product.thumbnail && (
                    <img src={product.thumbnail} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
                  )}
                  <div>
                    <div className="text-sm font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.category}</div>
                    {product.description && <div className="text-xs text-gray-500">{product.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ObjectLibrary;
