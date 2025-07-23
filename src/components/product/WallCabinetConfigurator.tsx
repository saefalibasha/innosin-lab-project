
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Ruler, DoorClosed, RotateCcw, AlertTriangle } from 'lucide-react';

interface WallCabinetVariant {
  id: string;
  product_code: string;
  name: string;
  dimensions: string;
  finish_type: string;
  orientation: string;
  door_type: string;
  thumbnail_path: string;
  model_path: string;
  additional_images: string[];
}

interface WallCabinetConfiguratorProps {
  variants: WallCabinetVariant[];
  onVariantSelect: (variant: WallCabinetVariant | null) => void;
  selectedVariant?: WallCabinetVariant | null;
  isLoading?: boolean;
}

const WallCabinetConfigurator: React.FC<WallCabinetConfiguratorProps> = ({
  variants,
  onVariantSelect,
  selectedVariant,
  isLoading = false
}) => {
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [selectedDoorType, setSelectedDoorType] = useState<string>('');
  const [selectedOrientation, setSelectedOrientation] = useState<string>('');

  console.log('🔧 WallCabinetConfigurator received:', { 
    variantCount: variants.length,
    selectedVariant: selectedVariant?.product_code 
  });

  // Get unique dimensions
  const availableDimensions = useMemo(() => {
    const dimensions = new Set<string>();
    variants.forEach(variant => {
      if (variant.dimensions) {
        dimensions.add(variant.dimensions);
      }
    });
    return Array.from(dimensions).sort();
  }, [variants]);

  // Get available door types for selected dimension
  const availableDoorTypes = useMemo(() => {
    if (!selectedDimension) return [];
    
    const doorTypes = new Set<string>();
    variants.forEach(variant => {
      if (variant.dimensions === selectedDimension && variant.door_type) {
        doorTypes.add(variant.door_type);
      }
    });
    return Array.from(doorTypes).sort();
  }, [variants, selectedDimension]);

  // Get available orientations for selected dimension and door type
  const availableOrientations = useMemo(() => {
    if (!selectedDimension || !selectedDoorType) return [];
    
    const orientations = new Set<string>();
    variants.forEach(variant => {
      if (variant.dimensions === selectedDimension && 
          variant.door_type === selectedDoorType &&
          variant.orientation && 
          variant.orientation !== 'None') {
        orientations.add(variant.orientation);
      }
    });
    return Array.from(orientations).sort();
  }, [variants, selectedDimension, selectedDoorType]);

  // Check if orientation is required (for smaller dimensions)
  const requiresOrientation = useMemo(() => {
    if (!selectedDimension) return false;
    
    // Extract width from dimensions (e.g., "450x330x750mm" -> 450)
    const widthMatch = selectedDimension.match(/(\d+)/);
    if (!widthMatch) return false;
    
    const width = parseInt(widthMatch[1]);
    return width < 750; // Require orientation for widths less than 750mm
  }, [selectedDimension]);

  // Find the matching variant
  const matchingVariant = useMemo(() => {
    if (!selectedDimension || !selectedDoorType) return null;
    
    return variants.find(variant => {
      const dimensionMatch = variant.dimensions === selectedDimension;
      const doorTypeMatch = variant.door_type === selectedDoorType;
      
      let orientationMatch = false;
      if (requiresOrientation) {
        orientationMatch = variant.orientation === selectedOrientation;
      } else {
        orientationMatch = variant.orientation === 'None' || !variant.orientation;
      }
      
      return dimensionMatch && doorTypeMatch && orientationMatch;
    }) || null;
  }, [variants, selectedDimension, selectedDoorType, selectedOrientation, requiresOrientation]);

  // Update parent when variant changes
  useEffect(() => {
    console.log('🎯 Matching variant changed:', matchingVariant?.product_code);
    onVariantSelect(matchingVariant);
  }, [matchingVariant, onVariantSelect]);

  // Selection handlers
  const handleDimensionChange = (dimension: string) => {
    console.log('📏 Dimension selected:', dimension);
    setSelectedDimension(dimension);
    setSelectedDoorType('');
    setSelectedOrientation('');
  };

  const handleDoorTypeChange = (doorType: string) => {
    console.log('🚪 Door type selected:', doorType);
    setSelectedDoorType(doorType);
    setSelectedOrientation('');
  };

  const handleOrientationChange = (orientation: string) => {
    console.log('🔄 Orientation selected:', orientation);
    setSelectedOrientation(orientation);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Handle empty variants
  if (variants.length === 0) {
    return (
      <div className="flex items-center gap-2 p-4 bg-muted rounded-md">
        <AlertTriangle className="w-5 h-5 text-muted-foreground" />
        <span className="text-muted-foreground">No variants available</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dimension Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Ruler className="w-5 h-5" />
          Dimensions
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {availableDimensions.map((dimension) => (
            <Button
              key={dimension}
              variant={selectedDimension === dimension ? "default" : "outline"}
              size="sm"
              onClick={() => handleDimensionChange(dimension)}
              className="transition-all duration-200"
            >
              {dimension}
            </Button>
          ))}
        </div>
      </div>

      {/* Door Type Selection */}
      {selectedDimension && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <DoorClosed className="w-5 h-5" />
            Door Type
          </h3>
          <div className="flex gap-2">
            {availableDoorTypes.map((doorType) => (
              <Button
                key={doorType}
                variant={selectedDoorType === doorType ? "default" : "outline"}
                size="sm"
                onClick={() => handleDoorTypeChange(doorType)}
                className="transition-all duration-200"
              >
                {doorType}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Orientation Selection */}
      {selectedDimension && selectedDoorType && requiresOrientation && availableOrientations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Orientation
          </h3>
          <div className="flex gap-2">
            {availableOrientations.map((orientation) => (
              <Button
                key={orientation}
                variant={selectedOrientation === orientation ? "default" : "outline"}
                size="sm"
                onClick={() => handleOrientationChange(orientation)}
                className="transition-all duration-200"
              >
                {orientation}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Current Selection Summary */}
      {selectedDimension && (
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Current Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Dimensions:</span>
              <Badge variant="secondary">{selectedDimension}</Badge>
            </div>
            {selectedDoorType && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Door Type:</span>
                <Badge variant="secondary">{selectedDoorType}</Badge>
              </div>
            )}
            {selectedOrientation && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Orientation:</span>
                <Badge variant="secondary">{selectedOrientation}</Badge>
              </div>
            )}
            {matchingVariant && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Product Code:</span>
                <Badge variant="outline">{matchingVariant.product_code}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selection Status */}
      {selectedDimension && selectedDoorType && (
        <div className="text-sm text-muted-foreground">
          {!matchingVariant && requiresOrientation && !selectedOrientation && (
            "Please select orientation to continue."
          )}
          {!matchingVariant && !requiresOrientation && (
            "No matching variant found."
          )}
          {matchingVariant && (
            <span className="text-green-600">✓ Variant selected: {matchingVariant.product_code}</span>
          )}
        </div>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded space-y-1">
          <p><strong>Debug Info:</strong></p>
          <p>Total variants: {variants.length}</p>
          <p>Available dimensions: {availableDimensions.join(', ')}</p>
          <p>Available door types: {availableDoorTypes.join(', ')}</p>
          <p>Available orientations: {availableOrientations.join(', ')}</p>
          <p>Requires orientation: {requiresOrientation ? 'Yes' : 'No'}</p>
          <p>Matching variant: {matchingVariant?.product_code || 'None'}</p>
        </div>
      )}
    </div>
  );
};

export default WallCabinetConfigurator;
