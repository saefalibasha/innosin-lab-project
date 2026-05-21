import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Grid, List, RefreshCw } from 'lucide-react';
import { Product as ProductType } from '@/types/product';
import ProductCard from '@/components/ProductCard';
import enhancedProductService from '@/services/enhancedProductService';
import { useToast } from '@/hooks/use-toast';
import { SkeletonCardList } from '@/components/ui/skeleton-card';

const ProductCatalog = () => {
  const [productSeries, setProductSeries] = useState<ProductType[]>([]);
  const [companyTags, setCompanyTags] = useState<string[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<ProductType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const subscriptionRef = useRef<(() => void) | null>(null);
  const hasLoadedRef = useRef(false);

  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[ProductCatalog] Loading data...');
      const startTime = performance.now();
      
      const [seriesData, companyTagsData] = await Promise.all([
        enhancedProductService.getProductSeries(forceRefresh),
        enhancedProductService.getCompanyTags(forceRefresh)
      ]);

      const loadTime = performance.now() - startTime;
      console.log(`[ProductCatalog] Data loaded in ${loadTime.toFixed(0)}ms`);

      setProductSeries(seriesData);
      setCompanyTags(['all', ...companyTagsData]);
      setFilteredSeries(seriesData);
      hasLoadedRef.current = true;
    } catch (err) {
      console.error('Error loading catalog data:', err);
      const errorMessage = err instanceof Error && err.message.includes('timed out')
        ? 'Connection is slow. Please try again.'
        : 'Failed to load product catalog';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Optimize SEO for products page
  useSEO('products');

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

  // Set up real-time updates AFTER initial load (deferred)
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    
    // Defer subscription setup to avoid blocking initial render
    const timeoutId = setTimeout(async () => {
      console.log('[ProductCatalog] Setting up real-time subscription');
      const unsubscribe = await enhancedProductService.subscribeToUpdates(() => {
        console.log('[ProductCatalog] Products updated, refreshing...');
        loadData(true);
      });
      subscriptionRef.current = unsubscribe;
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, [loadData]);

  // Filter products when search term or company changes
  useEffect(() => {
    const filterSeries = async () => {
      let filtered = productSeries;

      // If there's a search term, use the search function
      if (searchTerm) {
        try {
          filtered = await enhancedProductService.searchProductSeries(searchTerm);
        } catch (err) {
          console.error('Search error:', err);
          // Fall back to client-side filtering
          const term = searchTerm.toLowerCase();
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
    };

    filterSeries();
  }, [productSeries, searchTerm, selectedCompany]);

  if (error && !productSeries.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => loadData(true)} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search product series..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
                disabled={loading}
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
              {loading ? 'Loading...' : `${filteredSeries.length} product series found`}
            </Badge>
            {!loading && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => loadData(true)}
                className="gap-1 text-muted-foreground"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Series Display - Grouped by Category */}
      {loading ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          <SkeletonCardList count={6} />
        </div>
      ) : filteredSeries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No product series found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-12">
          {Object.entries(
            filteredSeries.reduce((acc, series) => {
              const category = series.category || 'Uncategorized';
              if (!acc[category]) acc[category] = [];
              acc[category].push(series);
              return acc;
            }, {} as Record<string, ProductType[]>)
          )
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, items]) => (
              <section key={category}>
                <div className="flex items-center justify-between mb-4 pb-2 border-b">
                  <h2 className="text-2xl font-semibold">{category}</h2>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-4"
                }>
                  {items.map((series) => (
                    <ProductCard
                      key={series.id}
                      product={series}
                      variant="series"
                    />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
