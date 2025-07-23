
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
}

// Enhanced orientation mapping with better handling
const mapOrientation = (orientation: string): string => {
  if (!orientation) return 'None';
  
  const orientationMap: { [key: string]: string } = {
    'Left-Handed': 'LH',
    'Right-Handed': 'RH',
    'None': 'None',
    '': 'None',
    'null': 'None',
    'undefined': 'None'
  };
  
  return orientationMap[orientation] || orientation;
};

// Enhanced dimension parsing with better error handling
const extractDimensionWidth = (dimensions: string): number => {
  if (!dimensions) {
    console.warn('⚠️ Empty dimensions string provided');
    return 0;
  }
  
  // Handle formats like "450x330x750mm", "450×330×750mm", "450 x 330 x 750 mm"
  const cleanDimensions = dimensions.replace(/[^\d×x]/g, '');
  const match = cleanDimensions.match(/(\d+)/);
  
  if (!match) {
    console.warn('⚠️ Could not parse width from dimensions:', dimensions);
    return 0;
  }
  
  const width = parseInt(match[1]);
  console.log(`📏 Parsed width ${width} from dimensions: ${dimensions}`);
  return width;
};

const WallCabinetConfigurator: React.FC<WallCabinetConfiguratorProps> = ({
  variants,
  onVariantSelect,
  selectedVariant
}) => {
  const [selectedFinish, setSelectedFinish] = useState<string>('PC');
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [selectedDoorType, setSelectedDoorType] = useState<string>('');
  const [selectedOrientation, setSelectedOrientation] = useState<string>('');

  // Enhanced debug logging
  React.useEffect(() => {
    console.log('🔧 WallCabinetConfigurator received variants:', variants);
    console.log('📊 Enhanced variant analysis:');
    console.log('- Total variants:', variants.length);
    
    if (variants.length === 0) {
      console.warn('⚠️ No variants provided to configurator');
      return;
    }

    // Analyze variants by door type
    const glassVariants = variants.filter(v => v.door_type === 'Glass');
    const solidVariants = variants.filter(v => v.door_type === 'Solid');
    
    console.log('- Glass variants:', glassVariants.length);
    console.log('- Solid variants:', solidVariants.length);
    
    // Check for missing glass variants
    if (glassVariants.length === 0) {
      console.error('❌ No glass variants found! This is the main issue.');
    }
    
    // Analyze by dimension and door type
    const dimensionAnalysis: { [key: string]: { glass: number, solid: number, orientations: string[] } } = {};
    
    variants.forEach(variant => {
      const dim = variant.dimensions;
      if (!dimensionAnalysis[dim]) {
        dimensionAnalysis[dim] = { glass: 0, solid: 0, orientations: [] };
      }
      
      if (variant.door_type === 'Glass') {
        dimensionAnalysis[dim].glass++;
      } else if (variant.door_type === 'Solid') {
        dimensionAnalysis[dim].solid++;
      }
      
      const orientation = mapOrientation(variant.orientation);
      if (orientation !== 'None' && !dimensionAnalysis[dim].orientations.includes(orientation)) {
        dimensionAnalysis[dim].orientations.push(orientation);
      }
    });
    
    console.log('📊 Dimension analysis:', dimensionAnalysis);
    
    // Check for missing orientations in glass variants
    const smallDimensions = ['450x330x750mm', '500x330x750mm', '550x330x750mm', '600x330x750mm'];
    smallDimensions.forEach(dim => {
      const analysis = dimensionAnalysis[dim];
      if (analysis) {
        console.log(`🔍 ${dim}: Glass=${analysis.glass}, Solid=${analysis.solid}, Orientations=${analysis.orientations.join(', ')}`);
        if (analysis.glass === 0) {
          console.error(`❌ Missing glass variants for ${dim}`);
        }
        if (analysis.glass > 0 && analysis.orientations.length === 0) {
          console.error(`❌ Glass variants for ${dim} missing orientations`);
        }
      } else {
        console.error(`❌ No variants found for ${dim}`);
      }
    });
    
    // Log unique values for debugging
    console.log('- Unique door types:', [...new Set(variants.map(v => v.door_type))]);
    console.log('- Unique dimensions:', [...new Set(variants.map(v => v.dimensions))].sort());
    console.log('- Unique finishes:', [...new Set(variants.map(v => v.finish_type))]);
    console.log('- Unique orientations:', [...new Set(variants.map(v => mapOrientation(v.orientation)))]);
    
    // Log each variant for debugging
    variants.forEach((variant, index) => {
      console.log(`Variant ${index + 1}:`, {
        id: variant.id,
        dimensions: variant.dimensions,
        door_type: variant.door_type,
        finish_type: variant.finish_type,
        orientation: variant.orientation,
        mapped_orientation: mapOrientation(variant.orientation),
        product_code: variant.product_code
      });
    });
  }, [variants]);

  // Extract unique options with enhanced validation
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
      // Add finish type
      if (variant.finish_type) {
        finishes.add(variant.finish_type);
      }
      
      // Add dimensions
      if (variant.dimensions) {
        dimensions.add(variant.dimensions);
      }
      
      // Add door type with validation
      if (variant.door_type && ['Glass', 'Solid'].includes(variant.door_type)) {
        doorTypes.add(variant.door_type);
      }
      
      // Add orientation
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
    
    // Validate that we have both door types
    if (!result.doorTypes.includes('Glass')) {
      console.error('❌ Glass door type missing from options!');
    }
    if (!result.doorTypes.includes('Solid')) {
      console.error('❌ Solid door type missing from options!');
    }
    
    return result;
  }, [variants]);

  // Enhanced filtering with better validation
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

    console.log(`🔍 Filtering ${type} with filters:`, {
      selectedFinish,
      selectedDimension,
      selectedDoorType,
      selectedOrientation,
      filteredCount: filtered.length
    });

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

    const result = Array.from(availableSet).sort();
    console.log(`✅ Available ${type}:`, result);
    return result;
  };

  // Enhanced variant matching with better error handling
  const getCurrentVariant = () => {
    if (!selectedFinish || !selectedDimension || !selectedDoorType) {
      console.log('⚠️ Missing required selections:', { 
        selectedFinish, 
        selectedDimension, 
        selectedDoorType 
      });
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

    const matchingVariants = variants.filter(variant => {
      const matchesFinish = variant.finish_type === selectedFinish;
      const matchesDimension = variant.dimensions === selectedDimension;
      const matchesDoorType = variant.door_type === selectedDoorType;
      const mappedOrientation = mapOrientation(variant.orientation);
      
      console.log(`🔍 Checking variant ${variant.product_code}:`, {
        matchesFinish,
        matchesDimension,
        matchesDoorType,
        mappedOrientation,
        variantOrientation: variant.orientation
      });

      // For larger dimensions (750mm+), no orientation required
      if (dimensionWidth >= 750) {
        const matches = matchesFinish && matchesDimension && matchesDoorType && mappedOrientation === 'None';
        console.log(`🔍 Large dimension match for ${variant.product_code}:`, matches);
        return matches;
      } else {
        // For smaller dimensions (450-600mm), orientation is required
        if (selectedOrientation) {
          const matches = matchesFinish && matchesDimension && matchesDoorType && mappedOrientation === selectedOrientation;
          console.log(`🔍 Small dimension with orientation match for ${variant.product_code}:`, matches);
          return matches;
        } else {
          console.log(`🔍 Small dimension without orientation for ${variant.product_code} - no match`);
          return false;
        }
      }
    });

    console.log('🎯 Found matching variants:', matchingVariants);
    
    if (matchingVariants.length === 0) {
      console.warn('⚠️ No matching variants found with current selections');
      return null;
    }
    
    if (matchingVariants.length > 1) {
      console.warn('⚠️ Multiple matching variants found, using first one:', matchingVariants);
    }
    
    return matchingVariants[0];
  };

  // Enhanced orientation requirement check
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

  // Enhanced selection handlers with better validation
  const handleFinishChange = (finish: string) => {
    console.log('🎯 Finish changed to:', finish);
    setSelectedFinish(finish);
    
    // Reset dependent selections
    setSelectedDimension('');
    setSelectedDoorType('');
    setSelectedOrientation('');
  };

  const handleDimensionChange = (dimension: string) => {
    console.log('🎯 Dimension changed to:', dimension);
    setSelectedDimension(dimension);
    
    // Reset dependent selections
    setSelectedDoorType('');
    setSelectedOrientation('');
  };

  const handleDoorTypeChange = (doorType: string) => {
    console.log('🎯 Door type changed to:', doorType);
    setSelectedDoorType(doorType);
    
    // Reset orientation
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

  // Enhanced state calculations
  const currentVariant = getCurrentVariant();
  const needsOrientation = shouldShowOrientation();
  const canProceed = currentVariant && (!needsOrientation || selectedOrientation);

  console.log('🎯 Current configurator state:', {
    currentVariant: currentVariant?.product_code,
    needsOrientation,
    canProceed,
    selectedFinish,
    selectedDimension,
    selectedDoorType,
    selectedOrientation
  });

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
      {/* Enhanced finish selection */}
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

      {/* Enhanced configuration summary */}
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

      {/* Enhanced dimension selection */}
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

      {/* Enhanced door type selection */}
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

      {/* Enhanced orientation selection */}
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

      {/* Enhanced selection status */}
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
        </div>
      )}
    </div>
  );
};

export default WallCabinetConfigurator;
