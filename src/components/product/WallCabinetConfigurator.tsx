
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Package, Ruler, DoorClosed, RotateCcw, Palette } from 'lucide-react';

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
}

// Map database orientation values to display values
const mapOrientation = (orientation: string): string => {
  switch (orientation) {
    case 'Left-Handed':
      return 'LH';
    case 'Right-Handed':
      return 'RH';
    case 'None':
    case '':
    case null:
    case undefined:
      return 'None';
    default:
      return orientation;
  }
};

// Extract dimension width from strings like "450x330x750mm"
const extractDimensionWidth = (dimensions: string): number => {
  if (!dimensions) return 0;
  const match = dimensions.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
};

const WallCabinetConfigurator: React.FC<WallCabinetConfiguratorProps> = ({
  variants,
  onVariantSelect,
  selectedVariant
}) => {
  const [selectedFinish, setSelectedFinish] = useState<string>('');
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [selectedDoorType, setSelectedDoorType] = useState<string>('');
  const [selectedOrientation, setSelectedOrientation] = useState<string>('');

  // Debug logging
  React.useEffect(() => {
    console.log('🔧 WallCabinetConfigurator received variants:', variants);
    console.log('📊 Variant analysis:');
    console.log('- Total variants:', variants.length);
    console.log('- Glass variants:', variants.filter(v => v.door_type === 'Glass').length);
    console.log('- Solid variants:', variants.filter(v => v.door_type === 'Solid').length);
    console.log('- Unique door types:', [...new Set(variants.map(v => v.door_type))]);
    console.log('- Unique dimensions:', [...new Set(variants.map(v => v.dimensions))]);
    console.log('- Unique finishes:', [...new Set(variants.map(v => v.finish_type))]);
    console.log('- Unique orientations:', [...new Set(variants.map(v => v.orientation))]);
    
    // Log each variant for debugging
    variants.forEach((variant, index) => {
      console.log(`Variant ${index + 1}:`, {
        id: variant.id,
        dimensions: variant.dimensions,
        door_type: variant.door_type,
        finish_type: variant.finish_type,
        orientation: variant.orientation,
        product_code: variant.product_code
      });
    });
  }, [variants]);

  // Extract unique options from variants
  const options = useMemo(() => {
    const finishes = new Set<string>();
    const dimensions = new Set<string>();
    const doorTypes = new Set<string>();
    const orientations = new Set<string>();

    variants.forEach(variant => {
      finishes.add(variant.finish_type);
      dimensions.add(variant.dimensions);
      if (variant.door_type) {
        doorTypes.add(variant.door_type);
      }
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

  // Filter available options based on current selections
  const getAvailableOptions = (type: 'dimension' | 'doorType' | 'orientation') => {
    let filtered = variants;

    if (type === 'dimension') {
      filtered = variants.filter(variant => {
        const matchesFinish = !selectedFinish || variant.finish_type === selectedFinish;
        return matchesFinish;
      });
    } else if (type === 'doorType') {
      filtered = variants.filter(variant => {
        const matchesFinish = !selectedFinish || variant.finish_type === selectedFinish;
        const matchesDimension = !selectedDimension || variant.dimensions === selectedDimension;
        return matchesFinish && matchesDimension;
      });
    } else if (type === 'orientation') {
      filtered = variants.filter(variant => {
        const matchesFinish = !selectedFinish || variant.finish_type === selectedFinish;
        const matchesDimension = !selectedDimension || variant.dimensions === selectedDimension;
        const matchesDoorType = !selectedDoorType || variant.door_type === selectedDoorType;
        return matchesFinish && matchesDimension && matchesDoorType;
      });
    }

    console.log(`🔍 Filtering ${type} with:`, {
      selectedFinish,
      selectedDimension,
      selectedDoorType,
      selectedOrientation,
      filteredCount: filtered.length
    });

    const availableSet = new Set<string>();
    filtered.forEach(variant => {
      if (type === 'dimension') {
        availableSet.add(variant.dimensions);
      } else if (type === 'doorType') {
        if (variant.door_type) {
          availableSet.add(variant.door_type);
        }
      } else if (type === 'orientation') {
        const mappedOrientation = mapOrientation(variant.orientation);
        if (mappedOrientation && mappedOrientation !== 'None') {
          availableSet.add(mappedOrientation);
        }
      }
    });

    const result = Array.from(availableSet).sort();
    console.log(`✅ Available ${type}:`, result);
    return result;
  };

  // Find matching variant based on current selections
  const getCurrentVariant = () => {
    if (!selectedFinish || !selectedDimension || !selectedDoorType) {
      console.log('⚠️ Missing required selections:', { selectedFinish, selectedDimension, selectedDoorType });
      return null;
    }

    const dimensionWidth = extractDimensionWidth(selectedDimension);
    console.log('🔍 Looking for variant with:', {
      selectedFinish,
      selectedDimension,
      selectedDoorType,
      selectedOrientation,
      dimensionWidth
    });

    const matchingVariant = variants.find(variant => {
      const matchesFinish = variant.finish_type === selectedFinish;
      const matchesDimension = variant.dimensions === selectedDimension;
      const matchesDoorType = variant.door_type === selectedDoorType;
      const mappedOrientation = mapOrientation(variant.orientation);
      
      console.log('🔍 Checking variant:', {
        variant: variant.product_code,
        matchesFinish,
        matchesDimension,
        matchesDoorType,
        mappedOrientation,
        variantOrientation: variant.orientation
      });

      // For larger dimensions (750-1000mm), match variants with no orientation
      if (dimensionWidth >= 750) {
        const matches = matchesFinish && matchesDimension && matchesDoorType && mappedOrientation === 'None';
        console.log('🔍 Large dimension match:', matches);
        return matches;
      } else {
        // For smaller dimensions (450-600mm), orientation is required
        if (selectedOrientation) {
          const matches = matchesFinish && matchesDimension && matchesDoorType && mappedOrientation === selectedOrientation;
          console.log('🔍 Small dimension with orientation match:', matches);
          return matches;
        } else {
          console.log('🔍 Small dimension without orientation - no match');
          return false;
        }
      }
    });

    console.log('🎯 Found matching variant:', matchingVariant);
    return matchingVariant || null;
  };

  // Check if orientation selection is needed
  const shouldShowOrientation = () => {
    if (!selectedFinish || !selectedDimension || !selectedDoorType) {
      console.log('⚠️ Not showing orientation - missing selections');
      return false;
    }
    
    const dimensionWidth = extractDimensionWidth(selectedDimension);
    console.log('🔍 Checking if orientation needed for dimension:', dimensionWidth);
    
    if (dimensionWidth >= 750) {
      console.log('✅ Large dimension - no orientation needed');
      return false;
    }
    
    const availableOrientations = getAvailableOptions('orientation');
    const shouldShow = availableOrientations.length > 0;
    console.log('🔍 Should show orientation:', shouldShow, 'Available:', availableOrientations);
    return shouldShow;
  };

  // Handle selection changes
  const handleFinishChange = (finish: string) => {
    console.log('🎯 Finish changed to:', finish);
    setSelectedFinish(finish);
    
    // Check if current dimension is still available
    const availableDimensions = getAvailableOptions('dimension');
    if (selectedDimension && !availableDimensions.includes(selectedDimension)) {
      console.log('⚠️ Clearing dimension - not available with new finish');
      setSelectedDimension('');
      setSelectedDoorType('');
      setSelectedOrientation('');
    }
  };

  const handleDimensionChange = (dimension: string) => {
    console.log('🎯 Dimension changed to:', dimension);
    setSelectedDimension(dimension);
    
    // Check if current door type is still available
    const availableDoorTypes = getAvailableOptions('doorType');
    if (selectedDoorType && !availableDoorTypes.includes(selectedDoorType)) {
      console.log('⚠️ Clearing door type - not available with new dimension');
      setSelectedDoorType('');
    }
    
    // Always clear orientation when dimension changes
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
  React.useEffect(() => {
    const variant = getCurrentVariant();
    if (variant) {
      console.log('🎯 Auto-selecting variant:', variant.product_code);
      onVariantSelect(variant);
    }
  }, [selectedFinish, selectedDimension, selectedDoorType, selectedOrientation]);

  const currentVariant = getCurrentVariant();
  const needsOrientation = shouldShowOrientation();
  const canProceed = currentVariant && (!needsOrientation || selectedOrientation);

  console.log('🎯 Current state:', {
    currentVariant: currentVariant?.product_code,
    needsOrientation,
    canProceed,
    selectedFinish,
    selectedDimension,
    selectedDoorType,
    selectedOrientation
  });

  return (
    <div className="space-y-6">
      {/* Finish Selection */}
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

      {/* Configuration Summary */}
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

      {/* Dimension Selection */}
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

      {/* Door Type Selection */}
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

      {/* Orientation Selection - Only show if needed */}
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

      {/* Selection Status */}
      {!canProceed && selectedFinish && (
        <div className="text-sm text-muted-foreground">
          {!selectedDimension && "Please select dimensions to continue."}
          {selectedDimension && !selectedDoorType && "Please select door type to continue."}
          {selectedDimension && selectedDoorType && needsOrientation && !selectedOrientation && "Please select orientation to continue."}
        </div>
      )}
    </div>
  );
};

export default WallCabinetConfigurator;
