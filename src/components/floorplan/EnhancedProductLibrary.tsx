
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, ChevronDown, ChevronRight, Package, Loader2 } from 'lucide-react';
import LazyProductImage from '@/components/LazyProductImage';
import { useProductSeries } from '@/hooks/useProductSeries';
import { Product } from '@/types/product';

type DrawingTool = 'wall' | 'line' | 'freehand' | 'pan' | 'eraser' | 'select' | 'interior-wall' | 'door' | 'rotate';

interface EnhancedProductLibraryProps {
  onProductDrag: (product: any) => void;
  currentTool: DrawingTool;
  onProductUsed?: (productId: string) => void;
}

// Helper function to parse dimensions from product data
const extractDimensions = (product: Product) => {
  if (product.dimensions) {
    // Parse dimensions like "750×500×650 mm" or "750x500x650"
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

  // Parse from specifications if available
  if (product.specifications) {
    const specs = Array.isArray(product.specifications) ? product.specifications : [];
    const dimensionSpec = specs.find(spec => 
      typeof spec === 'string' && (
        spec.toLowerCase().includes('dimensions') || 
        spec.toLowerCase().includes('size')
      )
    );

    if (dimensionSpec && typeof dimensionSpec === 'string') {
      const dimensionMatch = dimensionSpec.match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i);
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
  }

  // Default dimensions based on category
  const categoryDefaults: Record<string, any> = {
    'Innosin Lab': { length: 1.0, width: 0.5, height: 0.85 },
    'Broen-Lab': { length: 1.2, width: 0.6, height: 0.85 },
    'Hamilton Laboratory Solutions': { length: 3.0, width: 0.75, height: 0.85 },
    'Oriental Giken Inc.': { length: 1.5, width: 0.75, height: 2.4 }
  };

  return categoryDefaults[product.category] || { length: 1.0, width: 0.6, height: 0.85 };
};

// Helper function to get category color
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Innosin Lab': '#10b981',
    'Broen-Lab': '#3b82f6',
    'Hamilton Laboratory Solutions': '#1d4ed8',
    'Oriental Giken Inc.': '#ef4444'
  };
  return colors[category] || '#6b7280';
};

const EnhancedProductLibrary: React.FC<EnhancedProductLibraryProps> = ({ 
  onProductDrag, 
  currentTool, 
  onProductUsed 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedSeries, setCollapsedSeries] = useState<Record<string, boolean>>({});
  const { productSeries, loading, error } = useProductSeries();

  // Filter product series based on search term
  const filteredSeries = useMemo(() => {
    if (!searchTerm) return productSeries;

    return productSeries.map(series => ({
      ...series,
      products: series.products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(series => series.products.length > 0);
  }, [productSeries, searchTerm]);

  const toggleSeries = (seriesId: string) => {
    setCollapsedSeries(prev => ({
      ...prev,
      [seriesId]: !prev[seriesId]
    }));
  };

  const handleDragStart = (e: React.DragEvent, product: Product) => {
    const dimensions = extractDimensions(product);
    const floorPlanProduct = {
      id: product.id,
      productId: product.id,
      name: product.name,
      category: product.category,
      dimensions,
      color: getCategoryColor(product.category),
      modelPath: product.modelPath,
      thumbnail: product.thumbnail,
      description: product.description,
      specifications: product.specifications,
      productCode: product.id,
      series: product.category
    };

    e.dataTransfer.setData('product', JSON.stringify(floorPlanProduct));
    onProductDrag(floorPlanProduct);
    
    // Track product usage
    if (onProductUsed) {
      onProductUsed(product.id);
    }
  };

  const isInteractionDisabled = currentTool !== 'select';

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading Products...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm text-destructive">Error Loading Products</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const totalProducts = filteredSeries.reduce((sum, series) => sum + series.products.length, 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Package className="h-4 w-4" />
          Product Library
        </CardTitle>
        <div className="text-xs text-muted-foreground mb-3">
          {filteredSeries.length} series • {totalProducts} products
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 h-8 text-xs"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isInteractionDisabled && (
          <div className="mx-3 mb-3 p-2 bg-warning/10 border border-warning/20 rounded text-xs text-warning-foreground">
            Switch to Select tool to place products
          </div>
        )}
        
        <ScrollArea className="h-80">
          <div className="space-y-2 p-3">
            {filteredSeries.map((series) => {
              const isCollapsed = collapsedSeries[series.id];
              
              return (
                <Collapsible
                  key={series.id}
                  open={!isCollapsed}
                  onOpenChange={() => toggleSeries(series.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-2 h-auto"
                    >
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: getCategoryColor(series.category) }}
                        />
                        <span className="font-medium text-xs">{series.name}</span>
                        <Badge variant="outline" className="text-xs h-4">
                          {series.products.length}
                        </Badge>
                      </div>
                      {isCollapsed ? (
                        <ChevronRight className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-1 mt-1">
                    {series.products.map(product => {
                      const dimensions = extractDimensions(product);
                      
                      return (
                        <div
                          key={product.id}
                          draggable={!isInteractionDisabled}
                          onDragStart={(e) => handleDragStart(e, product)}
                          className={`border border-border rounded-lg p-2 transition-all duration-200 ${
                            isInteractionDisabled 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'cursor-move hover:bg-accent hover:border-accent-foreground/20 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <LazyProductImage
                              src={product.thumbnail || '/placeholder.svg'}
                              alt={product.name}
                              className="w-12 h-12 rounded object-cover flex-shrink-0"
                              fallback="/placeholder.svg"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-xs truncate">{product.name}</h4>
                                <div 
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: getCategoryColor(series.category) }}
                                />
                              </div>
                              
                              <p className="text-xs text-muted-foreground mb-1 truncate">
                                {product.id}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {dimensions.length.toFixed(1)} × {dimensions.width.toFixed(1)}m
                                </span>
                                
                                {product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0 && (
                                  <Badge variant="secondary" className="text-xs h-4">
                                    {product.specifications.length} specs
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
            
            {filteredSeries.length === 0 && (
              <div className="text-center py-8">
                <p className="text-xs text-muted-foreground">No products found</p>
                <p className="text-xs text-muted-foreground">Try adjusting your search</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default EnhancedProductLibrary;
