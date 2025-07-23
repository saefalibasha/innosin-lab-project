
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

const WallCabinetConfigurator: React.FC<WallCabinetConfiguratorProps> = ({
  variants,
  onVariantSelect,
  selectedVariant
}) => {
  const [selectedFinish, setSelectedFinish] = useState<string>('');
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [selectedDoorType, setSelectedDoorType] = useState<string>('');
  const [selectedOrientation, setSelectedOrientation] = useState<string>('');

  // Extract unique options from variants
  const options = useMemo(() => {
    const finishes = new Set<string>();
    const dimensions = new Set<string>();
    const doorTypes = new Set<string>();
    const orientations = new Set<string>();

    variants.forEach(variant => {
      finishes.add(variant.finish_type);
      dimensions.add(variant.dimensions);
      // Extract door type from product code
      if (variant.product_code.includes('WCG')) {
        doorTypes.add('Glass');
      } else if (variant.product_code.includes('WCS')) {
        doorTypes.add('Solid');
      }
      if (variant.orientation && variant.orientation !== 'None') {
        orientations.add(variant.orientation);
      }
    });

    return {
      finishes: Array.from(finishes).sort(),
      dimensions: Array.from(dimensions).sort(),
      doorTypes: Array.from(doorTypes).sort(),
      orientations: Array.from(orientations).sort()
    };
  }, [variants]);

  // Filter available options based on current selections
  const getAvailableOptions = (type: 'dimension' | 'doorType' | 'orientation') => {
    const filtered = variants.filter(variant => {
      const matchesFinish = !selectedFinish || variant.finish_type === selectedFinish;
      const matchesDimension = !selectedDimension || variant.dimensions === selectedDimension;
      const matchesDoorType = !selectedDoorType || 
        (selectedDoorType === 'Glass' && variant.product_code.includes('WCG')) ||
        (selectedDoorType === 'Solid' && variant.product_code.includes('WCS'));
      const matchesOrientation = !selectedOrientation || variant.orientation === selectedOrientation;

      return matchesFinish && matchesDimension && matchesDoorType && matchesOrientation;
    });

    const availableSet = new Set<string>();
    filtered.forEach(variant => {
      if (type === 'dimension') {
        availableSet.add(variant.dimensions);
      } else if (type === 'doorType') {
        if (variant.product_code.includes('WCG')) {
          availableSet.add('Glass');
        } else if (variant.product_code.includes('WCS')) {
          availableSet.add('Solid');
        }
      } else if (type === 'orientation') {
        if (variant.orientation && variant.orientation !== 'None') {
          availableSet.add(variant.orientation);
        }
      }
    });

    return Array.from(availableSet).sort();
  };

  // Find matching variant based on current selections
  const getCurrentVariant = () => {
    if (!selectedFinish || !selectedDimension || !selectedDoorType) return null;

    return variants.find(variant => {
      const matchesFinish = variant.finish_type === selectedFinish;
      const matchesDimension = variant.dimensions === selectedDimension;
      const matchesDoorType = 
        (selectedDoorType === 'Glass' && variant.product_code.includes('WCG')) ||
        (selectedDoorType === 'Solid' && variant.product_code.includes('WCS'));
      const matchesOrientation = !selectedOrientation || variant.orientation === selectedOrientation;

      return matchesFinish && matchesDimension && matchesDoorType && matchesOrientation;
    });
  };

  // Check if orientation selection is available and should be shown
  const shouldShowOrientation = () => {
    if (!selectedFinish || !selectedDimension || !selectedDoorType) return false;
    
    const availableOrientations = getAvailableOptions('orientation');
    return availableOrientations.length > 0;
  };

  // Handle selection changes
  const handleFinishChange = (finish: string) => {
    setSelectedFinish(finish);
    // Clear dependent selections that might not be available
    const availableDimensions = getAvailableOptions('dimension');
    if (selectedDimension && !availableDimensions.includes(selectedDimension)) {
      setSelectedDimension('');
      setSelectedDoorType('');
      setSelectedOrientation('');
    }
  };

  const handleDimensionChange = (dimension: string) => {
    setSelectedDimension(dimension);
    // Clear dependent selections that might not be available
    const availableDoorTypes = getAvailableOptions('doorType');
    if (selectedDoorType && !availableDoorTypes.includes(selectedDoorType)) {
      setSelectedDoorType('');
      setSelectedOrientation('');
    }
  };

  const handleDoorTypeChange = (doorType: string) => {
    setSelectedDoorType(doorType);
    // Clear orientation if not available with new door type
    const availableOrientations = getAvailableOptions('orientation');
    if (selectedOrientation && !availableOrientations.includes(selectedOrientation)) {
      setSelectedOrientation('');
    }
  };

  const handleOrientationChange = (orientation: string) => {
    setSelectedOrientation(orientation);
  };

  // Auto-select variant when all required options are selected
  React.useEffect(() => {
    const variant = getCurrentVariant();
    if (variant && (!shouldShowOrientation() || selectedOrientation)) {
      onVariantSelect(variant);
    }
  }, [selectedFinish, selectedDimension, selectedDoorType, selectedOrientation]);

  const currentVariant = getCurrentVariant();
  const canProceed = currentVariant && (!shouldShowOrientation() || selectedOrientation);

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

      {/* Orientation Selection */}
      {shouldShowOrientation() && (
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
          {selectedDimension && selectedDoorType && shouldShowOrientation() && !selectedOrientation && "Please select orientation to continue."}
        </div>
      )}
    </div>
  );
};

export default WallCabinetConfigurator;
