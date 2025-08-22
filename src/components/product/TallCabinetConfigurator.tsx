
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, DoorOpen, Palette, Settings } from 'lucide-react';
import { DimensionSelector } from './DimensionSelector';
import { parseDimensionString } from '@/utils/dimensionUtils';

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
  const [selectedWidth, setSelectedWidth] = useState<string>('');
  const [selectedDepth, setSelectedDepth] = useState<string>('');
  const [selectedHeight, setSelectedHeight] = useState<string>('');
  const [selectedDoorType, setSelectedDoorType] = useState<string>('');

  // Door types are still extracted here
  const doorTypes = useMemo(() => {
    const types = [...new Set(variants.map(v => v.door_type).filter(Boolean))].sort();
    console.log('Door types:', types);
    return types;
  }, [variants]);


  // Extract available finishes dynamically from variant data
  const availableFinishes = useMemo(() => {
    const finishTypes = [...new Set(variants.map(v => v.finish_type).filter(Boolean))];
    console.log('Available finish types from data:', finishTypes);
    
    const finishOptions = [];
    if (finishTypes.includes('PC')) {
      finishOptions.push({ value: 'PC', label: 'Powder Coat' });
    }
    if (finishTypes.includes('SS')) {
      finishOptions.push({ value: 'SS', label: 'Stainless Steel' });
    }
    
    return finishOptions;
  }, [variants]);

  // Find matching variant based on current selections using parseDimensionString
  const findMatchingVariant = (width: string, depth: string, height: string, doorType: string, finish: string) => {
    console.log('Finding variant for:', { width, depth, height, doorType, finish });
    
    const matchingVariant = variants.find(v => {
      if (!v.dimensions) return false;
      
      const parsed = parseDimensionString(v.dimensions);
      if (!parsed) return false;
      
      const matches = parsed.width.toString() === width && 
             parsed.depth.toString() === depth && 
             parsed.height.toString() === height && 
             v.door_type === doorType && 
             v.finish_type === finish;
             
      if (matches) {
        console.log('Found matching variant:', v);
      }
      
      return matches;
    });
    
    return matchingVariant;
  };

  // Handle width selection
  const handleWidthSelect = (width: string) => {
    console.log('Selected width:', width);
    setSelectedWidth(width);
    
    // Try to find matching variant with any complete combination
    if (selectedDepth && selectedHeight && selectedDoorType && selectedFinish) {
      const matchingVariant = findMatchingVariant(width, selectedDepth, selectedHeight, selectedDoorType, selectedFinish);
      if (matchingVariant) {
        onVariantChange(matchingVariant.id);
      }
    }
  };

  // Handle depth selection
  const handleDepthSelect = (depth: string) => {
    console.log('Selected depth:', depth);
    setSelectedDepth(depth);
    
    // Try to find matching variant with any complete combination
    if (selectedWidth && selectedHeight && selectedDoorType && selectedFinish) {
      const matchingVariant = findMatchingVariant(selectedWidth, depth, selectedHeight, selectedDoorType, selectedFinish);
      if (matchingVariant) {
        onVariantChange(matchingVariant.id);
      }
    }
  };

  // Handle height selection
  const handleHeightSelect = (height: string) => {
    console.log('Selected height:', height);
    setSelectedHeight(height);
    
    // Try to find matching variant with any complete combination
    if (selectedWidth && selectedDepth && selectedDoorType && selectedFinish) {
      const matchingVariant = findMatchingVariant(selectedWidth, selectedDepth, height, selectedDoorType, selectedFinish);
      if (matchingVariant) {
        onVariantChange(matchingVariant.id);
      }
    }
  };

  // Handle door type selection
  const handleDoorTypeSelect = (doorType: string) => {
    console.log('Selected door type:', doorType);
    setSelectedDoorType(doorType);
    
    // Try to find matching variant with any complete combination
    if (selectedWidth && selectedDepth && selectedHeight && selectedFinish) {
      const matchingVariant = findMatchingVariant(selectedWidth, selectedDepth, selectedHeight, doorType, selectedFinish);
      if (matchingVariant) {
        onVariantChange(matchingVariant.id);
      }
    }
  };

  // Handle finish selection
  const handleFinishSelect = (finish: string) => {
    console.log('Selected finish:', finish);
    onFinishChange(finish);
    
    if (selectedWidth && selectedDepth && selectedHeight && selectedDoorType) {
      const matchingVariant = findMatchingVariant(selectedWidth, selectedDepth, selectedHeight, selectedDoorType, finish);
      if (matchingVariant) {
        onVariantChange(matchingVariant.id);
      }
    }
  };

  // Initialize selections with first available options
  React.useEffect(() => {
    if (doorTypes.length > 0 && !selectedDoorType) {
      console.log('Initializing door type with first option:', doorTypes[0]);
      setSelectedDoorType(doorTypes[0]);
    }
  }, [doorTypes, selectedDoorType]);

  // Initialize selections based on current variant (override auto-selection)
  React.useEffect(() => {
    const currentVariant = variants.find(v => v.id === selectedVariantId);
    console.log('Current variant:', currentVariant);
    
    if (currentVariant && currentVariant.dimensions) {
      const parsed = parseDimensionString(currentVariant.dimensions);
      if (parsed) {
        console.log('Setting dimensions from current variant:', parsed);
        setSelectedWidth(parsed.width.toString());
        setSelectedDepth(parsed.depth.toString());
        setSelectedHeight(parsed.height.toString());
      }
      if (currentVariant.door_type) {
        console.log('Setting door type from current variant:', currentVariant.door_type);
        setSelectedDoorType(currentVariant.door_type);
      }
    }
  }, [selectedVariantId, variants]);

  const isDimensionsComplete = selectedWidth && selectedDepth && selectedHeight;
  const isConfigurationComplete = selectedWidth && selectedDepth && selectedHeight && selectedDoorType && selectedFinish;

  return (
    <div className="space-y-3">
      {/* Step 1: Dimensions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="w-4 h-4 text-primary" />
            Step 1: Select Dimensions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DimensionSelector
            variants={variants}
            selectedWidth={selectedWidth}
            selectedDepth={selectedDepth}
            selectedHeight={selectedHeight}
            onWidthChange={handleWidthSelect}
            onDepthChange={handleDepthSelect}
            onHeightChange={handleHeightSelect}
          />
        </CardContent>
      </Card>

      {/* Step 2: Door Type */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <DoorOpen className="w-4 h-4 text-primary" />
            Step 2: Select Door Type
            <span className="text-xs text-muted-foreground ml-auto">
              ({doorTypes.length} options)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {doorTypes.length === 0 ? (
              <p className="text-xs text-muted-foreground col-span-2">No door types available</p>
            ) : (
              doorTypes.map((doorType) => (
                <Button
                  key={doorType}
                  variant={selectedDoorType === doorType ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDoorTypeSelect(doorType)}
                  className="h-auto py-2 flex flex-col items-center gap-1 text-xs"
                >
                  {selectedDoorType === doorType && <Check className="w-3 h-3" />}
                  <span className="font-medium">{doorType} Door</span>
                </Button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Finish */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Palette className="w-4 h-4 text-primary" />
            Step 3: Select Finish
            <span className="text-xs text-muted-foreground ml-auto">
              ({availableFinishes.length} options)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {availableFinishes.map((finish) => (
              <Button
                key={finish.value}
                variant={selectedFinish === finish.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleFinishSelect(finish.value)}
                className="h-auto py-2 flex flex-col items-center gap-1 text-xs"
                disabled={!selectedDoorType}
              >
                {selectedFinish === finish.value && <Check className="w-3 h-3" />}
                <span className="font-medium">{finish.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary - Always visible when any selection is made */}
      {(selectedWidth || selectedDepth || selectedHeight || selectedDoorType || selectedFinish) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-primary">
              <Settings className="w-4 h-4" />
              Configuration Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions:</span>
                <span className="font-medium">
                  {selectedWidth && selectedDepth && selectedHeight 
                    ? `${selectedWidth}×${selectedDepth}×${selectedHeight}mm`
                    : 'Incomplete'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Door Type:</span>
                <span className="font-medium">
                  {selectedDoorType ? `${selectedDoorType} Door` : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Finish:</span>
                <span className="font-medium">
                  {selectedFinish === 'PC' ? 'Powder Coat' : 
                   selectedFinish === 'SS' ? 'Stainless Steel' : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-medium ${isConfigurationComplete ? 'text-green-600' : 'text-orange-600'}`}>
                  {isConfigurationComplete ? 'Complete' : 'In Progress'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TallCabinetConfigurator;
