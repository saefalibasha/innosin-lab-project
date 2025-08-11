
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchProductSeries, ProductSeries } from '@/services/productSeriesService';
import { useToast } from '@/hooks/use-toast';

const ProductCatalog = () => {
  const [productSeries, setProductSeries] = useState<ProductSeries[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<ProductSeries[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const seriesData = await fetchProductSeries();
      setProductSeries(seriesData);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(seriesData.map(series => series.category)));
      setCategories(['all', ...uniqueCategories]);
      
      setFilteredSeries(seriesData);
    } catch (err) {
      console.error('Error loading catalog data:', err);
      setError('Failed to load product catalog');
      toast({
        title: "Error",
        description: "Failed to load product catalog. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    filterSeries();
  }, [productSeries, searchTerm, selectedCategory]);

  const filterSeries = () => {
    let filtered = productSeries;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(series => 
        series.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(series =>
        series.name.toLowerCase().includes(term) ||
        series.description.toLowerCase().includes(term) ||
        series.category.toLowerCase().includes(term)
      );
    }

    setFilteredSeries(filtered);
  };

  const handleSeriesClick = (series: ProductSeries) => {
    // Navigate to product page with series name
    navigate(`/products/${encodeURIComponent(series.name)}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          <span>Loading product catalog...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Product Catalog</h1>
        <p className="text-muted-foreground">
          Browse our complete collection of laboratory product series
        </p>
      </div>

      {/* Search and Filter Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search product series..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-input rounded-md"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <Badge variant="outline">
              {filteredSeries.length} product series found
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Product Series Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSeries.map((series) => (
            <Card 
              key={series.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleSeriesClick(series)}
            >
              <div className="aspect-square p-4">
                {series.thumbnail ? (
                  <img
                    src={series.thumbnail}
                    alt={series.name}
                    className="w-full h-full object-contain rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                    <span className="text-muted-foreground">No Image</span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{series.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {series.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{series.category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {series.productCount} variants
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSeries.map((series) => (
            <Card 
              key={series.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleSeriesClick(series)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 flex-shrink-0">
                    {series.thumbnail ? (
                      <img
                        src={series.thumbnail}
                        alt={series.name}
                        className="w-full h-full object-contain rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-xl">{series.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{series.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {series.productCount} variants
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3 line-clamp-3">
                      {series.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredSeries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No product series found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
