
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ModularCabinetVariant {
  id: string;
  name: string;
  product_code: string;
  dimensions: string;
  finish_type: string;
  orientation: string;
  door_type: string;
  drawer_count?: number;
  thumbnail_path: string;
  model_path: string;
  additional_images: string[];
}

interface ModularCabinetConfiguratorProps {
  variants: ModularCabinetVariant[];
  onVariantSelect: (variant: ModularCabinetVariant) => void;
  selectedVariant?: ModularCabinetVariant;
}

// Standardized dimension format utility
const standardizeDimensions = (dimensions: string): string => {
  if (!dimensions) return '';
  
  // Remove any existing "mm" suffix and normalize spacing
  const cleanDimensions = dimensions.replace(/mm$/i, '').trim();
  
  // Handle different formats like "500×500×650", "500 x 500 x 650", "500*500*650"
  const normalized = cleanDimensions
    .replace(/[×x*]/gi, ' × ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return `${normalized} mm`;
};

// Extract bench height from dimensions (last number)
const getBenchHeight = (dimensions: string): number => {
  if (!dimensions) return 0;
  const parts = dimensions.replace(/mm$/i, '').split(/[×x*\s]+/);
  return parseInt(parts[parts.length - 1]) || 0;
};

// Extract width from dimensions (first number)
const getWidth = (dimensions: string): number => {
  if (!dimensions) return 0;
  const parts = dimensions.replace(/mm$/i, '').split(/[×x*\s]+/);
  return parseInt(parts[0]) || 0;
};

// Utility function to extract door type from variant data
const getDoorTypeFromVariant = (variant: ModularCabinetVariant): string => {
  // First check if door_type is explicitly set and not empty
  if (variant.door_type && variant.door_type.trim() !== '' && variant.door_type !== 'None') {
    return variant.door_type;
  }
  
  // Check product code for door type indicators
  const productCode = variant.product_code.toUpperCase();
  
  if (productCode.includes('DD') || productCode.includes('DOUBLE')) {
    return 'Double-Door';
  } else if (productCode.includes('TD') || productCode.includes('TRIPLE')) {
    return 'Triple-Door';
  } else if (productCode.includes('SD') || productCode.includes('SINGLE')) {
    return 'Single-Door';
  }
  
  // Default to Single-Door for standard cabinets
  return 'Single-Door';
};

// Custom sort function for door types - Single-Door first, then logical order
const sortDoorTypes = (doorTypes: string[]): string[] => {
  const order = ['Single-Door', 'Double-Door', 'Triple-Door', 'Combination', 'Drawer-Only'];
  
  return doorTypes.sort((a, b) => {
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });
};

// Custom sort function for dimensions - sort by bench height first, then width
const sortDimensions = (dimensions: string[]): string[] => {
  return dimensions.sort((a, b) => {
    const aHeight = getBenchHeight(a);
    const bHeight = getBenchHeight(b);
    
    // First sort by bench height
    if (aHeight !== bHeight) {
      return aHeight - bHeight;
    }
    
    // Then sort by width
    const aWidth = getWidth(a);
    const bWidth = getWidth(b);
    return aWidth - bWidth;
  });
};

// Group dimensions by bench height for better organization
const groupDimensionsByHeight = (dimensions: string[]): Record<string, string[]> => {
  const groups: Record<string, string[]> = {};
  
  dimensions.forEach(dim => {
    const height = getBenchHeight(dim);
    const key = height === 650 ? '750mm Bench' : height === 800 ? '900mm Bench' : `${height}mm Bench`;
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(dim);
  });
  
  return groups;
};

const ModularCabinetConfigurator: React.FC<ModularCabinetConfiguratorProps> = ({
  variants,
  onVariantSelect,
  selectedVariant
}) => {
  const [selectedDoorType, setSelectedDoorType] = useState<string>('');
  const [selectedDimensions, setSelectedDimensions] = useState<string>('');
  const [selectedOrientation, setSelectedOrientation] = useState<string>('');
  const [selectedDrawerCount, setSelectedDrawerCount] = useState<string>('');
  const [selectedFinish, setSelectedFinish] = useState<string>('PC');

  // Get available options with proper filtering and standardization
  const options = useMemo(() => {
    console.log('🔧 ModularCabinetConfigurator - Processing variants:', variants.length);
    
    const doorTypes = new Set<string>();
    const dimensionsSet = new Set<string>();
    const orientations = new Set<string>();
    const drawerCounts = new Set<number>();
    const finishes = new Set<string>();

    variants.forEach(variant => {
      const doorType = getDoorTypeFromVariant(variant);
      const standardizedDimensions = standardizeDimensions(variant.dimensions);
      
      console.log(`Variant ${variant.id}: "${variant.product_code}" -> door_type="${doorType}", dimensions="${standardizedDimensions}"`);
      
      // Apply progressive filtering
      const matchesDoorType = !selectedDoorType || doorType === selectedDoorType;
      const matchesDimensions = !selectedDimensions || standardizedDimensions === selectedDimensions;
      const matchesOrientation = !selectedOrientation || variant.orientation === selectedOrientation;
      const matchesDrawerCount = !selectedDrawerCount || (variant.drawer_count?.toString() === selectedDrawerCount);
      const matchesFinish = !selectedFinish || variant.finish_type === selectedFinish;

      // For door types, show all available
      if (!selectedDoorType) {
        doorTypes.add(doorType);
      }
      
      // For dimensions, only show those available for selected door type
      if (matchesDoorType && !selectedDimensions) {
        dimensionsSet.add(standardizedDimensions);
      }
      
      // For other options, filter based on previous selections
      if (matchesDoorType && matchesDimensions) {
        if (variant.orientation && variant.orientation !== 'None' && variant.orientation !== '') {
          orientations.add(variant.orientation);
        }
        if (variant.drawer_count) {
          drawerCounts.add(variant.drawer_count);
        }
        finishes.add(variant.finish_type);
      }
    });

    const sortedDoorTypes = sortDoorTypes(Array.from(doorTypes));
    const sortedDimensions = sortDimensions(Array.from(dimensionsSet));
    const dimensionGroups = groupDimensionsByHeight(sortedDimensions);
    
    console.log('🔧 Door types detected:', Array.from(doorTypes));
    console.log('🔧 Door types sorted:', sortedDoorTypes);
    console.log('🔧 Dimensions grouped:', dimensionGroups);

    return {
      doorTypes: sortedDoorTypes,
      dimensions: sortedDimensions,
      dimensionGroups,
      orientations: Array.from(orientations).sort(),
      drawerCounts: Array.from(drawerCounts).sort((a, b) => a - b),
      finishes: Array.from(finishes).sort()
    };
  }, [variants, selectedDoorType, selectedDimensions, selectedOrientation, selectedDrawerCount, selectedFinish]);

  // Get matching variant based on current selections
  const matchingVariant = useMemo(() => {
    if (!selectedDoorType || !selectedDimensions || !selectedFinish) return null;

    return variants.find(variant => {
      const doorType = getDoorTypeFromVariant(variant);
      const standardizedDimensions = standardizeDimensions(variant.dimensions);
      
      const matchesDoorType = doorType === selectedDoorType;
      const matchesDimensions = standardizedDimensions === selectedDimensions;
      const matchesOrientation = !selectedOrientation || variant.orientation === selectedOrientation;
      const matchesDrawerCount = !selectedDrawerCount || (variant.drawer_count?.toString() === selectedDrawerCount);
      const matchesFinish = variant.finish_type === selectedFinish;

      return matchesDoorType && matchesDimensions && matchesOrientation && matchesDrawerCount && matchesFinish;
    });
  }, [variants, selectedDoorType, selectedDimensions, selectedOrientation, selectedDrawerCount, selectedFinish]);

  // Handle door type selection
  const handleDoorTypeSelect = (doorType: string) => {
    setSelectedDoorType(doorType);
    // Reset dependent selections
    setSelectedDimensions('');
    setSelectedOrientation('');
    setSelectedDrawerCount('');
  };

  // Handle dimension selection
  const handleDimensionSelect = (dimension: string) => {
    setSelectedDimensions(dimension);
    // Reset dependent selections
    setSelectedOrientation('');
    setSelectedDrawerCount('');
  };

  // Handle variant selection
  const handleVariantSelect = () => {
    if (matchingVariant) {
      onVariantSelect(matchingVariant);
    }
  };

  return (
    <div className="space-y-6">
      {/* Door Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step 1: Select Door Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {options.doorTypes.map(doorType => (
              <Button
                key={doorType}
                variant={selectedDoorType === doorType ? "default" : "outline"}
                onClick={() => handleDoorTypeSelect(doorType)}
                className="h-auto py-3 px-4 text-left"
              >
                <div className="text-center w-full">
                  <div className="font-medium">{doorType}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dimensions Selection */}
      {selectedDoorType && options.dimensions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Step 2: Select Dimensions</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedDimensions} onValueChange={handleDimensionSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose dimensions" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {Object.entries(options.dimensionGroups).map(([benchHeight, dimensions]) => (
                  <div key={benchHeight}>
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground bg-muted/50 sticky top-0">
                      {benchHeight}
                    </div>
                    {dimensions.map(dimension => (
                      <SelectItem key={dimension} value={dimension} className="pl-4">
                        {dimension}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Orientation Selection */}
      {selectedDimensions && options.orientations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Step 3: Select Orientation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.orientations.map(orientation => (
                <Button
                  key={orientation}
                  variant={selectedOrientation === orientation ? "default" : "outline"}
                  onClick={() => setSelectedOrientation(orientation)}
                  className="h-auto py-3 px-4"
                >
                  <div className="text-center w-full">
                    <div className="font-medium">{orientation === 'Left-Handed' ? 'Left-Handed' : 'Right-Handed'}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drawer Count Selection */}
      {selectedDimensions && options.drawerCounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Step 4: Select Drawer Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {options.drawerCounts.map(count => (
                <Button
                  key={count}
                  variant={selectedDrawerCount === count.toString() ? "default" : "outline"}
                  onClick={() => setSelectedDrawerCount(count.toString())}
                  className="h-auto py-3 px-4"
                >
                  <div className="text-center w-full">
                    <div className="font-medium">{count} Drawer{count > 1 ? 's' : ''}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Finish Selection */}
      {selectedDimensions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Step {options.orientations.length > 0 || options.drawerCounts.length > 0 ? '5' : '3'}: Select Finish</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.finishes.map(finish => (
                <Button
                  key={finish}
                  variant={selectedFinish === finish ? "default" : "outline"}
                  onClick={() => setSelectedFinish(finish)}
                  className="h-auto py-3 px-4"
                >
                  <div className="text-center w-full">
                    <div className="font-medium">
                      {finish === 'PC' ? 'Powder Coat' : finish === 'SS' ? 'Stainless Steel' : finish}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Summary */}
      {matchingVariant && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Door Type: {selectedDoorType}</Badge>
                <Badge variant="secondary">Dimensions: {selectedDimensions}</Badge>
                {selectedOrientation && <Badge variant="secondary">Orientation: {selectedOrientation}</Badge>}
                {selectedDrawerCount && <Badge variant="secondary">Drawers: {selectedDrawerCount}</Badge>}
                <Badge variant="secondary">Finish: {selectedFinish === 'PC' ? 'Powder Coat' : 'Stainless Steel'}</Badge>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h4 className="font-medium">{matchingVariant.name}</h4>
                  <p className="text-sm text-muted-foreground">Product Code: {matchingVariant.product_code}</p>
                </div>
                <Button onClick={handleVariantSelect} size="lg" className="bg-sea hover:bg-sea-dark">
                  Select This Configuration
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModularCabinetConfigurator;
