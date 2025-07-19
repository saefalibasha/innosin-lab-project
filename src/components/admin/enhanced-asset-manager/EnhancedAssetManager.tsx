
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, BarChart3, Package, AlertCircle, Wrench } from 'lucide-react';
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
  is_active: boolean;
}

export const EnhancedAssetManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showStats, setShowStats] = useState(false);

  // Fetch all Innosin Lab products with the new clean structure
  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ['innosin-products'],
    queryFn: async () => {
      console.log('Fetching cleaned Innosin Lab products...');
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

      console.log(`Fetched ${data?.length || 0} cleaned Innosin Lab products`);
      return data as Product[];
    }
  });

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_series?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.dimensions?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.editable_title?.toLowerCase().includes(searchTerm.toLowerCase());

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

  // Get unique categories for filtering (sorted by product count)
  const categories = [...new Set(products.map(p => p.product_series).filter(Boolean))]
    .sort((a, b) => {
      const countA = products.filter(p => p.product_series === a).length;
      const countB = products.filter(p => p.product_series === b).length;
      return countB - countA; // Sort by count descending
    });

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Package className="h-8 w-8 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading laboratory equipment products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive mb-4">
            <AlertCircle className="h-5 w-5" />
            <p>Error loading products: {error.message}</p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <Wrench className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Laboratory Equipment Manager</h2>
          <p className="text-muted-foreground">
            Manage all Innosin Lab product series - {products.length} products across {categories.length} series
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
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <Wrench className="h-4 w-4 mr-2" />
            Refresh
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
            Search & Filter Products
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
              {categories.slice(0, 5).map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="max-w-[200px] truncate"
                >
                  {category.replace('Laboratory Bench Knee Space Series', 'KS Series')} 
                  ({products.filter(p => p.product_series === category).length})
                </Button>
              ))}
              {categories.length > 5 && (
                <Badge variant="secondary">
                  +{categories.length - 5} more
                </Badge>
              )}
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
                Series: {selectedCategory.replace('Laboratory Bench Knee Space Series', 'KS Series')}
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
          .sort(([a], [b]) => {
            // Prioritize KS Series first
            if (a.includes('Knee Space')) return -1;
            if (b.includes('Knee Space')) return 1;
            return a.localeCompare(b);
          })
          .map(([seriesName, seriesProducts]) => (
            <ProductSeriesSection
              key={seriesName}
              seriesName={seriesName}
              products={seriesProducts}
              onProductSelect={handleProductSelect}
            />
          ))}
      </div>

      {/* No Results */}
      {Object.keys(productSeries).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }} variant="outline">
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {products.length > 0 && Object.keys(productSeries).length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-700">
              <Package className="h-5 w-5" />
              <p className="font-medium">
                Product database successfully optimized! 
                Now showing {Object.keys(productSeries).length} product series with {filteredProducts.length} total variants.
              </p>
            </div>
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
