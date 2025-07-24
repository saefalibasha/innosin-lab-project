
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Package, Ruler, Search } from 'lucide-react';
import LazyProductImage from '@/components/LazyProductImage';
import { useProductSeries } from '@/hooks/useProductSeries';
import { Product } from '@/types/product';

interface EnhancedSeriesSelectorProps {
  onProductDrag: (product: any) => void;
  currentTool: string;
  onProductUsed?: (productId: string) => void;
}

interface SeriesVariant {
  product: Product;
  dimensions: string;
  dimensionsParsed: { length: number; width: number; height: number };
}

const EnhancedSeriesSelector: React.FC<EnhancedSeriesSelectorProps> = ({ 
  onProductDrag, 
  currentTool, 
  onProductUsed 
}) => {
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [selectedDimensions, setSelectedDimensions] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const { productSeries, loading, error } = useProductSeries();

  // Extract dimensions from product data
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

  // Filter series based on search term
  const filteredSeries = useMemo(() => {
    if (!searchTerm) return productSeries;
    
    return productSeries.filter(series =>
      series.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      series.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [productSeries, searchTerm]);

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

  const selectedSeriesData = productSeries.find(s => s.id === selectedSeries);
  const selectedVariants = selectedSeries ? seriesWithVariants.get(selectedSeries) || [] : [];
  const selectedVariant = selectedVariants.find(v => v.dimensions === selectedDimensions) || selectedVariants[0];

  return (
    <div className="h-full flex flex-col">
      {isInteractionDisabled && (
        <div className="p-3 bg-warning/10 border border-warning/20 rounded-t text-xs text-warning-foreground">
          Switch to Select tool to place products
        </div>
      )}
      
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search series..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 h-8 text-xs"
          />
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left column - Series selection */}
        <div className="w-1/2 border-r">
          <ScrollArea className="h-80">
            <div className="space-y-2 p-3">
              {filteredSeries.map(series => (
                <Button
                  key={series.id}
                  variant={selectedSeries === series.id ? "default" : "ghost"}
                  className="w-full p-3 h-auto justify-start"
                  onClick={() => {
                    setSelectedSeries(series.id);
                    setSelectedDimensions('');
                  }}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <LazyProductImage
                      src={series.thumbnail || '/placeholder.svg'}
                      alt={series.name}
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                      fallback="/placeholder.svg"
                    />
                    
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-xs">{series.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {series.description}
                      </p>
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      {seriesWithVariants.get(series.id)?.length || 0}
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right column - Dimension selection and preview */}
        <div className="w-1/2 flex flex-col">
          {selectedSeriesData ? (
            <>
              <div className="p-3 border-b">
                <h4 className="font-medium text-sm mb-2">{selectedSeriesData.name}</h4>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    <Ruler className="inline h-3 w-3 mr-1" />
                    Select Dimensions:
                  </label>
                  <Select
                    value={selectedDimensions || selectedVariants[0]?.dimensions || ''}
                    onValueChange={setSelectedDimensions}
                  >
                    <SelectTrigger className="w-full h-9 text-xs">
                      <SelectValue placeholder="Choose size..." />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedVariants.map((variant) => (
                        <SelectItem key={variant.dimensions} value={variant.dimensions}>
                          <div className="flex items-center justify-between w-full">
                            <span>{variant.dimensions}</span>
                            <span className="text-muted-foreground ml-2">
                              {variant.dimensionsParsed.length.toFixed(1)} × {variant.dimensionsParsed.width.toFixed(1)}m
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedVariant && (
                <div className="flex-1 p-3">
                  <div
                    draggable={!isInteractionDisabled}
                    onDragStart={(e) => handleDragStart(e, selectedVariant)}
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                      isInteractionDisabled 
                        ? 'opacity-50 cursor-not-allowed border-gray-300' 
                        : 'cursor-move hover:border-primary hover:bg-accent/50 border-primary/30'
                    }`}
                  >
                    <LazyProductImage
                      src={selectedVariant.product.thumbnail || '/placeholder.svg'}
                      alt={selectedVariant.product.name}
                      className="w-20 h-20 mx-auto rounded object-cover mb-3"
                      fallback="/placeholder.svg"
                    />
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">{selectedVariant.product.name}</h5>
                      <div className="text-xs text-muted-foreground">
                        <div>Dimensions: {selectedVariant.dimensions}</div>
                        <div>
                          Size: {selectedVariant.dimensionsParsed.length.toFixed(1)} × {selectedVariant.dimensionsParsed.width.toFixed(1)} × {selectedVariant.dimensionsParsed.height.toFixed(1)}m
                        </div>
                      </div>
                      
                      {!isInteractionDisabled && (
                        <div className="text-xs text-primary font-medium">
                          Drag to place on canvas
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Select a series to view dimensions</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedSeriesSelector;
