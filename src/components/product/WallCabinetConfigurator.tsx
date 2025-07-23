import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Ruler, DoorClosed, RotateCcw, AlertTriangle } from 'lucide-react';
import { WallCabinetConfiguration } from '@/types/product';

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
  onConfigurationSelect: (config: WallCabinetConfiguration) => void;
  selectedConfiguration?: WallCabinetConfiguration;
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

// Enhanced dimension parsing and sorting
const extractDimensionWidth = (dimensions: string): number => {
  if (!dimensions) return 0;
  
  // Handle formats like "450x330x750mm", "450×330×750mm", "450 x 330 x 750 mm"
  const cleanDimensions = dimensions.replace(/[^\d×x]/g, '');
  const match = cleanDimensions.match(/(\d+)/);
  
  if (!match) return 0;
  
  return parseInt(match[1]);
};

// Sort dimensions from smallest to biggest
const sortDimensionsBySize = (dimensions: string[]): string[] => {
  return dimensions.sort((a, b) => {
    const widthA = extractDimensionWidth(a);
    const widthB = extractDimensionWidth(b);
    return widthA - widthB;
  });
};

const WallCabinetConfigurator: React.FC<WallCabinetConfiguratorProps> = ({
  variants,
  onConfigurationSelect,
  selectedConfiguration,
  isLoading = false
}) => {
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [selectedDoorType, setSelectedDoorType] = useState<string>('');
  const [selectedOrientation, setSelectedOrientation] = useState<string>('');

  // Extract unique options
  const options = useMemo(() => {
    if (variants.length === 0) {
      return {
        dimensions: [],
        doorTypes: [],
        orientations: []
      };
    }

    const dimensions = new Set<string>();
    const doorTypes = new Set<string>();
    const orientations = new Set<string>();

    variants.forEach(variant => {
      if (variant.dimensions) dimensions.add(variant.dimensions);
      if (variant.door_type) doorTypes.add(variant.door_type);
      
      const mappedOrientation = mapOrientation(variant.orientation);
      if (mappedOrientation && mappedOrientation !== 'None') {
        orientations.add(mappedOrientation);
      }
    });

    return {
      dimensions: sortDimensionsBySize(Array.from(dimensions)),
      doorTypes: Array.from(doorTypes).sort(),
      orientations: Array.from(orientations).sort()
    };
  }, [variants]);

  // Get available options based on current selections
  const getAvailableOptions = (optionType: 'doorType' | 'orientation') => {
    if (variants.length === 0) return [];

    let filteredVariants = [...variants];

    // Filter by dimension if selected
    if (selectedDimension) {
      filteredVariants = filteredVariants.filter(v => v.dimensions === selectedDimension);
    }

    // For orientations, also filter by door type
    if (optionType === 'orientation' && selectedDoorType) {
      filteredVariants = filteredVariants.filter(v => v.door_type === selectedDoorType);
    }

    // Extract the requested options from filtered variants
    const optionSet = new Set<string>();
    
    filteredVariants.forEach(variant => {
      switch (optionType) {
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

    return Array.from(optionSet).sort();
  };

  // Get current configuration
  const getCurrentConfiguration = (): WallCabinetConfiguration | null => {
    if (!selectedDimension || !selectedDoorType) {
      return null;
    }

    const dimensionWidth = extractDimensionWidth(selectedDimension);
    const requiresOrientation = dimensionWidth < 750;
    
    if (requiresOrientation && !selectedOrientation) {
      return null;
    }

    // Find matching variants (all finishes for this configuration)
    const matchingVariants = variants.filter(variant => {
      const dimensionMatch = variant.dimensions === selectedDimension;
      const doorTypeMatch = variant.door_type === selectedDoorType;
      const mappedOrientation = mapOrientation(variant.orientation);
      
      let orientationMatch = false;
      if (requiresOrientation) {
        orientationMatch = mappedOrientation === selectedOrientation;
      } else {
        orientationMatch = mappedOrientation === 'None';
      }

      return dimensionMatch && doorTypeMatch && orientationMatch;
    });

    if (matchingVariants.length === 0) {
      return null;
    }

    // Get available finishes for this configuration
    const availableFinishes = [...new Set(matchingVariants.map(v => v.finish_type))];

    return {
      dimension: selectedDimension,
      doorType: selectedDoorType,
      orientation: requiresOrientation ? selectedOrientation : undefined,
      availableFinishes,
      variants: matchingVariants
    };
  };

  // Check if orientation should be shown
  const shouldShowOrientation = () => {
    if (!selectedDimension || !selectedDoorType) {
      return false;
    }
    
    const dimensionWidth = extractDimensionWidth(selectedDimension);
    if (dimensionWidth >= 750) {
      return false;
    }
    
    const availableOrientations = getAvailableOptions('orientation');
    return availableOrientations.length > 0;
  };

  // Selection handlers
  const handleDimensionChange = (dimension: string) => {
    setSelectedDimension(dimension);
    setSelectedDoorType('');
    setSelectedOrientation('');
  };

  const handleDoorTypeChange = (doorType: string) => {
    setSelectedDoorType(doorType);
    setSelectedOrientation('');
  };

  const handleOrientationChange = (orientation: string) => {
    setSelectedOrientation(orientation);
  };

  // Auto-select configuration when all required options are selected
  useEffect(() => {
    const config = getCurrentConfiguration();
    if (config) {
      onConfigurationSelect(config);
    }
  }, [selectedDimension, selectedDoorType, selectedOrientation]);

  // State calculations
  const currentConfig = getCurrentConfiguration();
  const needsOrientation = shouldShowOrientation();
  const canProceed = currentConfig && (!needsOrientation || selectedOrientation);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
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
      {/* Dimension selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Ruler className="w-5 h-5" />
          Dimensions
        </h3>
        <Select value={selectedDimension} onValueChange={handleDimensionChange}>
          <SelectTrigger className="w-full bg-background border-input hover:border-ring transition-colors">
            <SelectValue placeholder="Select cabinet dimensions" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border shadow-lg z-50">
            {options.dimensions.map((dimension) => (
              <SelectItem 
                key={dimension} 
                value={dimension}
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              >
                {dimension}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Door type selection */}
      {selectedDimension && (
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

      {/* Configuration summary */}
      {(selectedDimension || selectedDoorType || selectedOrientation) && (
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
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
            {currentConfig && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Available Finishes:</span>
                <div className="flex gap-1">
                  {currentConfig.availableFinishes.map(finish => (
                    <Badge key={finish} variant="outline" className="text-xs">
                      {finish === 'PC' ? 'Powder Coat' : finish === 'SS' ? 'Stainless Steel' : finish}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selection status */}
      {!canProceed && selectedDimension && (
        <div className="text-sm text-muted-foreground">
          {!selectedDoorType && "Please select door type to continue."}
          {selectedDoorType && needsOrientation && !selectedOrientation && "Please select orientation to continue."}
        </div>
      )}
    </div>
  );
};

export default WallCabinetConfigurator;