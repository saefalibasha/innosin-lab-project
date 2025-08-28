
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Package } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail_path: string;
  specifications: any;
  product_series: string;
}

interface ProductSelectorProps {
  onProductSelect: (product: Product) => void;
  selectedProductId?: string;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ onProductSelect, selectedProductId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('id, name, description, category, thumbnail_path, specifications, product_series')
        .eq('is_active', true)
        .order('name');

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true)
        .not('category', 'is', null);

      if (error) throw error;

      const uniqueCategories = [...new Set(data.map(p => p.category))].filter(Boolean);
      return uniqueCategories;
    }
  });

  const handleProductClick = (product: Product) => {
    onProductSelect(product);
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading products...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <ScrollArea className="h-96">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {products.map((product) => (
            <Card
              key={product.id}
              className={`cursor-pointer transition-colors hover:bg-accent ${
                selectedProductId === product.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleProductClick(product)}
            >
              <CardContent className="p-3">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                    {product.thumbnail_path ? (
                      <img
                        src={product.thumbnail_path}
                        alt={product.name}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {product.description}
                    </p>
                    {product.category && (
                      <Badge variant="secondary" className="text-xs mt-2">
                        {product.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {products.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No products found
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ProductSelector;
