
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
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
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
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
              
              <CollapsibleContent className="space-y-1 pl-4 mt-2">
                {series.products.map(product => (
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
                          Drag to place on canvas
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EnhancedSeriesSelector;
