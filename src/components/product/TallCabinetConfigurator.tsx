
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Ruler, DoorOpen, Palette } from 'lucide-react';

interface TallCabinetConfiguratorProps {
  variants: any[];
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  selectedFinish: string;
  onFinishChange: (finish: string) => void;
}

const TallCabinetConfigurator: React.FC<TallCabinetConfiguratorProps> = ({
  variants,
  selectedVariantId,
  onVariantChange,
  selectedFinish,
  onFinishChange
}) => {
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [selectedDoorType, setSelectedDoorType] = useState<string>('');

  // Extract unique options
  const dimensions = useMemo(() => {
    return [...new Set(variants.map(v => v.dimensions).filter(Boolean))].sort();
  }, [variants]);

  const doorTypes = useMemo(() => {
    return [...new Set(variants.map(v => v.door_type).filter(Boolean))].sort();
  }, [variants]);

  // Find matching variant based on current selections
  const findMatchingVariant = (dimension: string, doorType: string, finish: string) => {
    return variants.find(v => 
      v.dimensions === dimension && 
      v.door_type === doorType && 
      v.finish_type === finish
    );
  };

  // Handle dimension selection
  const handleDimensionSelect = (dimension: string) => {
    setSelectedDimension(dimension);
    
    // Find matching variant with current door type and finish
    const matchingVariant = findMatchingVariant(dimension, selectedDoorType, selectedFinish);
    if (matchingVariant) {
      onVariantChange(matchingVariant.id);
    } else {
      // Find any variant with this dimension and update door type
      const anyMatchingVariant = variants.find(v => v.dimensions === dimension);
      if (anyMatchingVariant) {
        setSelectedDoorType(anyMatchingVariant.door_type || '');
        onVariantChange(anyMatchingVariant.id);
      }
    }
  };

  // Handle door type selection
  const handleDoorTypeSelect = (doorType: string) => {
    setSelectedDoorType(doorType);
    
    // Find matching variant with current dimension and finish
    const matchingVariant = findMatchingVariant(selectedDimension, doorType, selectedFinish);
    if (matchingVariant) {
      onVariantChange(matchingVariant.id);
    }
  };

  // Handle finish selection
  const handleFinishSelect = (finish: string) => {
    onFinishChange(finish);
    
    // Find matching variant with current dimension and door type
    const matchingVariant = findMatchingVariant(selectedDimension, selectedDoorType, finish);
    if (matchingVariant) {
      onVariantChange(matchingVariant.id);
    }
  };

  // Initialize selections based on current variant
  React.useEffect(() => {
    const currentVariant = variants.find(v => v.id === selectedVariantId);
    if (currentVariant) {
      setSelectedDimension(currentVariant.dimensions || '');
      setSelectedDoorType(currentVariant.door_type || '');
    }
  }, [selectedVariantId, variants]);

  return (
    <div className="space-y-3">
      {/* Step 1: Dimensions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Ruler className="w-4 h-4 text-primary" />
            Step 1: Select Dimensions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-xs">
            <Select value={selectedDimension} onValueChange={handleDimensionSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose cabinet dimensions" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {dimensions.map((dimension) => (
                  <SelectItem key={dimension} value={dimension}>
                    <div className="flex items-center gap-2">
                      {selectedDimension === dimension && <Check className="w-3 h-3 text-primary" />}
                      <span>{dimension}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Door Type */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <DoorOpen className="w-4 h-4 text-primary" />
            Step 2: Select Door Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {doorTypes.map((doorType) => (
              <Button
                key={doorType}
                variant={selectedDoorType === doorType ? "default" : "outline"}
                size="sm"
                onClick={() => handleDoorTypeSelect(doorType)}
                className="h-auto py-1.5 flex flex-col items-center gap-1 text-xs"
                disabled={!selectedDimension}
              >
                {selectedDoorType === doorType && <Check className="w-3 h-3" />}
                <span className="font-medium">{doorType} Door</span>
                <span className="text-xs text-muted-foreground">
                  {doorType === 'Glass' ? 'Transparent' : 'Solid'}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Finish */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Palette className="w-4 h-4 text-primary" />
            Step 3: Select Finish
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedFinish === 'PC' ? "default" : "outline"}
              size="sm"
              onClick={() => handleFinishSelect('PC')}
              className="h-auto py-1.5 flex flex-col items-center gap-1 text-xs"
              disabled={!selectedDimension || !selectedDoorType}
            >
              {selectedFinish === 'PC' && <Check className="w-3 h-3" />}
              <span className="font-medium">Powder Coat</span>
              <span className="text-xs text-muted-foreground">Standard</span>
            </Button>
            <Button
              variant={selectedFinish === 'SS' ? "default" : "outline"}
              size="sm"
              onClick={() => handleFinishSelect('SS')}
              className="h-auto py-1.5 flex flex-col items-center gap-1 text-xs"
              disabled={!selectedDimension || !selectedDoorType}
            >
              {selectedFinish === 'SS' && <Check className="w-3 h-3" />}
              <span className="font-medium">Stainless Steel</span>
              <span className="text-xs text-muted-foreground">Premium</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TallCabinetConfigurator;
