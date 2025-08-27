import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Search, Package, Grip } from 'lucide-react';

interface Product {
  productId: string;
  name: string;
  category: string;
  series: string;
  dimensions: string;
  drawerCount?: number;
  description?: string;
  thumbnail?: string;
}

interface Category {
  id: string;
  name: string;
}

interface EnhancedSeriesSelectorProps {
  onProductDrag: (product: any) => void;
  currentTool: string;
  onProductUsed: (productId: string) => void;
}

const categories: Category[] = [
  { id: 'all', name: 'All Products' },
  { id: 'cabinets', name: 'Cabinets' },
  { id: 'shelving', name: 'Shelving' },
  { id: 'workstations', name: 'Workstations' },
  { id: 'accessories', name: 'Accessories' }
];

const productData: Product[] = [
  {
    productId: 'innosin-mc-pc-755065',
    name: 'Mobile Cabinet',
    category: 'Cabinets',
    series: 'mobile-cabinets',
    dimensions: '750x500x650 mm'
  },
  {
    productId: 'innosin-wcg-pc-753375',
    name: 'Wall Cabinet',
    category: 'Cabinets',
    series: 'wall-cabinets',
    dimensions: '750x330x750 mm'
  },
  {
    productId: 'innosin-tcg-pc-754018',
    name: 'Tall Cabinet',
    category: 'Cabinets',
    series: 'tall-cabinets',
    dimensions: '750x400x1800 mm'
  },
  {
    productId: 'innosin-or-pc-604518',
    name: 'Open Rack',
    category: 'Shelving',
    series: 'open-racks',
    dimensions: '380x380x1800 mm'
  },
  {
    productId: 'innosin-mc-pc-lh-505065',
    name: 'Mobile Cabinet LH',
    category: 'Cabinets',
    series: 'mobile-cabinets',
    dimensions: '500x500x650 mm'
  },
  {
    productId: 'innosin-mc-pc-rh-505065',
    name: 'Mobile Cabinet RH',
    category: 'Cabinets',
    series: 'mobile-cabinets',
    dimensions: '500x500x650 mm'
  },
  {
    productId: 'innosin-mcc-pc-lh-505065',
    name: 'Mobile Combination Cabinet LH',
    category: 'Cabinets',
    series: 'mobile-cabinets',
    dimensions: '500x500x650 mm'
  },
  {
    productId: 'innosin-mcc-pc-rh-505065',
    name: 'Mobile Combination Cabinet RH',
    category: 'Cabinets',
    series: 'mobile-cabinets',
    dimensions: '500x500x650 mm'
  },
  {
    productId: 'innosin-mc-pc-dwr3-505080',
    name: 'Mobile Cabinet 3 Drawers',
    category: 'Cabinets',
    series: 'mobile-cabinets',
    dimensions: '500x500x800 mm'
  },
  {
    productId: 'innosin-mc-pc-dwr4-505080',
    name: 'Mobile Cabinet 4 Drawers',
    category: 'Cabinets',
    series: 'mobile-cabinets',
    dimensions: '500x500x800 mm'
  },
  {
    productId: 'innosin-mc-pc-dwr6-905080',
    name: 'Mobile Cabinet 6 Drawers',
    category: 'Cabinets',
    series: 'mobile-cabinets',
    dimensions: '900x500x800 mm'
  },
  {
    productId: 'innosin-mc-pc-dwr8-905080',
    name: 'Mobile Cabinet 8 Drawers',
    category: 'Cabinets',
    series: 'mobile-cabinets',
    dimensions: '900x500x800 mm'
  },
  {
    productId: 'innosin-mcc-pc-755065',
    name: 'Mobile Combination Cabinet',
    category: 'Cabinets',
    series: 'mobile-cabinets',
    dimensions: '750x500x650 mm'
  },
  {
    productId: 'innosin-mcc-pc-755080',
    name: 'Mobile Combination Cabinet',
    category: 'Cabinets',
    series: 'mobile-cabinets',
    dimensions: '750x500x800 mm'
  },
  {
    productId: 'innosin-mc-pc-dwr2-505065',
    name: 'Mobile Cabinet 2 Drawers',
    category: 'Cabinets',
    series: 'mobile-cabinets',
    dimensions: '500x500x650 mm'
  },
  {
    productId: 'innosin-mc-pc-dwr6-505065',
    name: 'Mobile Cabinet 6 Drawers',
    category: 'Cabinets',
    series: 'mobile-cabinets',
    dimensions: '500x500x650 mm'
  },
  {
    productId: 'innosin-mc-pc-lh-905080',
    name: 'Mobile Cabinet LH',
    category: 'Cabinets',
    series: 'mobile-cabinets',
    dimensions: '900x500x800 mm'
  },
  {
    productId: 'innosin-mc-pc-rh-905080',
    name: 'Mobile Cabinet RH',
    category: 'Cabinets',
    series: 'mobile-cabinets',
    dimensions: '900x500x800 mm'
  },
  {
    productId: 'innosin-mc-pc-dwr2-505080',
    name: 'Mobile Cabinet 2 Drawers',
    category: 'Cabinets',
    series: 'mobile-cabinets',
    dimensions: '500x500x800 mm'
  }
];

