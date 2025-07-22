
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Ruler, DoorOpen, Palette, Settings } from 'lucide-react';

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
  const [selectedDepth, setSelectedDepth] = useState<string>('');
  const [selectedHeight, setSelectedHeight] = useState<string>('');
  const [selectedDoorType, setSelectedDoorType] = useState<string>('');

  // Extract unique depth and height options from dimensions
  const { depths, heights } = useMemo(() => {
    const dimensionPairs = variants.map(v => v.dimensions).filter(Boolean);
    const depthSet = new Set<string>();
    const heightSet = new Set<string>();

    console.log('Processing dimensions:', dimensionPairs);

    dimensionPairs.forEach(dim => {
      // Remove "mm" suffix first, then split by "x"
      const cleanDim = dim.replace(/mm/g, '');
      const parts = cleanDim.split('x').map(p => p.trim());
      console.log('Dimension parts after cleaning:', parts);
      
      if (parts.length >= 3) {
        const depth = parts[1]; // Second value is depth
        const height = parts[2]; // Third value is height
        depthSet.add(depth);
        heightSet.add(height);
      }
    });

    const sortedDepths = Array.from(depthSet).sort((a, b) => parseInt(a) - parseInt(b));
    const sortedHeights = Array.from(heightSet).sort((a, b) => parseInt(a) - parseInt(b));

    console.log('Extracted depths:', sortedDepths);
    console.log('Extracted heights:', sortedHeights);

    return {
      depths: sortedDepths,
      heights: sortedHeights
    };
  }, [variants]);

  const doorTypes = useMemo(() => {
    const types = [...new Set(variants.map(v => v.door_type).filter(Boolean))].sort();
    console.log('Door types:', types);
    return types;
  }, [variants]);

  // Find matching variant based on current selections
  const findMatchingVariant = (depth: string, height: string, doorType: string, finish: string) => {
    console.log('Finding variant for:', { depth, height, doorType, finish });
    
    const matchingVariant = variants.find(v => {
      if (!v.dimensions) return false;
      
      // Remove "mm" suffix first, then split by "x"
      const cleanDim = v.dimensions.replace(/mm/g, '');
      const dimParts = cleanDim.split('x').map(p => p.trim());
      
      if (dimParts.length < 3) return false;
      
      const matches = dimParts[1] === depth && 
             dimParts[2] === height && 
             v.door_type === doorType && 
             v.finish_type === finish;
             
      if (matches) {
        console.log('Found matching variant:', v);
      }
      
      return matches;
    });
    
    return matchingVariant;
  };

  // Handle depth selection
  const handleDepthSelect = (depth: string) => {
    console.log('Selected depth:', depth);
    setSelectedDepth(depth);
    
    if (selectedHeight && selectedDoorType) {
      const matchingVariant = findMatchingVariant(depth, selectedHeight, selectedDoorType, selectedFinish);
      if (matchingVariant) {
        onVariantChange(matchingVariant.id);
      }
    }
  };

  // Handle height selection
  const handleHeightSelect = (height: string) => {
    console.log('Selected height:', height);
    setSelectedHeight(height);
    
    if (selectedDepth && selectedDoorType) {
      const matchingVariant = findMatchingVariant(selectedDepth, height, selectedDoorType, selectedFinish);
      if (matchingVariant) {
        onVariantChange(matchingVariant.id);
      }
    }
  };

  // Handle door type selection
  const handleDoorTypeSelect = (doorType: string) => {
    console.log('Selected door type:', doorType);
    setSelectedDoorType(doorType);
    
    if (selectedDepth && selectedHeight) {
      const matchingVariant = findMatchingVariant(selectedDepth, selectedHeight, doorType, selectedFinish);
      if (matchingVariant) {
        onVariantChange(matchingVariant.id);
      }
    }
  };

  // Handle finish selection
  const handleFinishSelect = (finish: string) => {
    console.log('Selected finish:', finish);
    onFinishChange(finish);
    
    if (selectedDepth && selectedHeight && selectedDoorType) {
      const matchingVariant = findMatchingVariant(selectedDepth, selectedHeight, selectedDoorType, finish);
      if (matchingVariant) {
        onVariantChange(matchingVariant.id);
      }
    }
  };

  // Initialize selections based on current variant
  React.useEffect(() => {
    const currentVariant = variants.find(v => v.id === selectedVariantId);
    console.log('Current variant:', currentVariant);
    
    if (currentVariant && currentVariant.dimensions) {
      // Remove "mm" suffix first, then split by "x"
      const cleanDim = currentVariant.dimensions.replace(/mm/g, '');
      const dimParts = cleanDim.split('x').map(p => p.trim());
      
      if (dimParts.length >= 3) {
        setSelectedDepth(dimParts[1]);
        setSelectedHeight(dimParts[2]);
      }
      setSelectedDoorType(currentVariant.door_type || '');
    }
  }, [selectedVariantId, variants]);

  const isDimensionsComplete = selectedDepth && selectedHeight;
  const isConfigurationComplete = selectedDepth && selectedHeight && selectedDoorType && selectedFinish;

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
          <div className="grid grid-cols-2 gap-3">
            {/* Depth Selection */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Depth (mm)</label>
              <Select value={selectedDepth} onValueChange={handleDepthSelect}>
                <SelectTrigger className="w-full h-8 text-sm">
                  <SelectValue placeholder="Choose depth" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {depths.length === 0 ? (
                    <SelectItem value="" disabled>No depths available</SelectItem>
                  ) : (
                    depths.map((depth) => (
                      <SelectItem key={depth} value={depth}>
                        {depth}mm
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Height Selection */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Height (mm)</label>
              <Select value={selectedHeight} onValueChange={handleHeightSelect}>
                <SelectTrigger className="w-full h-8 text-sm">
                  <SelectValue placeholder="Choose height" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {heights.length === 0 ? (
                    <SelectItem value="" disabled>No heights available</SelectItem>
                  ) : (
                    heights.map((height) => (
                      <SelectItem key={height} value={height}>
                        {height}mm
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Width: 750mm (fixed)</p>
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
                  disabled={!isDimensionsComplete}
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedFinish === 'PC' ? "default" : "outline"}
              size="sm"
              onClick={() => handleFinishSelect('PC')}
              className="h-auto py-2 flex flex-col items-center gap-1 text-xs"
              disabled={!isDimensionsComplete || !selectedDoorType}
            >
              {selectedFinish === 'PC' && <Check className="w-3 h-3" />}
              <span className="font-medium">Powder Coat</span>
            </Button>
            <Button
              variant={selectedFinish === 'SS' ? "default" : "outline"}
              size="sm"
              onClick={() => handleFinishSelect('SS')}
              className="h-auto py-2 flex flex-col items-center gap-1 text-xs"
              disabled={!isDimensionsComplete || !selectedDoorType}
            >
              {selectedFinish === 'SS' && <Check className="w-3 h-3" />}
              <span className="font-medium">Stainless Steel</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary - After Finish Selection */}
      {(selectedDepth || selectedHeight || selectedDoorType || selectedFinish) && (
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
                  {selectedDepth && selectedHeight 
                    ? `750×${selectedDepth}×${selectedHeight}mm`
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
