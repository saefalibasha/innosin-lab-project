import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus } from 'lucide-react';
import { PlacedProduct } from '@/types/floorPlanTypes';
import { Product } from '@/types/product';
import { fetchProductSeriesFromDatabase, searchProductSeries } from '@/services/productService';
import { parseDimensionString, mmToCanvas } from '@/utils/dimensionUtils';

interface EnhancedSeriesSelectorProps {
  onProductSelect: (product: PlacedProduct) => void;
  scale: number;
}

const EnhancedSeriesSelector: React.FC<EnhancedSeriesSelectorProps> = ({ onProductSelect, scale }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProductSeriesFromDatabase();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = async () => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }

    try {
      const searchResults = await searchProductSeries(searchTerm);
      setFilteredProducts(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to client-side filtering
      const term = searchTerm.toLowerCase();
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
      setFilteredProducts(filtered);
    }
  };

  const handleProductSelect = (product: Product) => {
    // Parse dimensions and convert to canvas pixels
    const parsedDimensions = parseDimensionString(product.dimensions || '');
    
    let length = 100; // default fallback
    let width = 50; // default fallback
    let height = 30; // default fallback
    
    if (parsedDimensions) {
      // Convert mm to canvas pixels using the scale
      // Use width as length, depth as width for floor plan layout
      length = mmToCanvas(parsedDimensions.width, scale);
      width = mmToCanvas(parsedDimensions.depth, scale);
      height = mmToCanvas(parsedDimensions.height, scale);
    }

    const placedProduct: PlacedProduct = {
      id: `placed-${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      category: product.category,
      position: { x: 100, y: 100 },
      rotation: 0,
      dimensions: {
        length,
        width,
        height
      },
      color: '#3B82F6',
      thumbnail: product.thumbnail,
      modelPath: product.modelPath,
      description: product.description,
      specifications: product.specifications || []
    };

    onProductSelect(placedProduct);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-3">
          {filteredProducts.map((product) => {
            const displayTag = product.company_tags && product.company_tags.length > 0 
              ? product.company_tags[0] 
              : product.category;
            
            return (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {displayTag}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm leading-tight">
                    {product.editable_title || product.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {product.thumbnail && (
                    <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {product.editable_description || product.description}
                  </p>
                  
                  {product.dimensions && (
                    <p className="text-xs text-muted-foreground mb-3">
                      <span className="font-medium">Size:</span> {product.dimensions}
                    </p>
                  )}
                  
                  <Button
                    onClick={() => handleProductSelect(product)}
                    size="sm"
                    className="w-full"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add to Floor Plan
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No products found matching your search.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EnhancedSeriesSelector;
