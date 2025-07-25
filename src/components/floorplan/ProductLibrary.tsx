
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Package } from 'lucide-react';
import { Product } from '@/types/product';
import ProductDragHandler from '@/components/canvas/ProductDragHandler';

interface ProductLibraryProps {
  onProductDrag: (product: Product) => void;
}

export const ProductLibrary: React.FC<ProductLibraryProps> = ({
  onProductDrag
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Sample products - in real app, these would come from props or API
  const products: Product[] = [
    {
      id: 'mc-pc-755065',
      name: 'MC-PC Mobile Cabinet',
      category: 'Mobile Cabinets',
      dimensions: '750×550×880 mm',
      modelPath: '/products/innosin-mc-pc-755065/MC-PC (755065).glb',
      thumbnail: '/products/innosin-mc-pc-755065/MC-PC (755065).jpg',
      images: [],
      description: 'Mobile cabinet with doors',
      fullDescription: 'Mobile cabinet with doors for laboratory storage',
      specifications: ['750mm width', '550mm depth', '880mm height']
    },
    {
      id: 'mc-pc-755080',
      name: 'MC-PC Mobile Cabinet (Tall)',
      category: 'Mobile Cabinets',
      dimensions: '750×550×1030 mm',
      modelPath: '/products/innosin-mc-pc-755080/MC-PC (755080).glb',
      thumbnail: '/products/innosin-mc-pc-755080/MC-PC (755080).jpg',
      images: [],
      description: 'Tall mobile cabinet with doors',
      fullDescription: 'Tall mobile cabinet with doors for laboratory storage',
      specifications: ['750mm width', '550mm depth', '1030mm height']
    },
    {
      id: 'wcg-pc-753375',
      name: 'WCG-PC Wall Cabinet',
      category: 'Wall Cabinets',
      dimensions: '750×330×750 mm',
      modelPath: '/products/innosin-wcg-pc-753375/WCG-PC (753375).glb',
      thumbnail: '/products/innosin-wcg-pc-753375/WCG-PC (753375).jpg',
      images: [],
      description: 'Wall-mounted cabinet',
      fullDescription: 'Wall-mounted cabinet for laboratory storage',
      specifications: ['750mm width', '330mm depth', '750mm height']
    },
    {
      id: 'tcg-pc-754018',
      name: 'TCG-PC Tall Cabinet',
      category: 'Tall Cabinets',
      dimensions: '750×400×1800 mm',
      modelPath: '/products/innosin-tcg-pc-754018/TCG-PC (754018).glb',
      thumbnail: '/products/innosin-tcg-pc-754018/TCG-PC (754018).jpg',
      images: [],
      description: 'Tall cabinet with shelves',
      fullDescription: 'Tall cabinet with shelves for laboratory storage',
      specifications: ['750mm width', '400mm depth', '1800mm height']
    },
    {
      id: 'or-pc-604518',
      name: 'OR-PC Open Rack',
      category: 'Open Racks',
      dimensions: '600×450×1800 mm',
      modelPath: '/products/innosin-or-pc-604518/OR-PC-3838 (604518).glb',
      thumbnail: '/products/innosin-or-pc-604518/OR-PC-3838 (604518).jpg',
      images: [],
      description: 'Open rack for storage',
      fullDescription: 'Open rack for laboratory equipment storage',
      specifications: ['600mm width', '450mm depth', '1800mm height']
    }
  ];

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(products.map(p => p.category))];
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Product Library
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All' : category}
            </Badge>
          ))}
        </div>

        {/* Product List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredProducts.map(product => (
            <ProductDragHandler
              key={product.id}
              product={product}
              onDragStart={onProductDrag}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No products found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductLibrary;
