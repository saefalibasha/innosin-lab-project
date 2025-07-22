
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, Package, Ruler, DoorOpen, Palette } from 'lucide-react';

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

  const currentVariant = variants.find(v => v.id === selectedVariantId);
  const isConfigurationComplete = selectedDimension && selectedDoorType && selectedFinish;

  return (
    <div className="space-y-6">
      {/* Step 1: Dimensions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ruler className="w-5 h-5 text-primary" />
            Step 1: Select Dimensions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {dimensions.map((dimension) => (
              <Button
                key={dimension}
                variant={selectedDimension === dimension ? "default" : "outline"}
                size="sm"
                onClick={() => handleDimensionSelect(dimension)}
                className="text-xs h-auto py-3 flex flex-col items-center gap-1"
              >
                {selectedDimension === dimension && <Check className="w-3 h-3" />}
                <span className="font-medium">{dimension.split('×')[0]}×{dimension.split('×')[1]}</span>
                <span className="text-muted-foreground">mm</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Door Type */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DoorOpen className="w-5 h-5 text-primary" />
            Step 2: Select Door Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {doorTypes.map((doorType) => (
              <Button
                key={doorType}
                variant={selectedDoorType === doorType ? "default" : "outline"}
                size="lg"
                onClick={() => handleDoorTypeSelect(doorType)}
                className="h-auto py-4 flex flex-col items-center gap-2"
                disabled={!selectedDimension}
              >
                {selectedDoorType === doorType && <Check className="w-4 h-4" />}
                <span className="font-medium">{doorType} Door</span>
                <span className="text-xs text-muted-foreground">
                  {doorType === 'Glass' ? 'Transparent visibility' : 'Secure solid door'}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Finish */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="w-5 h-5 text-primary" />
            Step 3: Select Finish
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={selectedFinish === 'PC' ? "default" : "outline"}
              size="lg"
              onClick={() => handleFinishSelect('PC')}
              className="h-auto py-4 flex flex-col items-center gap-2"
              disabled={!selectedDimension || !selectedDoorType}
            >
              {selectedFinish === 'PC' && <Check className="w-4 h-4" />}
              <span className="font-medium">Powder Coat</span>
              <span className="text-xs text-muted-foreground">Standard finish</span>
            </Button>
            <Button
              variant={selectedFinish === 'SS' ? "default" : "outline"}
              size="lg"
              onClick={() => handleFinishSelect('SS')}
              className="h-auto py-4 flex flex-col items-center gap-2"
              disabled={!selectedDimension || !selectedDoorType}
            >
              {selectedFinish === 'SS' && <Check className="w-4 h-4" />}
              <span className="font-medium">Stainless Steel</span>
              <span className="text-xs text-muted-foreground">Premium finish</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      {isConfigurationComplete && currentVariant && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="w-5 h-5 text-primary" />
              Configuration Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Product Code:</span>
                  <Badge variant="outline" className="font-mono">
                    {currentVariant.product_code}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Dimensions:</span>
                  <span className="text-sm">{selectedDimension}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Door Type:</span>
                  <span className="text-sm">{selectedDoorType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Finish:</span>
                  <span className="text-sm">
                    {selectedFinish === 'PC' ? 'Powder Coat' : 'Stainless Steel'}
                  </span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Product Name</h4>
              <p className="text-sm text-muted-foreground">{currentVariant.name}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TallCabinetConfigurator;
