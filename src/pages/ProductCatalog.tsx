
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Grid, List } from 'lucide-react';
import { Product as ProductType } from '@/types/product';
import ProductCard from '@/components/ProductCard';
import { fetchProductSeriesFromDatabase, fetchCompanyTagsFromDatabase, searchProductSeries, subscribeToProductUpdates } from '@/services/productService';
import { useToast } from '@/hooks/use-toast';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useDebounce } from '@/hooks/usePerformanceOptimization';

const ITEMS_PER_PAGE = 12;

const ProductCatalog = () => {
  const { trackMetric } = usePerformanceMonitor('ProductCatalog');
  const [productSeries, setProductSeries] = useState<ProductType[]>([]);
  const [companyTags, setCompanyTags] = useState<string[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<ProductType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const loadData = useCallback(async () => {
    const endTrack = trackMetric('loadData');
    try {
      setLoading(true);
      setError(null);
      
      const [seriesData, companyTagsData] = await Promise.all([
        fetchProductSeriesFromDatabase(),
        fetchCompanyTagsFromDatabase()
      ]);

      setProductSeries(seriesData);
      setCompanyTags(['all', ...companyTagsData]);
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
      endTrack();
    }
  }, [toast, trackMetric]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle URL parameters for company filtering
  useEffect(() => {
    const companyFromUrl = searchParams.get('company');
    if (companyFromUrl && companyTags.includes(companyFromUrl)) {
      setSelectedCompany(companyFromUrl);
    }
  }, [searchParams, companyTags]);

  // Set up real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToProductUpdates(() => {
      console.log('Products updated, refreshing...');
      loadData();
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [loadData]);

  // Optimized filtering with debounced search
  useEffect(() => {
    const filterSeries = async () => {
      const endTrack = trackMetric('filterSeries');
      let filtered = productSeries;

      // If there's a search term, use the search function
      if (debouncedSearchTerm) {
        try {
          filtered = await searchProductSeries(debouncedSearchTerm);
        } catch (err) {
          console.error('Search error:', err);
          // Fall back to client-side filtering
          const term = debouncedSearchTerm.toLowerCase();
          filtered = productSeries.filter(series =>
            series.name.toLowerCase().includes(term) ||
            series.description.toLowerCase().includes(term) ||
            series.category.toLowerCase().includes(term) ||
            (series.product_code && series.product_code.toLowerCase().includes(term)) ||
            (series.product_series && series.product_series.toLowerCase().includes(term))
          );
        }
      }

      // Apply company filter
      if (selectedCompany !== 'all') {
        filtered = filtered.filter(series => 
          series.company_tags && series.company_tags.includes(selectedCompany)
        );
      }

      setFilteredSeries(filtered);
      setCurrentPage(1); // Reset to first page when filters change
      endTrack();
    };

    filterSeries();
  }, [productSeries, debouncedSearchTerm, selectedCompany, trackMetric]);

  // Paginated results
  const paginatedSeries = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredSeries.slice(startIndex, endIndex);
  }, [filteredSeries, currentPage]);

  const totalPages = Math.ceil(filteredSeries.length / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          <span>Loading product series...</span>
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
        <h1 className="text-3xl font-bold mb-2">Product Series</h1>
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
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="px-3 py-2 border border-input rounded-md"
              >
                {companyTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag === 'all' ? 'All Companies' : tag}
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
              {filteredSeries.length > ITEMS_PER_PAGE && (
                <span className="ml-2">
                  (showing {Math.min(ITEMS_PER_PAGE, filteredSeries.length - (currentPage - 1) * ITEMS_PER_PAGE)} 
                  of page {currentPage})
                </span>
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Product Series Display */}
      {filteredSeries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No product series found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {paginatedSeries.map((series) => (
              <ProductCard
                key={series.id}
                product={series}
                variant="series"
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductCatalog;
