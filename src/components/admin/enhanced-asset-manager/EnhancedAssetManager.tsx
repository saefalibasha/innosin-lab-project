
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, BarChart3, Package, AlertCircle } from 'lucide-react';
import { ProductSeriesSection } from './ProductSeriesSection';
import { ProductAssetModal } from './ProductAssetModal';
import { AssetStatistics } from './AssetStatistics';

interface Product {
  id: string;
  product_code: string;
  name: string;
  category: string;
  product_series: string;
  finish_type: string;
  orientation: string;
  door_type: string;
  drawer_count: number;
  dimensions: string;
  editable_title: string;
  editable_description: string;
}

export const EnhancedAssetManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showStats, setShowStats] = useState(false);

  // Fetch all Innosin Lab products
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['innosin-products'],
    queryFn: async () => {
      console.log('Fetching Innosin Lab products...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'Innosin Lab')
        .eq('is_active', true)
        .order('product_series', { ascending: true })
        .order('product_code', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} Innosin Lab products`);
      return data as Product[];
    }
  });

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_series?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.dimensions?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || product.product_series === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Group products by series
  const productSeries = filteredProducts.reduce((acc, product) => {
    const series = product.product_series || 'Other';
    if (!acc[series]) acc[series] = [];
    acc[series].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Get unique categories for filtering
  const categories = [...new Set(products.map(p => p.product_series).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Package className="h-8 w-8 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading Innosin Lab products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Error loading products: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Asset Manager</h2>
          <p className="text-muted-foreground">
            Manage all Innosin Lab product assets - {products.length} products total
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showStats ? 'default' : 'outline'}
            onClick={() => setShowStats(!showStats)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistics
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {showStats && <AssetStatistics products={products} />}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by product code, name, series, or dimensions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All Series ({products.length})
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category} ({products.filter(p => p.product_series === category).length})
                </Button>
              ))}
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {searchTerm && (
              <Badge variant="secondary" className="gap-1">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-destructive">
                  ×
                </button>
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Series: {selectedCategory}
                <button onClick={() => setSelectedCategory('all')} className="ml-1 hover:text-destructive">
                  ×
                </button>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Series Sections */}
      <div className="space-y-4">
        {Object.entries(productSeries)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([seriesName, seriesProducts]) => (
            <ProductSeriesSection
              key={seriesName}
              seriesName={seriesName}
              products={seriesProducts}
              onProductSelect={setSelectedProduct}
            />
          ))}
      </div>

      {/* No Results */}
      {Object.keys(productSeries).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </CardContent>
        </Card>
      )}

      {/* Product Asset Modal */}
      {selectedProduct && (
        <ProductAssetModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};
