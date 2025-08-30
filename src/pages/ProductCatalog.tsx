
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProductsAsync, getCategoriesAsync } from '@/data/products';
import { Product } from '@/types/product';
import HeroNavigation from '@/components/HeroNavigation';
import Footer from '@/components/Footer';

const ProductCatalog = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProductsAsync(),
          getCategoriesAsync()
        ]);
        setProducts(productsData);
        setCategories(['All Categories', ...categoriesData]);
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to empty arrays if async loading fails
        setProducts([]);
        setCategories(['All Categories']);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All Categories' || 
                           product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeroNavigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading products...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HeroNavigation />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Product Catalog</h1>
            <p className="text-muted-foreground">
              Explore our comprehensive range of laboratory equipment and furniture
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
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

            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} products
                {selectedCategory !== 'All Categories' && ` in ${selectedCategory}`}
              </p>
            </div>
          </div>

          {/* Products Grid/List */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">No products found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search terms or category filter
              </p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <CardContent className={viewMode === 'grid' ? "p-4" : "p-4 flex gap-4"}>
                    <div className={
                      viewMode === 'grid'
                        ? "aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden"
                        : "w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
                    }>
                      <img
                        src={product.thumbnail || product.images[0] || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    
                    <div className={viewMode === 'grid' ? "" : "flex-1 min-w-0"}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-semibold ${viewMode === 'grid' ? 'text-sm' : 'text-base'} mb-1 truncate`}>
                          {product.name}
                        </h3>
                      </div>
                      
                      <Badge variant="secondary" className="text-xs mb-2">
                        {product.category}
                      </Badge>
                      
                      <p className={`text-muted-foreground ${viewMode === 'grid' ? 'text-xs' : 'text-sm'} line-clamp-2`}>
                        {product.description}
                      </p>
                      
                      {product.dimensions && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {product.dimensions}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductCatalog;
