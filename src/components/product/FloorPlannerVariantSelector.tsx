import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { PlacedProduct } from '@/types/floorPlanTypes';
import { Product } from '@/types/product';
import { formatAttributeValue, getOrientationDisplayName } from '@/utils/productTerminology';
import { formatProductName } from '@/utils/seriesNameFormatter';
import { parseDimensionString, mmToCanvas, calculateProductScale } from '@/utils/measurements';

interface FloorPlannerVariantSelectorProps {
  products: Product[];
  onProductSelect: (product: PlacedProduct) => void;
  scale: number;
}

export const FloorPlannerVariantSelector: React.FC<FloorPlannerVariantSelectorProps> = ({
  products,
  onProductSelect,
  scale
}) => {
  const [selectedVariant, setSelectedVariant] = useState<{
    dimensions?: string;
    numberOfDrawers?: string;
    finishType?: string;
    orientation?: string;
    doorType?: string;
    mountingType?: string;
    handleType?: string;
  }>({});

  // Get available values for each filter based on current selections
  const getAvailableValues = (attribute: keyof typeof selectedVariant): string[] => {
    let filteredProducts = products;

    // Apply all other filters except the current one
    Object.entries(selectedVariant).forEach(([key, value]) => {
      if (key !== attribute && value) {
        switch (key) {
          case 'dimensions':
            filteredProducts = filteredProducts.filter(p => p.dimensions === value);
            break;
          case 'numberOfDrawers':
            filteredProducts = filteredProducts.filter(p => String(p.number_of_drawers) === value);
            break;
          case 'finishType':
            filteredProducts = filteredProducts.filter(p => p.finish_type === value);
            break;
          case 'orientation':
            filteredProducts = filteredProducts.filter(p => p.orientation === value);
            break;
          case 'doorType':
            filteredProducts = filteredProducts.filter(p => p.door_type === value);
            break;
          case 'mountingType':
            filteredProducts = filteredProducts.filter(p => p.mounting_type === value);
            break;
          case 'handleType':
            filteredProducts = filteredProducts.filter(p => p.handle_type === value);
            break;
        }
      }
    });

    // Extract unique values for the current attribute
    const values = filteredProducts
      .map(p => {
        switch (attribute) {
          case 'dimensions': return p.dimensions;
          case 'numberOfDrawers': return String(p.number_of_drawers);
          case 'finishType': return p.finish_type;
          case 'orientation': return p.orientation;
          case 'doorType': return p.door_type;
          case 'mountingType': return p.mounting_type;
          case 'handleType': return p.handle_type;
          default: return undefined;
        }
      })
      .filter(Boolean)
      .filter((value, index, arr) => arr.indexOf(value) === index)
      .map(value => String(value))
      .sort();

    return values;
  };

  // Get filtered products based on current selections
  const filteredProducts = useMemo(() => {
    let filtered = products;

    Object.entries(selectedVariant).forEach(([key, value]) => {
      if (value) {
        switch (key) {
          case 'dimensions':
            filtered = filtered.filter(p => p.dimensions === value);
            break;
          case 'numberOfDrawers':
            filtered = filtered.filter(p => String(p.number_of_drawers) === value);
            break;
          case 'finishType':
            filtered = filtered.filter(p => p.finish_type === value);
            break;
          case 'orientation':
            filtered = filtered.filter(p => p.orientation === value);
            break;
          case 'doorType':
            filtered = filtered.filter(p => p.door_type === value);
            break;
          case 'mountingType':
            filtered = filtered.filter(p => p.mounting_type === value);
            break;
          case 'handleType':
            filtered = filtered.filter(p => p.handle_type === value);
            break;
        }
      }
    });

    return filtered;
  }, [products, selectedVariant]);

  const handleProductSelect = (product: Product) => {
    const parsedDimensions = parseDimensionString(product.dimensions || '');
    
    if (!parsedDimensions) {
      console.error('Unable to parse product dimensions');
      return;
    }

    const roomScale = calculateProductScale(5000, 800, 50);
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

  const availableDimensions = getAvailableValues('dimensions');
  const availableDrawerCounts = getAvailableValues('numberOfDrawers');
  const availableFinishes = getAvailableValues('finishType');
  const availableOrientations = getAvailableValues('orientation');
  const availableDoorTypes = getAvailableValues('doorType');
  const availableMountingTypes = getAvailableValues('mountingType');
  const availableHandleTypes = getAvailableValues('handleType');

  return (
    <div className="space-y-4">
      {/* Cascading Variant Selectors */}
      <div className="bg-muted/30 p-3 rounded-lg">
        <h4 className="text-sm font-medium mb-3">Configure Variant</h4>
        <div className="grid grid-cols-1 gap-3">
          
          {/* Dimensions */}
          {availableDimensions.length > 1 && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Size</label>
              <Select 
                value={selectedVariant.dimensions || ''} 
                onValueChange={(value) => setSelectedVariant(prev => ({ ...prev, dimensions: value }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sizes</SelectItem>
                  {availableDimensions.map(dim => (
                    <SelectItem key={dim} value={dim}>{dim}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Drawer Count */}
          {availableDrawerCounts.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Number of Drawers</label>
              <Select 
                value={selectedVariant.numberOfDrawers || ''} 
                onValueChange={(value) => setSelectedVariant(prev => ({ ...prev, numberOfDrawers: value }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select Drawer Count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Drawer Counts</SelectItem>
                  {availableDrawerCounts.map(count => (
                    <SelectItem key={count} value={count}>
                      {formatAttributeValue('drawer_count', count)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Finish Type */}
          {availableFinishes.length > 1 && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Finish Type</label>
              <Select 
                value={selectedVariant.finishType || ''} 
                onValueChange={(value) => setSelectedVariant(prev => ({ ...prev, finishType: value }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select Finish" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Finishes</SelectItem>
                  {availableFinishes.map(finish => (
                    <SelectItem key={finish} value={finish}>{finish}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Orientation */}
          {availableOrientations.length > 1 && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Orientation</label>
              <Select 
                value={selectedVariant.orientation || ''} 
                onValueChange={(value) => setSelectedVariant(prev => ({ ...prev, orientation: value }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select Orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Orientations</SelectItem>
                  {availableOrientations.map(orientation => (
                    <SelectItem key={orientation} value={orientation}>
                      {getOrientationDisplayName(orientation)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Door Type */}
          {availableDoorTypes.length > 1 && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Door Type</label>
              <Select 
                value={selectedVariant.doorType || ''} 
                onValueChange={(value) => setSelectedVariant(prev => ({ ...prev, doorType: value }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select Door Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Door Types</SelectItem>
                  {availableDoorTypes.map(doorType => (
                    <SelectItem key={doorType} value={doorType}>{doorType}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

        </div>
      </div>

      {/* Available Products */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Available Products ({filteredProducts.length})</h4>
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h5 className="text-xs font-medium truncate" title={formatProductName(product.name)}>
                    {formatProductName(product.name)}
                  </h5>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.dimensions && (
                      <Badge variant="outline" className="text-xs">{product.dimensions}</Badge>
                    )}
                    {product.number_of_drawers !== undefined && product.number_of_drawers !== null && (
                      <Badge variant="outline" className="text-xs">
                        {formatAttributeValue('drawer_count', product.number_of_drawers)}
                      </Badge>
                    )}
                    {product.orientation && (
                      <Badge variant="outline" className="text-xs">
                        {getOrientationDisplayName(product.orientation)}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => handleProductSelect(product)}
                  size="sm"
                  className="ml-2"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};