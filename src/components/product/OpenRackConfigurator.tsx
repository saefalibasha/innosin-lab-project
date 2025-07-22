
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Ruler, Package, Palette, Settings } from 'lucide-react';

interface OpenRackConfiguratorProps {
  variants: any[];
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  selectedFinish: string;
  onFinishChange: (finish: string) => void;
}

const OpenRackConfigurator: React.FC<OpenRackConfiguratorProps> = ({
  variants,
  selectedVariantId,
  onVariantChange,
  selectedFinish,
  onFinishChange
}) => {
  const [selectedWidth, setSelectedWidth] = useState<string>('');
  const [selectedDepth, setSelectedDepth] = useState<string>('');
  const [selectedHeight, setSelectedHeight] = useState<string>('');

  // Extract dimensions and combinations based on selected finish
  const { widths, depths, heights, availableCombinations, finishSpecificDimensions } = useMemo(() => {
    console.log('Processing Open Rack variants:', variants);
    
    const widthSet = new Set<string>();
    const depthSet = new Set<string>();
    const heightSet = new Set<string>();
    const combinations = new Map<string, any[]>();
    
    // Track dimensions available for each finish
    const finishDimensions = {
      PC: {
        widths: new Set<string>(),
        depths: new Set<string>(),
        heights: new Set<string>(),
        combinations: new Map<string, any[]>()
      },
      SS: {
        widths: new Set<string>(),
        depths: new Set<string>(),
        heights: new Set<string>(),
        combinations: new Map<string, any[]>()
      }
    };

    variants.forEach(variant => {
      if (!variant.dimensions) return;
      
      // Parse dimensions (e.g., "380x380x1800mm" or "600x450x1800mm")
      const cleanDim = variant.dimensions.replace(/mm/g, '');
      const parts = cleanDim.split('x').map(p => p.trim());
      
      if (parts.length >= 3) {
        const width = parts[0];
        const depth = parts[1]; 
        const height = parts[2];
        const finishKey = variant.finish_type === 'SS304' ? 'SS' : 'PC';
        
        // Add to overall sets
        widthSet.add(width);
        depthSet.add(depth);
        heightSet.add(height);
        
        // Add to finish-specific sets
        finishDimensions[finishKey].widths.add(width);
        finishDimensions[finishKey].depths.add(depth);
        finishDimensions[finishKey].heights.add(height);
        
        // Store combinations for validation
        const key = `${width}x${depth}x${height}`;
        const finishKey2 = `${finishKey}_${key}`;
        
        if (!combinations.has(key)) {
          combinations.set(key, []);
        }
        combinations.get(key)?.push(variant);
        
        if (!finishDimensions[finishKey].combinations.has(key)) {
          finishDimensions[finishKey].combinations.set(key, []);
        }
        finishDimensions[finishKey].combinations.get(key)?.push(variant);
      }
    });

    const sortedWidths = Array.from(widthSet).sort((a, b) => parseInt(a) - parseInt(b));
    const sortedDepths = Array.from(depthSet).sort((a, b) => parseInt(a) - parseInt(b));
    const sortedHeights = Array.from(heightSet).sort((a, b) => parseInt(a) - parseInt(b));

    console.log('Extracted dimensions - Widths:', sortedWidths, 'Depths:', sortedDepths, 'Heights:', sortedHeights);
    console.log('Available combinations:', Array.from(combinations.keys()));
    console.log('Finish-specific dimensions:', finishDimensions);

    return {
      widths: sortedWidths,
      depths: sortedDepths,
      heights: sortedHeights,
      availableCombinations: combinations,
      finishSpecificDimensions: finishDimensions
    };
  }, [variants]);

  // Get dimensions available for the selected finish
  const getAvailableDimensionsForFinish = (finish: string) => {
    if (!finish) return { widths, depths, heights };
    
    const finishKey = finish === 'SS' ? 'SS' : 'PC';
    const finishData = finishSpecificDimensions[finishKey];
    
    return {
      widths: Array.from(finishData.widths).sort((a, b) => parseInt(a) - parseInt(b)),
      depths: Array.from(finishData.depths).sort((a, b) => parseInt(a) - parseInt(b)),
      heights: Array.from(finishData.heights).sort((a, b) => parseInt(a) - parseInt(b))
    };
  };

  // Check if a dimension is available for the selected finish
  const isDimensionAvailableForFinish = (dimension: string, type: 'width' | 'depth' | 'height', finish: string) => {
    if (!finish) return true;
    
    const finishKey = finish === 'SS' ? 'SS' : 'PC';
    const finishData = finishSpecificDimensions[finishKey];
    
    switch (type) {
      case 'width':
        return finishData.widths.has(dimension);
      case 'depth':
        return finishData.depths.has(dimension);
      case 'height':
        return finishData.heights.has(dimension);
      default:
        return false;
    }
  };

  // Check if a dimension combination is available for the selected finish
  const isDimensionCombinationAvailableForFinish = (width: string, depth: string, height: string, finish: string) => {
    if (!width || !depth || !height || !finish) return false;
    
    const finishKey = finish === 'SS' ? 'SS' : 'PC';
    const key = `${width}x${depth}x${height}`;
    return finishSpecificDimensions[finishKey].combinations.has(key);
  };

  // Check if a dimension combination is available (general)
  const isDimensionCombinationAvailable = (width: string, depth: string, height: string) => {
    if (!width || !depth || !height) return false;
    const key = `${width}x${depth}x${height}`;
    return availableCombinations.has(key);
  };

  // Find matching variant based on selections
  const findMatchingVariant = (width: string, depth: string, height: string, finish: string) => {
    console.log('Finding variant for dimensions:', { width, depth, height, finish });
    
    const targetDimensions = `${width}x${depth}x${height}mm`;
    const dbFinishValue = finish === 'PC' ? 'PC' : 'SS304';
    
    const matchingVariant = variants.find(variant => {
      const matches = variant.dimensions === targetDimensions && 
                     variant.finish_type === dbFinishValue;
      
      if (matches) {
        console.log('Found matching variant:', variant);
      }
      
      return matches;
    });
    
    if (!matchingVariant) {
      console.log('No matching variant found for:', targetDimensions, dbFinishValue);
    }
    
    return matchingVariant;
  };

  // Clear incompatible dimensions when finish changes
  const clearIncompatibleDimensions = (newFinish: string) => {
    let needsUpdate = false;
    
    if (selectedWidth && !isDimensionAvailableForFinish(selectedWidth, 'width', newFinish)) {
      setSelectedWidth('');
      needsUpdate = true;
    }
    
    if (selectedDepth && !isDimensionAvailableForFinish(selectedDepth, 'depth', newFinish)) {
      setSelectedDepth('');
      needsUpdate = true;
    }
    
    if (selectedHeight && !isDimensionAvailableForFinish(selectedHeight, 'height', newFinish)) {
      setSelectedHeight('');
      needsUpdate = true;
    }
    
    return needsUpdate;
  };

  // Handle dimension selections
  const handleWidthSelect = (width: string) => {
    console.log('Selected width:', width);
    setSelectedWidth(width);
    updateVariantSelection(width, selectedDepth, selectedHeight, selectedFinish);
  };

  const handleDepthSelect = (depth: string) => {
    console.log('Selected depth:', depth);
    setSelectedDepth(depth);
    updateVariantSelection(selectedWidth, depth, selectedHeight, selectedFinish);
  };

  const handleHeightSelect = (height: string) => {
    console.log('Selected height:', height);
    setSelectedHeight(height);
    updateVariantSelection(selectedWidth, selectedDepth, height, selectedFinish);
  };

  const handleFinishSelect = (finish: string) => {
    console.log('Selected finish:', finish);
    onFinishChange(finish);
    
    // Clear incompatible dimensions
    const needsUpdate = clearIncompatibleDimensions(finish);
    
    if (!needsUpdate) {
      updateVariantSelection(selectedWidth, selectedDepth, selectedHeight, finish);
    }
  };

  // Update variant selection when all parameters are available
  const updateVariantSelection = (width: string, depth: string, height: string, finish: string) => {
    if (width && depth && height && finish) {
      const matchingVariant = findMatchingVariant(width, depth, height, finish);
      if (matchingVariant) {
        console.log('Updating to variant:', matchingVariant.id);
        onVariantChange(matchingVariant.id);
      }
    }
  };

  // Initialize selections based on current variant
  React.useEffect(() => {
    const currentVariant = variants.find(v => v.id === selectedVariantId);
    console.log('Current variant:', currentVariant);
    
    if (currentVariant && currentVariant.dimensions) {
      const cleanDim = currentVariant.dimensions.replace(/mm/g, '');
      const dimParts = cleanDim.split('x').map(p => p.trim());
      
      if (dimParts.length >= 3) {
        setSelectedWidth(dimParts[0]);
        setSelectedDepth(dimParts[1]);
        setSelectedHeight(dimParts[2]);
      }
    }
  }, [selectedVariantId, variants]);

  const isDimensionsComplete = selectedWidth && selectedDepth && selectedHeight;
  const isConfigurationComplete = selectedWidth && selectedDepth && selectedHeight && selectedFinish;

  // Get finish-specific available dimensions
  const availableForFinish = getAvailableDimensionsForFinish(selectedFinish);

  return (
    <div className="space-y-3">
      {/* Step 1: Finish Selection (moved to top) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Palette className="w-4 h-4 text-primary" />
            Step 1: Select Finish
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedFinish === 'PC' ? "default" : "outline"}
              size="sm"
              onClick={() => handleFinishSelect('PC')}
              className="h-auto py-2 flex flex-col items-center gap-1 text-xs"
            >
              {selectedFinish === 'PC' && <Check className="w-3 h-3" />}
              <span className="font-medium">Powder Coat</span>
            </Button>
            <Button
              variant={selectedFinish === 'SS' ? "default" : "outline"}
              size="sm"
              onClick={() => handleFinishSelect('SS')}
              className="h-auto py-2 flex flex-col items-center gap-1 text-xs"
            >
              {selectedFinish === 'SS' && <Check className="w-3 h-3" />}
              <span className="font-medium">SS304</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Dimensions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Ruler className="w-4 h-4 text-primary" />
            Step 2: Select Dimensions
            {!selectedFinish && <span className="text-xs text-muted-foreground ml-1">(Select finish first)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {/* Width Selection */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Width (mm)</label>
              <Select 
                value={selectedWidth} 
                onValueChange={handleWidthSelect}
                disabled={!selectedFinish}
              >
                <SelectTrigger className="w-full h-8 text-sm">
                  <SelectValue placeholder="Width" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {!selectedFinish ? (
                    <SelectItem value="" disabled>Select finish first</SelectItem>
                  ) : availableForFinish.widths.length === 0 ? (
                    <SelectItem value="" disabled>No widths available</SelectItem>
                  ) : (
                    availableForFinish.widths.map((width) => (
                      <SelectItem key={width} value={width}>
                        {width}mm
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Depth Selection */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Depth (mm)</label>
              <Select 
                value={selectedDepth} 
                onValueChange={handleDepthSelect}
                disabled={!selectedFinish}
              >
                <SelectTrigger className="w-full h-8 text-sm">
                  <SelectValue placeholder="Depth" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {!selectedFinish ? (
                    <SelectItem value="" disabled>Select finish first</SelectItem>
                  ) : availableForFinish.depths.length === 0 ? (
                    <SelectItem value="" disabled>No depths available</SelectItem>
                  ) : (
                    availableForFinish.depths.map((depth) => (
                      <SelectItem 
                        key={depth} 
                        value={depth}
                        disabled={selectedWidth && selectedHeight && !isDimensionCombinationAvailableForFinish(selectedWidth, depth, selectedHeight, selectedFinish)}
                      >
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
              <Select 
                value={selectedHeight} 
                onValueChange={handleHeightSelect}
                disabled={!selectedFinish}
              >
                <SelectTrigger className="w-full h-8 text-sm">
                  <SelectValue placeholder="Height" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {!selectedFinish ? (
                    <SelectItem value="" disabled>Select finish first</SelectItem>
                  ) : availableForFinish.heights.length === 0 ? (
                    <SelectItem value="" disabled>No heights available</SelectItem>
                  ) : (
                    availableForFinish.heights.map((height) => (
                      <SelectItem 
                        key={height} 
                        value={height}
                        disabled={selectedWidth && selectedDepth && !isDimensionCombinationAvailableForFinish(selectedWidth, selectedDepth, height, selectedFinish)}
                      >
                        {height}mm
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      {(selectedWidth || selectedDepth || selectedHeight || selectedFinish) && (
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
                <span className="text-muted-foreground">Finish:</span>
                <span className="font-medium">
                  {selectedFinish === 'PC' ? 'Powder Coat' : 
                   selectedFinish === 'SS' ? 'SS304' : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions:</span>
                <span className="font-medium">
                  {selectedWidth && selectedDepth && selectedHeight 
                    ? `${selectedWidth}×${selectedDepth}×${selectedHeight}mm`
                    : 'Incomplete'
                  }
                </span>
              </div>
              <div className="flex justify-between col-span-2">
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

export default OpenRackConfigurator;
