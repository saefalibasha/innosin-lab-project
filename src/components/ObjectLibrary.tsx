import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Grid, List } from 'lucide-react';
import { Product } from '@/types/product';
import { getAllProducts } from '@/data/products';

interface ObjectLibraryProps {
  onProductSelect: (product: Product) => void;
  selectedProducts: Product[];
  className?: string;
}

const ObjectLibrary: React.FC<ObjectLibraryProps> = ({
  onProductSelect,
  selectedProducts,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productData = await getAllProducts();
        setProducts(productData);
        setFilteredProducts(productData);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Product Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading products...</div>
        </CardContent>
      </Card>
    );
  }

  const isSelected = (product: Product) => 
    selectedProducts.some(p => p.id === product.id);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Product Library
          <Badge variant="secondary">{filteredProducts.length}</Badge>
        </CardTitle>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-2 lg:grid-cols-3 gap-4' 
            : 'space-y-2'
        } max-h-96 overflow-y-auto`}>
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`${
                viewMode === 'grid' ? 'p-3' : 'p-2'
              } border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                isSelected(product) ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => onProductSelect(product)}
            >
              {viewMode === 'grid' ? (
                <div className="space-y-2">
                  <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                    {product.thumbnail ? (
                      <img 
                        src={product.thumbnail} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm line-clamp-2">{product.name}</h4>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                    {product.dimensions && (
                      <p className="text-xs text-muted-foreground">{product.dimensions}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                    {product.thumbnail ? (
                      <img 
                        src={product.thumbnail} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{product.name}</h4>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                    {product.dimensions && (
                      <p className="text-xs text-muted-foreground">{product.dimensions}</p>
                    )}
                  </div>
                  {isSelected(product) && (
                    <Badge variant="default" className="text-xs">Selected</Badge>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No products found matching your search.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ObjectLibrary;
