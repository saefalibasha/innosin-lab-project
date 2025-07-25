import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Eye, Package, Grid, List, Filter } from 'lucide-react';
import { cleanProductName, cleanProductNames } from '@/lib/productUtils';

interface FilterOption {
  label: string;
  value: string;
}

interface SortOption {
  label: string;
  value: string;
}

interface ViewModeOption {
  label: string;
  value: 'grid' | 'list';
  icon: React.ReactNode;
}

interface Product {
  id: string;
  name: string;
  category: string;
  dimensions?: string;
  thumbnail_path?: string;
  model_path?: string;
  description?: string;
  specifications?: string[] | { [key: string]: any };
  keywords?: string[];
  product_series?: string;
}

interface EnhancedProductLibraryProps {
  products: Product[];
  onProductSelect?: (product: Product) => void;
  onDownload?: (product: Product) => void;
  className?: string;
}

export const EnhancedProductLibrary: React.FC<EnhancedProductLibraryProps> = ({
  products,
  onProductSelect,
  onDownload,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeries, setSelectedSeries] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Clean product names once when component mounts
  const cleanedProducts = useMemo(() => cleanProductNames(products), [products]);

  // Get unique categories and series
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(cleanedProducts.map(p => p.category))];
    return uniqueCategories.sort();
  }, [cleanedProducts]);

  const series = useMemo(() => {
    const uniqueSeries = [...new Set(cleanedProducts.map(p => p.product_series).filter(Boolean))];
    return uniqueSeries.sort();
  }, [cleanedProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = cleanedProducts.filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.keywords?.some(keyword => 
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSeries = selectedSeries === 'all' || product.product_series === selectedSeries;
      
      return matchesSearch && matchesCategory && matchesSeries;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'series':
          return (a.product_series || '').localeCompare(b.product_series || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [cleanedProducts, searchTerm, selectedCategory, selectedSeries, sortBy]);

  const handleProductSelect = (product: Product) => {
    onProductSelect?.(product);
  };

  const handleDownload = (product: Product) => {
    onDownload?.(product);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedSeries} onValueChange={setSelectedSeries}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Series" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Series</SelectItem>
              {series.map(seriesName => (
                <SelectItem key={seriesName} value={seriesName}>
                  {seriesName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="series">Series</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredProducts.length} of {cleanedProducts.length} products
      </div>

      {/* Product Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => handleProductSelect(product)}
            >
              <CardHeader className="pb-4">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {product.thumbnail_path ? (
                    <img 
                      src={product.thumbnail_path} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {product.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                    {product.product_series && (
                      <Badge variant="outline" className="text-xs">
                        {product.product_series}
                      </Badge>
                    )}
                  </div>
                  
                  {product.dimensions && (
                    <p className="text-sm text-gray-600">
                      <strong>Dimensions:</strong> {product.dimensions}
                    </p>
                  )}
                  
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {product.description}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductSelect(product);
                    }}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  
                  {onDownload && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(product);
                      }}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // List view
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="hover:shadow-md transition-shadow duration-300 cursor-pointer"
              onClick={() => handleProductSelect(product)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {product.thumbnail_path ? (
                      <img 
                        src={product.thumbnail_path} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {product.name}
                      </h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductSelect(product);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        
                        {onDownload && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(product);
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                      {product.product_series && (
                        <Badge variant="outline" className="text-xs">
                          {product.product_series}
                        </Badge>
                      )}
                    </div>
                    
                    {product.dimensions && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Dimensions:</strong> {product.dimensions}
                      </p>
                    )}
                    
                    {product.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters</p>
        </div>
      )}
    </div>
  );
};
