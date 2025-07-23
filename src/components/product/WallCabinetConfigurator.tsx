
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Ruler, DoorClosed, RotateCcw, Palette, AlertTriangle } from 'lucide-react';

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
  onVariantSelect: (variant: WallCabinetVariant) => void;
  selectedVariant?: WallCabinetVariant;
  isLoading?: boolean;
}

// Fixed orientation mapping
const mapOrientation = (orientation: string): string => {
  if (!orientation) return 'None';
  
  const orientationMap: { [key: string]: string } = {
    'Left-Handed': 'LH',
    'Right-Handed': 'RH',
    'LH': 'LH',
    'RH': 'RH',
    'None': 'None',
    '': 'None',
    'null': 'None',
    'undefined': 'None'
  };
  
  return orientationMap[orientation] || 'None';
};

// Enhanced dimension parsing
const extractDimensionWidth = (dimensions: string): number => {
  if (!dimensions) return 0;
  
  // Handle formats like "450x330x750mm", "450×330×750mm", "450 x 330 x 750 mm"
  const cleanDimensions = dimensions.replace(/[^\d×x]/g, '');
  const match = cleanDimensions.match(/(\d+)/);
  
  if (!match) return 0;
  
  return parseInt(match[1]);
};

const WallCabinetConfigurator: React.FC<WallCabinetConfiguratorProps> = ({
  variants,
  onVariantSelect,
  selectedVariant,
  isLoading = false
}) => {
  const [selectedFinish, setSelectedFinish] = useState<string>('PC');
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [selectedDoorType, setSelectedDoorType] = useState<string>('');
  const [selectedOrientation, setSelectedOrientation] = useState<string>('');

  // Enhanced debug logging
  useEffect(() => {
    console.log('🔧 WallCabinetConfigurator received variants:', variants.length);
    
    if (variants.length === 0) {
      console.warn('⚠️ No variants provided to configurator');
      return;
    }

    // Analyze variants by door type
    const glassVariants = variants.filter(v => v.door_type === 'Glass');
    const solidVariants = variants.filter(v => v.door_type === 'Solid');
    
    console.log('📊 Variant analysis:');
    console.log('- Glass variants:', glassVariants.length);
    console.log('- Solid variants:', solidVariants.length);
    console.log('- Glass orientations:', [...new Set(glassVariants.map(v => mapOrientation(v.orientation)))]);
    console.log('- Solid orientations:', [...new Set(solidVariants.map(v => mapOrientation(v.orientation)))]);
    
    // Check small dimensions specifically
    const smallDimensions = ['450x330x750mm', '500x330x750mm', '550x330x750mm', '600x330x750mm'];
    smallDimensions.forEach(dim => {
      const glassForDim = glassVariants.filter(v => v.dimensions === dim);
      const solidForDim = solidVariants.filter(v => v.dimensions === dim);
      console.log(`🔍 ${dim}: Glass=${glassForDim.length}, Solid=${solidForDim.length}`);
      
      if (glassForDim.length > 0) {
        console.log(`  Glass orientations: ${glassForDim.map(v => mapOrientation(v.orientation)).join(', ')}`);
      }
      if (solidForDim.length > 0) {
        console.log(`  Solid orientations: ${solidForDim.map(v => mapOrientation(v.orientation)).join(', ')}`);
      }
    });
  }, [variants]);

  // Extract unique options with proper validation
  const options = useMemo(() => {
    if (variants.length === 0) {
      return {
        finishes: [],
        dimensions: [],
        doorTypes: [],
        orientations: []
      };
    }

    const finishes = new Set<string>();
    const dimensions = new Set<string>();
    const doorTypes = new Set<string>();
    const orientations = new Set<string>();

    variants.forEach(variant => {
      if (variant.finish_type) finishes.add(variant.finish_type);
      if (variant.dimensions) dimensions.add(variant.dimensions);
      if (variant.door_type) doorTypes.add(variant.door_type);
      
      const mappedOrientation = mapOrientation(variant.orientation);
      if (mappedOrientation && mappedOrientation !== 'None') {
        orientations.add(mappedOrientation);
      }
    });

    const result = {
      finishes: Array.from(finishes).sort(),
      dimensions: Array.from(dimensions).sort(),
      doorTypes: Array.from(doorTypes).sort(),
      orientations: Array.from(orientations).sort()
    };

    console.log('🎯 Extracted options:', result);
    return result;
  }, [variants]);

  // Enhanced filtering with proper validation
  const getAvailableOptions = (type: 'dimension' | 'doorType' | 'orientation') => {
    if (variants.length === 0) return [];

    let filtered = variants;

    // Apply filters progressively
    if (selectedFinish) {
      filtered = filtered.filter(variant => variant.finish_type === selectedFinish);
    }
    
    if (type !== 'dimension' && selectedDimension) {
      filtered = filtered.filter(variant => variant.dimensions === selectedDimension);
    }
    
    if (type === 'orientation' && selectedDoorType) {
      filtered = filtered.filter(variant => variant.door_type === selectedDoorType);
    }

    const availableSet = new Set<string>();
    filtered.forEach(variant => {
      if (type === 'dimension' && variant.dimensions) {
        availableSet.add(variant.dimensions);
      } else if (type === 'doorType' && variant.door_type) {
        availableSet.add(variant.door_type);
      } else if (type === 'orientation') {
        const mappedOrientation = mapOrientation(variant.orientation);
        if (mappedOrientation && mappedOrientation !== 'None') {
          availableSet.add(mappedOrientation);
        }
      }
    });

    return Array.from(availableSet).sort();
  };

  // Fixed variant matching
  const getCurrentVariant = () => {
    if (!selectedFinish || !selectedDimension || !selectedDoorType) {
      return null;
    }

    const dimensionWidth = extractDimensionWidth(selectedDimension);
    
    const matchingVariants = variants.filter(variant => {
      const matchesFinish = variant.finish_type === selectedFinish;
      const matchesDimension = variant.dimensions === selectedDimension;
      const matchesDoorType = variant.door_type === selectedDoorType;
      const mappedOrientation = mapOrientation(variant.orientation);
      
      // For smaller dimensions (450-600mm), orientation is required
      if (dimensionWidth < 750) {
        if (!selectedOrientation) return false;
        return matchesFinish && matchesDimension && matchesDoorType && mappedOrientation === selectedOrientation;
      } else {
        // For larger dimensions (750mm+), no orientation required
        return matchesFinish && matchesDimension && matchesDoorType && mappedOrientation === 'None';
      }
    });

    console.log('🎯 Found matching variants:', matchingVariants.length);
    return matchingVariants.length > 0 ? matchingVariants[0] : null;
  };

  // Enhanced orientation requirement check
  const shouldShowOrientation = () => {
    if (!selectedFinish || !selectedDimension || !selectedDoorType) return false;
    
    const dimensionWidth = extractDimensionWidth(selectedDimension);
    if (dimensionWidth >= 750) return false;
    
    const availableOrientations = getAvailableOptions('orientation');
    return availableOrientations.length > 0;
  };

  // Enhanced selection handlers
  const handleFinishChange = (finish: string) => {
    console.log('🎯 Finish changed to:', finish);
    setSelectedFinish(finish);
    setSelectedDimension('');
    setSelectedDoorType('');
    setSelectedOrientation('');
  };

  const handleDimensionChange = (dimension: string) => {
    console.log('🎯 Dimension changed to:', dimension);
    setSelectedDimension(dimension);
    setSelectedDoorType('');
    setSelectedOrientation('');
  };

  const handleDoorTypeChange = (doorType: string) => {
    console.log('🎯 Door type changed to:', doorType);
    setSelectedDoorType(doorType);
    setSelectedOrientation('');
  };

  const handleOrientationChange = (orientation: string) => {
    console.log('🎯 Orientation changed to:', orientation);
    setSelectedOrientation(orientation);
  };

  // Auto-select variant when all required options are selected
  useEffect(() => {
    const variant = getCurrentVariant();
    if (variant) {
      console.log('🎯 Auto-selecting variant:', variant.product_code);
      onVariantSelect(variant);
    }
  }, [selectedFinish, selectedDimension, selectedDoorType, selectedOrientation]);

  // Enhanced state calculations
  const currentVariant = getCurrentVariant();
  const needsOrientation = shouldShowOrientation();
  const canProceed = currentVariant && (!needsOrientation || selectedOrientation);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Handle empty variants
  if (variants.length === 0) {
    return (
      <div className="flex items-center gap-2 p-4 bg-muted rounded-md">
        <AlertTriangle className="w-5 h-5 text-muted-foreground" />
        <span className="text-muted-foreground">No variants available for configuration</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Finish selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Finish
        </h3>
        <div className="flex gap-2">
          {options.finishes.map((finish) => (
            <Button
              key={finish}
              variant={selectedFinish === finish ? "default" : "outline"}
              size="sm"
              onClick={() => handleFinishChange(finish)}
              className="transition-all duration-200"
            >
              {finish === 'PC' ? 'Powder Coat' : finish === 'SS' ? 'Stainless Steel' : finish}
            </Button>
          ))}
        </div>
      </div>

      {/* Configuration summary */}
      {selectedFinish && (
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Finish:</span>
              <Badge variant="secondary">
                {selectedFinish === 'PC' ? 'Powder Coat' : selectedFinish === 'SS' ? 'Stainless Steel' : selectedFinish}
              </Badge>
            </div>
            {selectedDimension && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dimensions:</span>
                <Badge variant="secondary">{selectedDimension}</Badge>
              </div>
            )}
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
            {currentVariant && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Product Code:</span>
                <Badge variant="default">{currentVariant.product_code}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Dimension selection */}
      {selectedFinish && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Ruler className="w-5 h-5" />
            Dimensions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {options.dimensions.map((dimension) => {
              const isAvailable = getAvailableOptions('dimension').includes(dimension);
              return (
                <Button
                  key={dimension}
                  variant={selectedDimension === dimension ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDimensionChange(dimension)}
                  disabled={!isAvailable}
                  className="transition-all duration-200"
                >
                  {dimension}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Door type selection */}
      {selectedFinish && selectedDimension && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <DoorClosed className="w-5 h-5" />
            Door Type
          </h3>
          <div className="flex gap-2">
            {options.doorTypes.map((doorType) => {
              const isAvailable = getAvailableOptions('doorType').includes(doorType);
              return (
                <Button
                  key={doorType}
                  variant={selectedDoorType === doorType ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDoorTypeChange(doorType)}
                  disabled={!isAvailable}
                  className="transition-all duration-200"
                >
                  {doorType}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Orientation selection */}
      {needsOrientation && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Orientation
          </h3>
          <div className="flex gap-2">
            {getAvailableOptions('orientation').map((orientation) => (
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

      {/* Selection status */}
      {!canProceed && selectedFinish && (
        <div className="text-sm text-muted-foreground">
          {!selectedDimension && "Please select dimensions to continue."}
          {selectedDimension && !selectedDoorType && "Please select door type to continue."}
          {selectedDimension && selectedDoorType && needsOrientation && !selectedOrientation && "Please select orientation to continue."}
        </div>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          <p>Debug: Total variants: {variants.length}</p>
          <p>Glass: {variants.filter(v => v.door_type === 'Glass').length}</p>
          <p>Solid: {variants.filter(v => v.door_type === 'Solid').length}</p>
          <p>Available orientations: {getAvailableOptions('orientation').join(', ')}</p>
        </div>
      )}
    </div>
  );
};

export default WallCabinetConfigurator;