const EnhancedSeriesSelector: React.FC<EnhancedSeriesSelectorProps> = ({
  onProductDrag,
  currentTool,
  onProductUsed
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openSeries, setOpenSeries] = useState<Record<string, boolean>>({
    'mobile-cabinets': true
  });

  const filteredProducts = useMemo(() => {
    let filtered = productData;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category.toLowerCase() === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.productId.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [searchTerm, selectedCategory]);

  const groupedProducts = useMemo(() => {
    const grouped: { [key: string]: Product[] } = {};
    filteredProducts.forEach(product => {
      if (!grouped[product.series]) {
        grouped[product.series] = [];
      }
      grouped[product.series].push(product);
    });
    return grouped;
  }, [filteredProducts]);

  const ProductCard: React.FC<{ product: any }> = ({ product }) => {
    const handleDragStart = (e: React.DragEvent) => {
      e.dataTransfer.setData('application/json', JSON.stringify(product));
      onProductDrag(product);
    };

    const thumbnailPath = `/products/${product.productId}/${product.productId.replace('innosin-', '').toUpperCase()}.jpg`;

    return (
      <div
        draggable
        onDragStart={handleDragStart}
        className="group relative bg-white border border-gray-200 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 hover:border-blue-300"
      >
        {/* Product Thumbnail */}
        <div className="relative w-full h-32 mb-3 bg-gray-50 rounded-md overflow-hidden">
          <img
            src={thumbnailPath}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              // Fallback to placeholder
              e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150" class="w-full h-full">
                  <rect width="200" height="150" fill="#f3f4f6"/>
                  <g fill="#9ca3af" text-anchor="middle">
                    <rect x="70" y="40" width="60" height="40" rx="4" fill="#e5e7eb"/>
                    <rect x="75" y="45" width="50" height="8" fill="#9ca3af"/>
                    <rect x="75" y="56" width="30" height="6" fill="#9ca3af"/>
                    <rect x="75" y="65" width="40" height="6" fill="#9ca3af"/>
                    <text x="100" y="110" font-size="12" font-family="Arial">${product.category}</text>
                  </g>
                </svg>
              `)}`;
            }}
          />
          
          {/* Drag indicator */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Grip className="h-4 w-4 text-gray-500" />
          </div>
          
          {/* Product badges */}
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {product.category}
            </Badge>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          <h4 className="font-medium text-sm text-gray-900 line-clamp-2 leading-tight">
            {product.name}
          </h4>
          
          {/* Key specs overlay on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-gray-600">
            <div className="flex justify-between items-center">
              <span>{product.dimensions}</span>
              {product.drawerCount && (
                <Badge variant="outline" className="text-xs">
                  {product.drawerCount} drawers
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Quick action button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onProductDrag(product)}
        >
          Add to Canvas
        </Button>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search and Filter */}
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

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="text-xs"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Product Series - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {Object.entries(groupedProducts).map(([seriesName, products]) => (
            <Collapsible
              key={seriesName}
              open={openSeries[seriesName]}
              onOpenChange={(open) => setOpenSeries(prev => ({ ...prev, [seriesName]: open }))}
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900 capitalize">
                      {seriesName.replace('-', ' ')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {products.length}
                    </Badge>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSeries[seriesName] ? 'rotate-180' : ''}`} />
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3">
                <div className="grid grid-cols-1 gap-3">
                  {products.map(product => (
                    <ProductCard key={product.productId} product={product} />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedSeriesSelector;
