
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

  // Extract unique width, depth and height options from dimensions
  const { widths, depths, heights } = useMemo(() => {
    const dimensionPairs = variants.map(v => v.dimensions).filter(Boolean);
    const widthSet = new Set<string>();
    const depthSet = new Set<string>();
    const heightSet = new Set<string>();

    console.log('Processing dimensions:', dimensionPairs);

    dimensionPairs.forEach(dim => {
      // Remove "mm" suffix first, then split by "x"
      const cleanDim = dim.replace(/mm/g, '');
      const parts = cleanDim.split('x').map(p => p.trim());
      console.log('Dimension parts after cleaning:', parts);
      
      if (parts.length >= 3) {
        const width = parts[0]; // First value is width
        const depth = parts[1]; // Second value is depth
        const height = parts[2]; // Third value is height
        widthSet.add(width);
        depthSet.add(depth);
        heightSet.add(height);
      }
    });

    const sortedWidths = Array.from(widthSet).sort((a, b) => parseInt(a) - parseInt(b));
    const sortedDepths = Array.from(depthSet).sort((a, b) => parseInt(a) - parseInt(b));
    const sortedHeights = Array.from(heightSet).sort((a, b) => parseInt(a) - parseInt(b));

    console.log('Extracted widths:', sortedWidths);
    console.log('Extracted depths:', sortedDepths);
    console.log('Extracted heights:', sortedHeights);

    return {
      widths: sortedWidths,
      depths: sortedDepths,
      heights: sortedHeights
    };
  }, [variants]);

  // Find matching variant based on current selections
  const findMatchingVariant = (width: string, depth: string, height: string, finish: string) => {
    console.log('Finding variant for:', { width, depth, height, finish });
    
    const matchingVariant = variants.find(v => {
      if (!v.dimensions) return false;
      
      // Remove "mm" suffix first, then split by "x"
      const cleanDim = v.dimensions.replace(/mm/g, '');
      const dimParts = cleanDim.split('x').map(p => p.trim());
      
      if (dimParts.length < 3) return false;
      
      const matches = dimParts[0] === width && 
             dimParts[1] === depth && 
             dimParts[2] === height && 
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
    
    if (selectedDepth && selectedHeight) {
      const matchingVariant = findMatchingVariant(width, selectedDepth, selectedHeight, selectedFinish);
      if (matchingVariant) {
        onVariantChange(matchingVariant.id);
      }
    }
  };

  // Handle depth selection
  const handleDepthSelect = (depth: string) => {
    console.log('Selected depth:', depth);
    setSelectedDepth(depth);
    
    if (selectedWidth && selectedHeight) {
      const matchingVariant = findMatchingVariant(selectedWidth, depth, selectedHeight, selectedFinish);
      if (matchingVariant) {
        onVariantChange(matchingVariant.id);
      }
    }
  };

  // Handle height selection
  const handleHeightSelect = (height: string) => {
    console.log('Selected height:', height);
    setSelectedHeight(height);
    
    if (selectedWidth && selectedDepth) {
      const matchingVariant = findMatchingVariant(selectedWidth, selectedDepth, height, selectedFinish);
      if (matchingVariant) {
        onVariantChange(matchingVariant.id);
      }
    }
  };

  // Handle finish selection
  const handleFinishSelect = (finish: string) => {
    console.log('Selected finish:', finish);
    onFinishChange(finish);
    
    if (selectedWidth && selectedDepth && selectedHeight) {
      const matchingVariant = findMatchingVariant(selectedWidth, selectedDepth, selectedHeight, finish);
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
        setSelectedWidth(dimParts[0]);
        setSelectedDepth(dimParts[1]);
        setSelectedHeight(dimParts[2]);
      }
    }
  }, [selectedVariantId, variants]);

  const isDimensionsComplete = selectedWidth && selectedDepth && selectedHeight;
  const isConfigurationComplete = selectedWidth && selectedDepth && selectedHeight && selectedFinish;

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
          <div className="grid grid-cols-3 gap-3">
            {/* Width Selection */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Width (mm)</label>
              <Select value={selectedWidth} onValueChange={handleWidthSelect}>
                <SelectTrigger className="w-full h-8 text-sm">
                  <SelectValue placeholder="Width" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {widths.length === 0 ? (
                    <SelectItem value="" disabled>No widths available</SelectItem>
                  ) : (
                    widths.map((width) => (
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
              <Select value={selectedDepth} onValueChange={handleDepthSelect}>
                <SelectTrigger className="w-full h-8 text-sm">
                  <SelectValue placeholder="Depth" />
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
                  <SelectValue placeholder="Height" />
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
        </CardContent>
      </Card>

      {/* Step 2: Finish */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Palette className="w-4 h-4 text-primary" />
            Step 2: Select Finish
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedFinish === 'PC' ? "default" : "outline"}
              size="sm"
              onClick={() => handleFinishSelect('PC')}
              className="h-auto py-2 flex flex-col items-center gap-1 text-xs"
              disabled={!isDimensionsComplete}
            >
              {selectedFinish === 'PC' && <Check className="w-3 h-3" />}
              <span className="font-medium">Powder Coat</span>
            </Button>
            <Button
              variant={selectedFinish === 'SS' ? "default" : "outline"}
              size="sm"
              onClick={() => handleFinishSelect('SS')}
              className="h-auto py-2 flex flex-col items-center gap-1 text-xs"
              disabled={!isDimensionsComplete}
            >
              {selectedFinish === 'SS' && <Check className="w-3 h-3" />}
              <span className="font-medium">Stainless Steel</span>
            </Button>
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
                <span className="text-muted-foreground">Dimensions:</span>
                <span className="font-medium">
                  {selectedWidth && selectedDepth && selectedHeight 
                    ? `${selectedWidth}×${selectedDepth}×${selectedHeight}mm`
                    : 'Incomplete'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Finish:</span>
                <span className="font-medium">
                  {selectedFinish === 'PC' ? 'Powder Coat' : 
                   selectedFinish === 'SS' ? 'Stainless Steel' : 'Not selected'}
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
