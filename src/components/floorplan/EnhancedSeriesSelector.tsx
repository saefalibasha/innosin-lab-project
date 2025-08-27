import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Grid, List } from 'lucide-react';
import { ThumbnailProductCard } from './ThumbnailProductCard';
import { generateProductId } from '@/utils/productUtils';

interface EnhancedSeriesSelectorProps {
  onProductDrag: (product: any) => void;
  currentTool: string;
  onProductUsed?: (productId: string) => void;
}

const products = [
  // Mobile Cabinets with enhanced variant data
  {
    id: 'mc-pc-755065',
    productId: 'MC-PC-755065',
    name: 'Mobile Cabinet Standard',
    category: 'Mobile Cabinets',
    series: 'Mobile Cabinet',
    dimensions: { length: 750, width: 500, height: 650 },
    thumbnail: '/products/innosin-mc-pc-755065/MC-PC (755065).jpg',
    drawerCount: 'Standard',
    variants: [
      { id: 'mc-pc-lh-505065', name: 'Left Hand', drawerCount: 'Left Hand' },
      { id: 'mc-pc-rh-505065', name: 'Right Hand', drawerCount: 'Right Hand' },
      { id: 'mc-pc-dwr2-505065', name: '2 Drawers', drawerCount: '2 Drawers' },
      { id: 'mc-pc-dwr3-505080', name: '3 Drawers', drawerCount: '3 Drawers' },
      { id: 'mc-pc-dwr4-505080', name: '4 Drawers', drawerCount: '4 Drawers' },
      { id: 'mc-pc-dwr6-905080', name: '6 Drawers', drawerCount: '6 Drawers' },
      { id: 'mc-pc-dwr8-905080', name: '8 Drawers', drawerCount: '8 Drawers' }
    ]
  },
  {
    id: 'mcc-pc-755065',
    productId: 'MCC-PC-755065',
    name: 'Mobile Combination Cabinet',
    category: 'Mobile Cabinets',
    series: 'Mobile Combination',
    dimensions: { length: 750, width: 500, height: 650 },
    thumbnail: '/products/innosin-mcc-pc-755065/MCC-PC (755065).jpg',
    drawerCount: 'Combination',
    variants: [
      { id: 'mcc-pc-lh-505065', name: 'Left Hand Combination', drawerCount: 'Left Hand Combo' },
      { id: 'mcc-pc-rh-505065', name: 'Right Hand Combination', drawerCount: 'Right Hand Combo' }
    ]
  },
  {
    id: 'tcg-pc-754018',
    productId: 'TCG-PC-754018',
    name: 'Tall Cabinet Glass Door',
    category: 'Tall Cabinets',
    series: 'Tall Cabinet',
    dimensions: { length: 750, width: 400, height: 1800 },
    thumbnail: '/products/innosin-tcg-pc-754018/TCG-PC (754018).jpg'
  },
  {
    id: 'wcg-pc-753375',
    productId: 'WCG-PC-753375',
    name: 'Wall Cabinet Glass',
    category: 'Wall Cabinets',
    series: 'Wall Cabinet',
    dimensions: { length: 750, width: 330, height: 750 },
    thumbnail: '/products/innosin-wcg-pc-753375/WCG-PC (753375).jpg'
  },
  {
    id: 'or-pc-604518',
    productId: 'OR-PC-604518',
    name: 'Open Rack Series',
    category: 'Open Racks',
    series: 'Open Rack',
    dimensions: { length: 380, width: 380, height: 1800 },
    thumbnail: '/products/innosin-or-pc-604518/OR-PC-3838 (604518).jpg'
  }
];

const EnhancedSeriesSelector: React.FC<EnhancedSeriesSelectorProps> = ({
  onProductDrag,
  currentTool,
  onProductUsed
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [draggedProduct, setDraggedProduct] = useState<any>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return ['all', ...cats];
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.productId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const handleProductDragStart = (product: any) => {
    setDraggedProduct(product);
    onProductDrag(product);
  };

  const handleProductDragEnd = () => {
    setDraggedProduct(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search and Filter Controls */}
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 text-sm border rounded-md bg-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
          
          <div className="flex items-center space-x-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className={`grid gap-3 ${
          viewMode === 'grid' 
            ? 'grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredProducts.map((product) => (
            <ThumbnailProductCard
              key={product.id}
              product={product}
              onDragStart={handleProductDragStart}
              onDragEnd={handleProductDragEnd}
            />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No products found matching your search.</p>
          </div>
        )}
      </div>

      {/* Drag Instructions */}
      <div className="p-4 border-t bg-gray-50">
        <p className="text-xs text-gray-600 text-center">
          Drag products from here to place them on your floor plan
        </p>
      </div>
    </div>
  );
};

export default EnhancedSeriesSelector;
