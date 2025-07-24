
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Package, Search } from 'lucide-react';
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
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<{
    finish?: string;
    orientation?: string;
    drawerCount?: string;
    doorType?: string;
    dimensions?: string;
  }>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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

  // Filter series based on search term
  const filteredSeries = useMemo(() => {
    if (!searchTerm) return productSeries;
    
    return productSeries.filter(series =>
      series.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      series.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [productSeries, searchTerm]);

  const handleVariantChange = (variantType: string, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantType]: value
    }));
    setSelectedProduct(null); // Reset product selection when variants change
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
      // Include variant information
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

  const selectedSeriesData = productSeries.find(s => s.id === selectedSeries);

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
                    setSelectedVariants({});
                    setSelectedProduct(null);
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
                      {series.products.length}
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right column - Variant selection and preview */}
        <div className="w-1/2 flex flex-col">
          {selectedSeriesData ? (
            <>
              <div className="p-3 border-b">
                <h4 className="font-medium text-sm mb-2">{selectedSeriesData.name}</h4>
                <p className="text-xs text-muted-foreground mb-3">{selectedSeriesData.description}</p>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="p-3">
                  <ProductVariantSelector
                    products={selectedSeriesData.products}
                    selectedVariants={selectedVariants}
                    onVariantChange={handleVariantChange}
                    onProductSelect={handleProductSelect}
                    selectedProduct={selectedProduct}
                  />
                </div>
              </div>
              
              {selectedProduct && (
                <div className="p-3 border-t">
                  <div
                    draggable={!isInteractionDisabled}
                    onDragStart={(e) => handleDragStart(e, selectedProduct)}
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                      isInteractionDisabled 
                        ? 'opacity-50 cursor-not-allowed border-gray-300' 
                        : 'cursor-move hover:border-primary hover:bg-accent/50 border-primary/30'
                    }`}
                  >
                    <LazyProductImage
                      src={selectedProduct.thumbnail_path || selectedProduct.thumbnail || '/placeholder.svg'}
                      alt={selectedProduct.name}
                      className="w-16 h-16 mx-auto rounded object-cover mb-2"
                      fallback="/placeholder.svg"
                    />
                    
                    <div className="space-y-1">
                      <h5 className="font-medium text-sm">{selectedProduct.name}</h5>
                      <div className="text-xs text-muted-foreground">
                        <div>{selectedProduct.product_code}</div>
                        {selectedProduct.dimensions && (
                          <div>Dimensions: {selectedProduct.dimensions}</div>
                        )}
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
                <p className="text-sm text-muted-foreground">Select a series to view variants</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedSeriesSelector;
