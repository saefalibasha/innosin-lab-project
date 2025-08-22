import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus } from 'lucide-react';
import { PlacedProduct } from '@/types/floorPlanTypes';
import { Product } from '@/types/product';
import { fetchProductSeriesFromDatabase, searchProductSeries } from '@/services/productService';
import { parseDimensionString, mmToCanvas, calculateProductScale } from '@/utils/measurements';
import { toTitleCase } from '@/utils/formatting';

interface EnhancedSeriesSelectorProps {
  onProductSelect: (product: PlacedProduct) => void;
  scale: number;
}

const EnhancedSeriesSelector: React.FC<EnhancedSeriesSelectorProps> = ({ onProductSelect, scale }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dimensions: '',
    numberOfDrawers: '',
    finishType: '',
    orientation: '',
    doorType: '',
    mountingType: '',
    handleType: ''
  });

  // Helper function to calculate dimension volume for sorting
  const calculateDimensionVolume = (dimensions: string): number => {
    const parsed = parseDimensionString(dimensions);
    if (parsed) {
      return parsed.width * parsed.depth * parsed.height;
    }
    return 0;
  };

  // Get unique filter values
  const getUniqueStringValues = (key: keyof Product): string[] => {
    const values = products
      .map(p => p[key])
      .filter(Boolean)
      .filter((value, index, arr) => arr.indexOf(value) === index)
      .map(value => String(value));
    
    if (key === 'dimensions') {
      return values.sort((a, b) => {
        const volA = calculateDimensionVolume(a);
        const volB = calculateDimensionVolume(b);
        return volA - volB;
      });
    }
    
    if (key === 'number_of_drawers') {
      return values.sort((a, b) => Number(a) - Number(b));
    }
    
    return values.sort();
  };

  const uniqueDimensions = getUniqueStringValues('dimensions');
  const uniqueDrawerCounts = getUniqueStringValues('number_of_drawers');
  const uniqueFinishes = getUniqueStringValues('finish_type');
  const uniqueOrientations = getUniqueStringValues('orientation');
  const uniqueDoorTypes = getUniqueStringValues('door_type');
  const uniqueMountingTypes = getUniqueStringValues('mounting_type');
  const uniqueHandleTypes = getUniqueStringValues('handle_type');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProductSeriesFromDatabase();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = async () => {
    let filtered = products;

    // Apply search filter
    if (searchTerm) {
      try {
        const searchResults = await searchProductSeries(searchTerm);
        filtered = searchResults;
      } catch (error) {
        console.error('Search error:', error);
        const term = searchTerm.toLowerCase();
        filtered = products.filter(product =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term)
        );
      }
    }

    // Apply variant filters
    if (filters.dimensions) {
      filtered = filtered.filter(p => p.dimensions === filters.dimensions);
    }
    if (filters.numberOfDrawers) {
      filtered = filtered.filter(p => String(p.number_of_drawers) === filters.numberOfDrawers);
    }
    if (filters.finishType) {
      filtered = filtered.filter(p => p.finish_type === filters.finishType);
    }
    if (filters.orientation) {
      filtered = filtered.filter(p => p.orientation === filters.orientation);
    }
    if (filters.doorType) {
      filtered = filtered.filter(p => p.door_type === filters.doorType);
    }
    if (filters.mountingType) {
      filtered = filtered.filter(p => p.mounting_type === filters.mountingType);
    }
    if (filters.handleType) {
      filtered = filtered.filter(p => p.handle_type === filters.handleType);
    }

    setFilteredProducts(filtered);
  };

  const handleProductSelect = (product: Product) => {
    console.log('Selected product:', product);
    
    // Parse dimensions from the dimension string
    const parsedDimensions = parseDimensionString(product.dimensions || '');
    
    if (!parsedDimensions) {
      console.error('Unable to parse product dimensions');
      return;
    }

    // Use room-aware scaling: assume a medium lab room (5m x 4m) for context
    const roomScale = calculateProductScale(5000, 800, 50); // 5m room width, 800px canvas, 50px padding
    
    // Convert dimensions to canvas units using room-aware scale
    const canvasWidth = mmToCanvas(parsedDimensions.width, roomScale);
    const canvasHeight = mmToCanvas(parsedDimensions.depth, roomScale);
    const canvasDepth = mmToCanvas(parsedDimensions.height, roomScale);

    const placedProduct: PlacedProduct = {
      id: `placed-${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      category: product.category,
      position: { x: 100, y: 100 },
      rotation: 0,
      dimensions: {
        length: canvasWidth,
        width: canvasHeight,
        height: canvasDepth
      },
      color: '#3B82F6',
      thumbnail: product.thumbnail,
      modelPath: product.modelPath,
      description: product.description,
      specifications: product.specifications || []
    };

    onProductSelect(placedProduct);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-muted/30 p-3 rounded-lg">
        <h4 className="text-sm font-medium mb-3">Filter Product Variants</h4>
        <div className="grid grid-cols-1 gap-3">
          {/* Size/Dimensions Filter */}
          {uniqueDimensions.length > 1 && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Size</label>
              <Select value={filters.dimensions} onValueChange={(value) => setFilters(prev => ({ ...prev, dimensions: value }))}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Sizes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sizes</SelectItem>
                  {uniqueDimensions.map(dim => (
                    <SelectItem key={dim} value={dim}>{dim}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Drawer Count Filter - Always show for mobile cabinets */}
          {(uniqueDrawerCounts.length > 0 || products.some(p => p.category?.toLowerCase().includes('mobile'))) && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Number of Drawers</label>
              <Select value={filters.numberOfDrawers} onValueChange={(value) => setFilters(prev => ({ ...prev, numberOfDrawers: value }))}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Drawer Counts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Drawer Counts</SelectItem>
                  {uniqueDrawerCounts.length > 0 ? uniqueDrawerCounts.map(count => (
                    <SelectItem key={count} value={count}>
                      {count === '0' ? 'No Drawers' : `${count} Drawer${Number(count) > 1 ? 's' : ''}`}
                    </SelectItem>
                  )) : (
                    <>
                      <SelectItem value="0">No Drawers</SelectItem>
                      <SelectItem value="1">1 Drawer</SelectItem>
                      <SelectItem value="2">2 Drawers</SelectItem>
                      <SelectItem value="3">3 Drawers</SelectItem>
                      <SelectItem value="4">4 Drawers</SelectItem>
                      <SelectItem value="6">6 Drawers</SelectItem>
                      <SelectItem value="8">8 Drawers</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Finish Type Filter */}
          {uniqueFinishes.length > 1 && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Finish Type</label>
              <Select value={filters.finishType} onValueChange={(value) => setFilters(prev => ({ ...prev, finishType: value }))}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Finishes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Finishes</SelectItem>
                  {uniqueFinishes.map(finish => (
                    <SelectItem key={finish} value={finish}>{finish}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Orientation Filter */}
          {uniqueOrientations.length > 1 && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Orientation</label>
              <Select value={filters.orientation} onValueChange={(value) => setFilters(prev => ({ ...prev, orientation: value }))}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Orientations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Orientations</SelectItem>
                  {uniqueOrientations.map(orientation => (
                    <SelectItem key={orientation} value={orientation}>{orientation}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Door Type Filter */}
          {uniqueDoorTypes.length > 1 && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Door Type</label>
              <Select value={filters.doorType} onValueChange={(value) => setFilters(prev => ({ ...prev, doorType: value }))}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Door Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Door Types</SelectItem>
                  {uniqueDoorTypes.map(doorType => (
                    <SelectItem key={doorType} value={doorType}>{doorType}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Mounting Type Filter */}
          {uniqueMountingTypes.length > 1 && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Mounting Type</label>
              <Select value={filters.mountingType} onValueChange={(value) => setFilters(prev => ({ ...prev, mountingType: value }))}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Mounting Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Mounting Types</SelectItem>
                  {uniqueMountingTypes.map(mounting => (
                    <SelectItem key={mounting} value={mounting}>{mounting}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Handle Type Filter */}
          {uniqueHandleTypes.length > 1 && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Handle Type</label>
              <Select value={filters.handleType} onValueChange={(value) => setFilters(prev => ({ ...prev, handleType: value }))}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Handle Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Handle Types</SelectItem>
                  {uniqueHandleTypes.map(handle => (
                    <SelectItem key={handle} value={handle}>{handle}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-3">
          {filteredProducts.map((product) => {
            const displayTag = product.company_tags && product.company_tags.length > 0 
              ? product.company_tags[0] 
              : product.category;
            
            return (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {toTitleCase(displayTag)}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm leading-tight break-words">
                    <div className="truncate" title={product.editable_title || product.name}>
                      {(product.editable_title || product.name)?.length > 40 
                        ? `${(product.editable_title || product.name).substring(0, 40)}...`
                        : (product.editable_title || product.name)
                      }
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {product.thumbnail && (
                    <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {product.editable_description || product.description}
                  </p>
                  
                  <div className="space-y-1 mb-3">
                    {product.dimensions && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Size:</span> {product.dimensions}
                      </p>
                    )}
                    
                    {product.number_of_drawers && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Drawers:</span> {product.number_of_drawers}
                      </p>
                    )}
                    
                    {product.finish_type && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Finish:</span> {product.finish_type}
                      </p>
                    )}
                    
                    {product.orientation && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Orientation:</span> {product.orientation}
                      </p>
                    )}
                    
                    {product.door_type && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Door:</span> {product.door_type}
                      </p>
                    )}
                    
                    {product.mounting_type && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Mounting:</span> {product.mounting_type}
                      </p>
                    )}
                    
                    {product.handle_type && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Handle:</span> {product.handle_type}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => handleProductSelect(product)}
                    size="sm"
                    className="w-full"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add to Floor Plan
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No products found matching your search.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EnhancedSeriesSelector;
