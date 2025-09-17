import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Package, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  thumbnail_path?: string;
  overview_image_path?: string;
  dimensions?: string;
  product_code?: string;
}

interface HotspotProductSelectorProps {
  onProductSelect: (product: Product) => void;
  selectedProductId?: string;
}

const HotspotProductSelector: React.FC<HotspotProductSelectorProps> = ({ 
  onProductSelect, 
  selectedProductId 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch products from Supabase
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['hotspot-products', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('id, name, description, category, thumbnail_path, overview_image_path, dimensions, product_code')
        .eq('is_active', true)
        .eq('is_series_parent', false)
        .order('name');

      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as Product[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products for hotspot..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="text-sm text-muted-foreground">
        Found {products.length} products. Select one to add to your hotspot.
      </div>

      {/* Product Grid */}
      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((product) => {
            const isSelected = selectedProductId === product.id;
            const imageUrl = product.thumbnail_path || product.overview_image_path || '/placeholder.svg';

            return (
              <Card 
                key={product.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => onProductSelect(product)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt={product.name || 'Product'}
                        className="w-16 h-16 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm leading-tight mb-1 truncate">
                        {product.name}
                      </h4>
                      
                      {product.category && (
                        <Badge variant="secondary" className="text-xs mb-2">
                          {product.category}
                        </Badge>
                      )}
                      
                      {product.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      
                      {product.dimensions && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Size: {product.dimensions}
                        </p>
                      )}
                      
                      {product.product_code && (
                        <p className="text-xs text-muted-foreground">
                          Code: {product.product_code}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant={isSelected ? "default" : "outline"}
                    className="w-full mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      onProductSelect(product);
                    }}
                  >
                    <Package className="w-3 h-3 mr-2" />
                    {isSelected ? 'Selected' : 'Select Product'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {products.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No products found matching your search.</p>
            <p className="text-sm">Try adjusting your search terms.</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default HotspotProductSelector;