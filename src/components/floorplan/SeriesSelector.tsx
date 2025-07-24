
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, Ruler } from 'lucide-react';
import LazyProductImage from '@/components/LazyProductImage';
import { useProductSeries } from '@/hooks/useProductSeries';
import { Product } from '@/types/product';

type DrawingTool = 'wall' | 'line' | 'freehand' | 'pan' | 'eraser' | 'select' | 'interior-wall' | 'door' | 'rotate';

interface SeriesSelectorProps {
  onProductDrag: (product: any) => void;
  currentTool: DrawingTool;
  onProductUsed?: (productId: string) => void;
}

interface SeriesVariant {
  product: Product;
  dimensions: string;
  dimensionsParsed: { length: number; width: number; height: number };
}

const SeriesSelector: React.FC<SeriesSelectorProps> = ({ 
  onProductDrag, 
  currentTool, 
  onProductUsed 
}) => {
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [selectedDimensions, setSelectedDimensions] = useState<Record<string, string>>({});
  const { productSeries, loading, error } = useProductSeries();

  // Parse dimensions from product data
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

  // Group products by series and create variants
  const seriesWithVariants = useMemo(() => {
    const seriesMap = new Map<string, SeriesVariant[]>();
    
    productSeries.forEach(series => {
      const variants: SeriesVariant[] = [];
      
      series.products.forEach(product => {
        const dimensions = extractDimensions(product);
        variants.push({
          product,
          dimensions: product.dimensions || 'Standard',
          dimensionsParsed: dimensions
        });
      });
      
      if (variants.length > 0) {
        seriesMap.set(series.id, variants);
      }
    });
    
    return seriesMap;
  }, [productSeries]);

  const handleDragStart = (e: React.DragEvent, variant: SeriesVariant) => {
    const floorPlanProduct = {
      id: variant.product.id,
      productId: variant.product.id,
      name: variant.product.name,
      category: variant.product.category,
      dimensions: variant.dimensionsParsed,
      color: getCategoryColor(variant.product.category),
      modelPath: variant.product.modelPath,
      thumbnail: variant.product.thumbnail,
      description: variant.product.description,
      specifications: variant.product.specifications,
      productCode: variant.product.id,
      series: variant.product.category
    };

    e.dataTransfer.setData('product', JSON.stringify(floorPlanProduct));
    onProductDrag(floorPlanProduct);
    
    if (onProductUsed) {
      onProductUsed(variant.product.id);
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            Loading Series...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm text-destructive">Error Loading Series</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Package className="h-4 w-4" />
          Product Series
        </CardTitle>
        <div className="text-xs text-muted-foreground">
          {seriesWithVariants.size} series available
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isInteractionDisabled && (
          <div className="mx-3 mb-3 p-2 bg-warning/10 border border-warning/20 rounded text-xs text-warning-foreground">
            Switch to Select tool to place products
          </div>
        )}
        
        <ScrollArea className="h-80">
          <div className="space-y-3 p-3">
            {Array.from(seriesWithVariants.entries()).map(([seriesId, variants]) => {
              const series = productSeries.find(s => s.id === seriesId);
              if (!series) return null;
              
              const isSelected = selectedSeries === seriesId;
              const selectedDimension = selectedDimensions[seriesId];
              const selectedVariant = variants.find(v => v.dimensions === selectedDimension) || variants[0];
              
              return (
                <div key={seriesId} className="border rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    className="w-full p-3 h-auto justify-start"
                    onClick={() => setSelectedSeries(isSelected ? null : seriesId)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <LazyProductImage
                        src={series.thumbnail || '/placeholder.svg'}
                        alt={series.name}
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                        fallback="/placeholder.svg"
                      />
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm">{series.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {variants.length} variants
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {series.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                  
                  {isSelected && (
                    <div className="p-3 border-t bg-muted/50">
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            Select Dimensions:
                          </label>
                          <Select
                            value={selectedDimension || variants[0]?.dimensions}
                            onValueChange={(value) => 
                              setSelectedDimensions(prev => ({ ...prev, [seriesId]: value }))
                            }
                          >
                            <SelectTrigger className="w-full mt-1 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {variants.map((variant) => (
                                <SelectItem key={variant.dimensions} value={variant.dimensions}>
                                  <div className="flex items-center gap-2">
                                    <Ruler className="h-3 w-3" />
                                    {variant.dimensions}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {selectedVariant && (
                          <div
                            draggable={!isInteractionDisabled}
                            onDragStart={(e) => handleDragStart(e, selectedVariant)}
                            className={`border rounded-lg p-2 transition-all ${
                              isInteractionDisabled 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'cursor-move hover:bg-accent hover:border-accent-foreground/20'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <LazyProductImage
                                src={selectedVariant.product.thumbnail || '/placeholder.svg'}
                                alt={selectedVariant.product.name}
                                className="w-10 h-10 rounded object-cover"
                                fallback="/placeholder.svg"
                              />
                              <div className="flex-1">
                                <div className="text-xs font-medium">
                                  {selectedVariant.product.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {selectedVariant.dimensionsParsed.length.toFixed(1)} × {selectedVariant.dimensionsParsed.width.toFixed(1)}m
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SeriesSelector;
