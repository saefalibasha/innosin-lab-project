
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

  // Enhanced debug logging with variant breakdown
  useEffect(() => {
    console.log('🔧 WallCabinetConfigurator - Total variants received:', variants.length);
    
    if (variants.length === 0) {
      console.warn('⚠️ No variants provided to configurator');
      return;
    }

    // Log all 24 variants with their properties
    console.log('📋 Complete variant breakdown:');
    variants.forEach((variant, index) => {
      console.log(`  ${index + 1}. ${variant.product_code}:`, {
        dimensions: variant.dimensions,
        finish: variant.finish_type,
        doorType: variant.door_type,
        orientation: variant.orientation,
        mappedOrientation: mapOrientation(variant.orientation)
      });
    });

    // Group by key properties for analysis
    const byFinish = variants.reduce((acc, v) => {
      acc[v.finish_type] = (acc[v.finish_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byDimension = variants.reduce((acc, v) => {
      acc[v.dimensions] = (acc[v.dimensions] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byDoorType = variants.reduce((acc, v) => {
      acc[v.door_type] = (acc[v.door_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byOrientation = variants.reduce((acc, v) => {
      const mapped = mapOrientation(v.orientation);
      acc[mapped] = (acc[mapped] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📊 Variant counts by property:');
    console.log('  Finishes:', byFinish);
    console.log('  Dimensions:', byDimension);
    console.log('  Door Types:', byDoorType);
    console.log('  Orientations:', byOrientation);

    // Validate we have all expected combinations
    const expectedCombinations = [
      // Glass doors with orientations (450-600mm)
      { finish: 'PC', dimension: '450x330x750mm', doorType: 'Glass', orientation: 'LH' },
      { finish: 'PC', dimension: '450x330x750mm', doorType: 'Glass', orientation: 'RH' },
      { finish: 'PC', dimension: '600x330x750mm', doorType: 'Glass', orientation: 'LH' },
      { finish: 'PC', dimension: '600x330x750mm', doorType: 'Glass', orientation: 'RH' },
      // Solid doors with orientations (450-600mm)
      { finish: 'PC', dimension: '450x330x750mm', doorType: 'Solid', orientation: 'LH' },
      { finish: 'PC', dimension: '450x330x750mm', doorType: 'Solid', orientation: 'RH' },
      { finish: 'PC', dimension: '600x330x750mm', doorType: 'Solid', orientation: 'LH' },
      { finish: 'PC', dimension: '600x330x750mm', doorType: 'Solid', orientation: 'RH' },
      // Large dimensions without orientations (750mm+)
      { finish: 'PC', dimension: '750x330x750mm', doorType: 'Glass', orientation: 'None' },
      { finish: 'PC', dimension: '750x330x750mm', doorType: 'Solid', orientation: 'None' },
    ];

    console.log('✅ Checking expected combinations:');
    expectedCombinations.forEach(combo => {
      const found = variants.find(v => 
        v.finish_type === combo.finish &&
        v.dimensions === combo.dimension &&
        v.door_type === combo.doorType &&
        mapOrientation(v.orientation) === combo.orientation
      );
      console.log(`  ${combo.dimension} ${combo.doorType} ${combo.orientation}:`, found ? '✅' : '❌');
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

    console.log('🎯 Extracted all possible options:', result);
    return result;
  }, [variants]);

  // COMPLETELY REWRITTEN: Fixed filtering logic with detailed debugging
  const getAvailableOptions = (optionType: 'dimension' | 'doorType' | 'orientation') => {
    console.log(`\n🔍 === Getting available ${optionType} options ===`);
    console.log('Current selections:', {
      selectedFinish,
      selectedDimension,
      selectedDoorType,
      selectedOrientation
    });

    if (variants.length === 0) {
      console.log('❌ No variants available');
      return [];
    }

    // Start with all variants
    let availableVariants = [...variants];
    console.log(`Starting with ${availableVariants.length} variants`);

    // STEP 1: Always filter by finish (if selected)
    if (selectedFinish) {
      availableVariants = availableVariants.filter(v => v.finish_type === selectedFinish);
      console.log(`After finish filter (${selectedFinish}): ${availableVariants.length} variants`);
    }

    // STEP 2: Filter by dimension (if not looking for dimensions AND dimension is selected)
    if (optionType !== 'dimension' && selectedDimension) {
      availableVariants = availableVariants.filter(v => v.dimensions === selectedDimension);
      console.log(`After dimension filter (${selectedDimension}): ${availableVariants.length} variants`);
    }

    // STEP 3: Filter by door type (if looking for orientations AND door type is selected)
    if (optionType === 'orientation' && selectedDoorType) {
      availableVariants = availableVariants.filter(v => v.door_type === selectedDoorType);
      console.log(`After door type filter (${selectedDoorType}): ${availableVariants.length} variants`);
    }

    // Log remaining variants for debugging
    console.log('Remaining variants after filtering:');
    availableVariants.forEach(v => {
      console.log(`  ${v.product_code}: ${v.dimensions} | ${v.door_type} | ${v.orientation}`);
    });

    // Extract the requested options
    const optionSet = new Set<string>();
    
    availableVariants.forEach(variant => {
      switch (optionType) {
        case 'dimension':
          if (variant.dimensions) optionSet.add(variant.dimensions);
          break;
        case 'doorType':
          if (variant.door_type) optionSet.add(variant.door_type);
          break;
        case 'orientation':
          const mappedOrientation = mapOrientation(variant.orientation);
          if (mappedOrientation && mappedOrientation !== 'None') {
            optionSet.add(mappedOrientation);
          }
          break;
      }
    });

    const result = Array.from(optionSet).sort();
    console.log(`✅ Available ${optionType} options:`, result);
    console.log(`=== End ${optionType} options ===\n`);
    
    return result;
  };

  // Enhanced variant matching with detailed logging
  const getCurrentVariant = () => {
    console.log('\n🎯 === Getting current variant ===');
    console.log('Selections:', {
      selectedFinish,
      selectedDimension,
      selectedDoorType,
      selectedOrientation
    });

    if (!selectedFinish || !selectedDimension || !selectedDoorType) {
      console.log('❌ Missing required selections');
      return null;
    }

    const dimensionWidth = extractDimensionWidth(selectedDimension);
    const requiresOrientation = dimensionWidth < 750;
    
    console.log(`Dimension width: ${dimensionWidth}mm, requires orientation: ${requiresOrientation}`);
    
    if (requiresOrientation && !selectedOrientation) {
      console.log('❌ Small dimension requires orientation, but none selected');
      return null;
    }

    // Find matching variant
    const matchingVariants = variants.filter(variant => {
      const finishMatch = variant.finish_type === selectedFinish;
      const dimensionMatch = variant.dimensions === selectedDimension;
      const doorTypeMatch = variant.door_type === selectedDoorType;
      const mappedOrientation = mapOrientation(variant.orientation);
      
      let orientationMatch = false;
      if (requiresOrientation) {
        orientationMatch = mappedOrientation === selectedOrientation;
      } else {
        orientationMatch = mappedOrientation === 'None';
      }

      const isMatch = finishMatch && dimensionMatch && doorTypeMatch && orientationMatch;
      
      console.log(`Checking ${variant.product_code}:`, {
        finishMatch,
        dimensionMatch,
        doorTypeMatch,
        orientationMatch,
        mappedOrientation,
        isMatch
      });
      
      return isMatch;
    });

    console.log(`Found ${matchingVariants.length} matching variants`);
    const result = matchingVariants.length > 0 ? matchingVariants[0] : null;
    
    if (result) {
      console.log('✅ Selected variant:', result.product_code);
    } else {
      console.log('❌ No matching variant found');
    }
    
    console.log('=== End current variant ===\n');
    return result;
  };

  // Check if orientation should be shown
  const shouldShowOrientation = () => {
    if (!selectedFinish || !selectedDimension || !selectedDoorType) {
      return false;
    }
    
    const dimensionWidth = extractDimensionWidth(selectedDimension);
    if (dimensionWidth >= 750) {
      return false;
    }
    
    const availableOrientations = getAvailableOptions('orientation');
    return availableOrientations.length > 0;
  };

  // Enhanced selection handlers with proper state management
  const handleFinishChange = (finish: string) => {
    console.log(`\n🔄 Finish changed to: ${finish}`);
    setSelectedFinish(finish);
    setSelectedDimension('');
    setSelectedDoorType('');
    setSelectedOrientation('');
  };

  const handleDimensionChange = (dimension: string) => {
    console.log(`\n🔄 Dimension changed to: ${dimension}`);
    setSelectedDimension(dimension);
    setSelectedDoorType('');
    setSelectedOrientation('');
  };

  const handleDoorTypeChange = (doorType: string) => {
    console.log(`\n🔄 Door type changed to: ${doorType}`);
    setSelectedDoorType(doorType);
    setSelectedOrientation('');
  };

  const handleOrientationChange = (orientation: string) => {
    console.log(`\n🔄 Orientation changed to: ${orientation}`);
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

  // State calculations
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
            {getAvailableOptions('dimension').map((dimension) => (
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
      )}

      {/* Door type selection */}
      {selectedFinish && selectedDimension && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <DoorClosed className="w-5 h-5" />
            Door Type
          </h3>
          <div className="flex gap-2">
            {getAvailableOptions('doorType').map((doorType) => (
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

      {/* Enhanced debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded space-y-1">
          <p><strong>Debug Info:</strong></p>
          <p>Total variants: {variants.length}</p>
          <p>Glass variants: {variants.filter(v => v.door_type === 'Glass').length}</p>
          <p>Solid variants: {variants.filter(v => v.door_type === 'Solid').length}</p>
          <p>Current: {selectedFinish} / {selectedDimension} / {selectedDoorType} / {selectedOrientation}</p>
          <p>Available dimensions: {getAvailableOptions('dimension').join(', ')}</p>
          <p>Available door types: {getAvailableOptions('doorType').join(', ')}</p>
          <p>Available orientations: {getAvailableOptions('orientation').join(', ')}</p>
          <p>Needs orientation: {needsOrientation ? 'Yes' : 'No'}</p>
          <p>Can proceed: {canProceed ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

export default WallCabinetConfigurator;
