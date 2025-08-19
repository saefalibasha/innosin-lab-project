
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Package, Search, ChevronDown, ChevronRight } from 'lucide-react';
import LazyProductImage from '@/components/LazyProductImage';
import { useProductSeries } from '@/hooks/useProductSeries';
import { Product } from '@/types/product';
import { ProductVariantSelector } from './ProductVariantSelector';

interface EnhancedSeriesSelectorProps {
  onProductDrag: (product: any) => void;
  currentTool: string;
  onProductUsed?: (productId: string) => void;
}

const EnhancedSeriesSelector: React.FC<EnhancedSeriesSelectorProps> = ({ 
  onProductDrag, 
  currentTool, 
  onProductUsed 
}) => {
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [seriesFilters, setSeriesFilters] = useState<Record<string, {
    finish?: string;
    orientation?: string;
    drawerCount?: string;
    dimensions?: string;
  }>>({});
  const { productSeries, loading, error } = useProductSeries();

  const extractDimensions = (product: Product) => {
    if (product.dimensions) {
      const dimensionMatch = product.dimensions.match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i);
      if (dimensionMatch) {
        const [, length, width, height, unit = 'mm'] = dimensionMatch;
        const factor = unit === 'mm' ? 0.001 : unit === 'cm' ? 0.01 : 1;
        return {
          length: parseFloat(length) * factor,
          width: parseFloat(width) * factor,
          height: parseFloat(height) * factor
        };
      }
    }
    return { length: 1.0, width: 0.6, height: 0.85 };
  };

  const filteredSeries = useMemo(() => {
    if (!searchTerm) return productSeries;
    
    return productSeries.filter(series =>
      series.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      series.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [productSeries, searchTerm]);

  const handleSeriesToggle = (seriesId: string) => {
    setExpandedSeries(expandedSeries === seriesId ? null : seriesId);
    setSelectedProduct(null);
    // Initialize filters for this series if not exists
    if (!seriesFilters[seriesId]) {
      setSeriesFilters(prev => ({ ...prev, [seriesId]: {} }));
    }
  };

  const handleFilterChange = (seriesId: string, filterType: string, value: string) => {
    setSeriesFilters(prev => ({
      ...prev,
      [seriesId]: {
        ...prev[seriesId],
        [filterType]: value === 'all' ? undefined : value
      }
    }));
    setSelectedProduct(null);
  };

  const getFilteredProducts = (seriesId: string, products: Product[]) => {
    const filters = seriesFilters[seriesId] || {};
    
    return products.filter(product => {
      if (filters.finish && product.finish_type !== filters.finish) return false;
      if (filters.orientation && product.orientation !== filters.orientation) return false;
      if (filters.drawerCount && String(product.drawer_count) !== filters.drawerCount) return false;
      if (filters.dimensions && product.dimensions !== filters.dimensions) return false;
      return true;
    });
  };

  const getUniqueValues = (products: Product[], field: keyof Product): string[] => {
    const values = products.map(p => {
      const value = p[field];
      return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
    }).filter(Boolean);
    return [...new Set(values)].sort();
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleDragStart = (e: React.DragEvent, product: Product) => {
    const dimensions = extractDimensions(product);
    
    // Convert millimeters to meters for proper canvas scaling
    const canvasScale = 100; // 1 meter = 100 pixels on canvas
    const scaledDimensions = {
      width: dimensions.width * canvasScale,  // Convert to canvas units
      height: dimensions.height * canvasScale,
      depth: dimensions.length * canvasScale
    };
    
    const floorPlanProduct = {
      id: product.id,
      productId: product.id,
      name: product.name,
      category: product.category,
      dimensions: scaledDimensions,
      realDimensions: dimensions, // Keep original dimensions for reference
      color: getCategoryColor(product.category),
      modelPath: product.model_path || product.modelPath,
      thumbnail: product.thumbnail_path || product.thumbnail,
      description: product.description,
      specifications: product.specifications,
      productCode: product.product_code || product.id,
      series: product.category,
      finish: product.finish_type,
      orientation: product.orientation,
      drawerCount: product.drawer_count,
      doorType: product.door_type
    };

    e.dataTransfer.setData('product', JSON.stringify(floorPlanProduct));
    onProductDrag(floorPlanProduct);
    
    if (onProductUsed) {
      onProductUsed(product.id);
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Innosin Lab': '#10b981',
      'Broen-Lab': '#3b82f6',
      'Hamilton Laboratory Solutions': '#1d4ed8',
      'Oriental Giken Inc.': '#ef4444'
    };
    return colors[category] || '#6b7280';
  };

  const isInteractionDisabled = currentTool !== 'select';

  if (loading) {
    return (
      <div className="p-4 text-center">
        <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-spin" />
        <p className="text-sm text-muted-foreground">Loading series...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-destructive">Error loading series: {error}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {isInteractionDisabled && (
        <div className="p-3 bg-warning/10 border border-warning/20 rounded-t text-sm text-warning-foreground">
          Switch to Select tool to place products
        </div>
      )}
      
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search series..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredSeries.map(series => (
            <Collapsible 
              key={series.id}
              open={expandedSeries === series.id}
              onOpenChange={() => handleSeriesToggle(series.id)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full p-3 h-auto text-left justify-between items-center"
                >
                  <div className="flex flex-col items-start space-y-1">
                    <div className="font-medium text-sm leading-tight">
                      {series.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {series.products.length} variants
                    </div>
                  </div>
                  {expandedSeries === series.id ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-3 pl-4 mt-2">
                {/* Variant Filters */}
                <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Filter Variants:</div>
                  
                  {getUniqueValues(series.products, 'finish_type').length > 1 && (
                    <div>
                      <label className="text-xs font-medium">Finish:</label>
                      <Select
                        value={seriesFilters[series.id]?.finish || 'all'}
                        onValueChange={(value) => handleFilterChange(series.id, 'finish', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Finishes</SelectItem>
                          {getUniqueValues(series.products, 'finish_type').map(finish => (
                            <SelectItem key={finish} value={finish}>{finish}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {getUniqueValues(series.products, 'orientation').length > 1 && (
                    <div>
                      <label className="text-xs font-medium">Orientation:</label>
                      <Select
                        value={seriesFilters[series.id]?.orientation || 'all'}
                        onValueChange={(value) => handleFilterChange(series.id, 'orientation', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Orientations</SelectItem>
                          {getUniqueValues(series.products, 'orientation').map(orientation => (
                            <SelectItem key={orientation} value={orientation}>{orientation}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {getUniqueValues(series.products, 'drawer_count').length > 1 && (
                    <div>
                      <label className="text-xs font-medium">Drawers:</label>
                      <Select
                        value={seriesFilters[series.id]?.drawerCount || 'all'}
                        onValueChange={(value) => handleFilterChange(series.id, 'drawerCount', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Drawer Counts</SelectItem>
                          {getUniqueValues(series.products, 'drawer_count').map(count => (
                            <SelectItem key={count} value={count}>{count} Drawers</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {getUniqueValues(series.products, 'dimensions').length > 1 && (
                    <div>
                      <label className="text-xs font-medium">Size:</label>
                      <Select
                        value={seriesFilters[series.id]?.dimensions || 'all'}
                        onValueChange={(value) => handleFilterChange(series.id, 'dimensions', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sizes</SelectItem>
                          {getUniqueValues(series.products, 'dimensions').map(size => (
                            <SelectItem key={size} value={size}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Filtered Products */}
                <div className="space-y-2">
                  {getFilteredProducts(series.id, series.products).map(product => (
                    <div
                      key={product.id}
                      draggable={!isInteractionDisabled}
                      onDragStart={(e) => handleDragStart(e, product)}
                      onClick={() => handleProductSelect(product)}
                      className={`border rounded-lg p-3 transition-all cursor-pointer ${
                        selectedProduct?.id === product.id
                          ? 'border-primary bg-accent'
                          : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      } ${
                        isInteractionDisabled 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'cursor-move'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="font-medium text-sm">
                          {product.name}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>
                            <span className="font-medium">Code:</span>
                            <div className="truncate">{product.product_code}</div>
                          </div>
                          
                          {product.dimensions && (
                            <div>
                              <span className="font-medium">Size:</span>
                              <div className="truncate">{product.dimensions}</div>
                            </div>
                          )}
                          
                          {product.finish_type && (
                            <div>
                              <span className="font-medium">Finish:</span>
                              <div className="truncate">{product.finish_type}</div>
                            </div>
                          )}
                          
                          {product.orientation && (
                            <div>
                              <span className="font-medium">Orient:</span>
                              <div className="truncate">{product.orientation}</div>
                            </div>
                          )}
                          
                          {product.drawer_count && (
                            <div>
                              <span className="font-medium">Drawers:</span>
                              <div className="truncate">{product.drawer_count}</div>
                            </div>
                          )}
                        </div>
                        
                        {!isInteractionDisabled && selectedProduct?.id === product.id && (
                          <div className="text-xs text-primary font-medium p-2 bg-primary/10 rounded text-center">
                            Drag to place on canvas ({extractDimensions(product).width.toFixed(2)}×{extractDimensions(product).length.toFixed(2)}×{extractDimensions(product).height.toFixed(2)}m)
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {getFilteredProducts(series.id, series.products).length === 0 && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No products match the selected filters
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EnhancedSeriesSelector;
