import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Eye, Package, Grid, List, Filter, Building2, Wrench, Beaker } from 'lucide-react';
import { cleanProductName, cleanProductNames } from '@/lib/productUtils';

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

interface ProductLibraryProps {
  products: Product[];
  onProductSelect?: (product: Product) => void;
  onDownload?: (product: Product) => void;
  className?: string;
}

export const ProductLibrary: React.FC<ProductLibraryProps> = ({
  products,
  onProductSelect,
  onDownload,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Clean product names once when component mounts
  const cleanedProducts = useMemo(() => cleanProductNames(products), [products]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(cleanedProducts.map(p => p.category))];
    return uniqueCategories.sort();
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
      
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [cleanedProducts, searchTerm, selectedCategory, sortBy]);

  const handleProductSelect = (product: Product) => {
    onProductSelect?.(product);
  };

  const handleDownload = (product: Product) => {
    onDownload?.(product);
  };

  // Group products by category for the category view
  const productsByCategory = useMemo(() => {
    const grouped: { [key: string]: Product[] } = {};
    filteredProducts.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });
    return grouped;
  }, [filteredProducts]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'innosin lab':
        return <Beaker className="w-5 h-5" />;
      case 'architecture':
        return <Building2 className="w-5 h-5" />;
      case 'equipment':
        return <Wrench className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="series">By Series</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
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
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
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
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                      
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
            // List view with cleaned product names
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
                        
                        <Badge variant="secondary" className="text-xs mb-2">
                          {product.category}
                        </Badge>
                        
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
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="space-y-8">
            {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  {getCategoryIcon(category)}
                  <h2 className="text-xl font-semibold text-gray-900">{category}</h2>
                  <Badge variant="outline">{categoryProducts.length} products</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoryProducts.slice(0, 8).map((product) => (
                    <Card 
                      key={product.id} 
                      className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                      onClick={() => handleProductSelect(product)}
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                          {product.thumbnail_path ? (
                            <img 
                              src={product.thumbnail_path} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-12 h-12 text-gray-400" />
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                          {product.name}
                        </h3>
                        {product.dimensions && (
                          <p className="text-xs text-gray-600 mb-2">
                            {product.dimensions}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductSelect(product);
                            }}
                            className="flex-1"
                          >
                            <Eye className="w-3 h-3 mr-1" />
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
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {categoryProducts.length > 8 && (
                  <div className="text-center mt-4">
                    <Button variant="outline" onClick={() => setSelectedCategory(category)}>
                      View all {categoryProducts.length} {category} products
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="series" className="space-y-6">
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Series View</h3>
            <p className="text-gray-600">Product series organization coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Favorites</h3>
            <p className="text-gray-600">Save your favorite products for quick access</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
