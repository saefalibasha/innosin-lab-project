
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getVariantAssetUrls } from '@/services/variantService';

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

// Utility function to normalize dimension display
const normalizeDimensions = (dimensions: string): string => {
  // Remove any existing "mm" suffix and normalize spacing
  const cleanDimensions = dimensions.replace(/mm$/i, '').trim();
  
  // Handle different formats like "500×500×650" or "500 x 500 x 650"
  const normalized = cleanDimensions
    .replace(/[×x]/g, ' × ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return `${normalized} mm`;
};

// Utility function to extract door type from variant data
const getDoorTypeFromVariant = (variant: ModularCabinetVariant): string => {
  // First check if door_type is explicitly set and not empty
  if (variant.door_type && variant.door_type.trim() !== '' && variant.door_type !== 'None') {
    return variant.door_type;
  }
  
  // Check product code for door type indicators
  if (variant.product_code.includes('-DD-') || variant.name.toLowerCase().includes('double door')) {
    return 'Double-Door';
  } else if (variant.product_code.includes('-TD-') || variant.name.toLowerCase().includes('triple door')) {
    return 'Triple-Door';
  }
  
  // Check if it's a drawer-only unit
  if (variant.product_code.includes('DWR') || variant.name.toLowerCase().includes('drawer')) {
    return 'Drawer-Only';
  }
  
  // Default to Single-Door
  return 'Single-Door';
};

// Custom sort function for door types - Single-Door first
const sortDoorTypes = (doorTypes: string[]): string[] => {
  return doorTypes.sort((a, b) => {
    if (a === 'Single-Door') return -1;
    if (b === 'Single-Door') return 1;
    if (a === 'Double-Door') return -1;
    if (b === 'Double-Door') return 1;
    if (a === 'Triple-Door') return -1;
    if (b === 'Triple-Door') return 1;
    return a.localeCompare(b);
  });
};

// Custom sort function for dimensions - sort by width (first number)
const sortDimensions = (dimensions: string[]): string[] => {
  return dimensions.sort((a, b) => {
    const aWidth = parseInt(a.split('×')[0].trim());
    const bWidth = parseInt(b.split('×')[0].trim());
    return aWidth - bWidth;
  });
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

  // Get available options with proper filtering
  const options = useMemo(() => {
    const doorTypes = new Set<string>();
    const dimensions = new Set<string>();
    const orientations = new Set<string>();
    const drawerCounts = new Set<number>();
    const finishes = new Set<string>();

    variants.forEach(variant => {
      const doorType = getDoorTypeFromVariant(variant);
      
      // Apply progressive filtering
      const matchesDoorType = !selectedDoorType || doorType === selectedDoorType;
      const matchesDimensions = !selectedDimensions || normalizeDimensions(variant.dimensions) === selectedDimensions;
      const matchesOrientation = !selectedOrientation || variant.orientation === selectedOrientation;
      const matchesDrawerCount = !selectedDrawerCount || (variant.drawer_count?.toString() === selectedDrawerCount);
      const matchesFinish = !selectedFinish || variant.finish_type === selectedFinish;

      // For door types, show all available
      if (!selectedDoorType) {
        doorTypes.add(doorType);
      }
      
      // For dimensions, only show those available for selected door type
      if (matchesDoorType && !selectedDimensions) {
        dimensions.add(normalizeDimensions(variant.dimensions));
      }
      
      // For other options, filter based on previous selections
      if (matchesDoorType && matchesDimensions) {
        if (variant.orientation && variant.orientation !== 'None') {
          orientations.add(variant.orientation);
        }
        if (variant.drawer_count) {
          drawerCounts.add(variant.drawer_count);
        }
        finishes.add(variant.finish_type);
      }
    });

    return {
      doorTypes: sortDoorTypes(Array.from(doorTypes)),
      dimensions: sortDimensions(Array.from(dimensions)),
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
      const normalizedDimensions = normalizeDimensions(variant.dimensions);
      
      const matchesDoorType = doorType === selectedDoorType;
      const matchesDimensions = normalizedDimensions === selectedDimensions;
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {options.doorTypes.map(doorType => (
              <Button
                key={doorType}
                variant={selectedDoorType === doorType ? "default" : "outline"}
                onClick={() => handleDoorTypeSelect(doorType)}
                className="h-auto py-3 px-4"
              >
                <div className="text-center">
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
              <SelectContent>
                {options.dimensions.map(dimension => (
                  <SelectItem key={dimension} value={dimension}>
                    {dimension}
                  </SelectItem>
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
                  <div className="text-center">
                    <div className="font-medium">{orientation}</div>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {options.drawerCounts.map(count => (
                <Button
                  key={count}
                  variant={selectedDrawerCount === count.toString() ? "default" : "outline"}
                  onClick={() => setSelectedDrawerCount(count.toString())}
                  className="h-auto py-3 px-4"
                >
                  <div className="text-center">
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
            <CardTitle className="text-lg">Step 5: Select Finish</CardTitle>
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
                  <div className="text-center">
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
                <Button onClick={handleVariantSelect} size="lg">
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
