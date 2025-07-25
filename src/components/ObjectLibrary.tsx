import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Eye, Package, Filter } from 'lucide-react';
import { cleanProductName } from '@/lib/productUtils';

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
}

interface ObjectLibraryProps {
  products: Product[];
  onProductSelect?: (product: Product) => void;
  onDownload?: (product: Product) => void;
  className?: string;
}

export const ObjectLibrary: React.FC<ObjectLibraryProps> = ({
  products,
  onProductSelect,
  onDownload,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return uniqueCategories.sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = searchTerm === '' || 
        cleanProductName(product.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          return cleanProductName(a.name).localeCompare(cleanProductName(b.name));
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  const handleProductSelect = (product: Product) => {
    onProductSelect?.(product);
  };

  const handleDownload = (product: Product) => {
    onDownload?.(product);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
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
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="category">Category</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredProducts.length} of {products.length} products
      </div>

      {/* Product Grid */}
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
                    alt={cleanProductName(product.name)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                {cleanProductName(product.name)}
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
