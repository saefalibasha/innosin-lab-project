
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Ruler, Settings, Layers, ArrowRight } from 'lucide-react';

interface ModularCabinetVariant {
  id: string;
  name: string;
  product_code: string;
  dimensions: string;
  finish_type: string;
  orientation: string;
  door_type: string;
  drawer_count?: number;
  thumbnail_path: string;
  model_path: string;
  additional_images: string[];
}

interface ModularCabinetConfiguration {
  id: string;
  name: string;
  description: string;
  doorType: string;
  dimensions: string;
  orientation?: string;
  drawerCount?: number;
  finishType: string;
  variants: ModularCabinetVariant[];
}

interface ModularCabinetConfiguratorProps {
  variants: ModularCabinetVariant[];
  selectedConfiguration: ModularCabinetConfiguration | null;
  onConfigurationSelect: (configuration: ModularCabinetConfiguration) => void;
  isLoading?: boolean;
}

// Standardized dimension format utility
const standardizeDimensions = (dimensions: string): string => {
  if (!dimensions) return '';
  
  // Remove any existing "mm" suffix and normalize spacing
  const cleanDimensions = dimensions.replace(/mm$/i, '').trim();
  
  // Handle different formats like "500×500×650", "500 x 500 x 650", "500*500*650"
  const normalized = cleanDimensions
    .replace(/[×x*]/gi, ' × ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return `${normalized} mm`;
};

// Extract bench height from dimensions (last number)
const getBenchHeight = (dimensions: string): number => {
  if (!dimensions) return 0;
  const parts = dimensions.replace(/mm$/i, '').split(/[×x*\s]+/);
  return parseInt(parts[parts.length - 1]) || 0;
};

// Utility function to extract door type from variant data
const getDoorTypeFromVariant = (variant: ModularCabinetVariant): string => {
  // Handle drawer-only configurations first
  if (variant.drawer_count && variant.drawer_count > 0 && 
      (!variant.door_type || variant.door_type === 'None' || variant.door_type.trim() === '')) {
    return 'Drawer-Only';
  }
  
  // Check if door_type is explicitly set and not empty
  if (variant.door_type && variant.door_type.trim() !== '' && variant.door_type !== 'None') {
    return variant.door_type;
  }
  
  // Check product code for door type indicators
  const productCode = variant.product_code.toUpperCase();
  
  if (productCode.includes('DD') || productCode.includes('DOUBLE')) {
    return 'Double-Door';
  } else if (productCode.includes('TD') || productCode.includes('TRIPLE')) {
    return 'Triple-Door';
  } else if (productCode.includes('DWR') || productCode.includes('DRAWER')) {
    return 'Drawer-Only';
  } else if (productCode.includes('MCC') || productCode.includes('COMBINATION')) {
    return 'Combination';
  }
  
  // Default to Single-Door for standard cabinets
  return 'Single-Door';
};

// Check if orientation is required for the given dimensions
const isOrientationRequired = (dimensions: string): boolean => {
  const standardized = standardizeDimensions(dimensions);
  // Orientation is typically required for smaller cabinets (500x500 dimensions)
  return standardized.includes('500 × 500');
};

const ModularCabinetConfigurator: React.FC<ModularCabinetConfiguratorProps> = ({
  variants,
  selectedConfiguration,
  onConfigurationSelect,
  isLoading = false
}) => {
  const [selectedDoorType, setSelectedDoorType] = useState<string>('');
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [selectedOrientation, setSelectedOrientation] = useState<string>('');
  const [selectedDrawerCount, setSelectedDrawerCount] = useState<string>('');

  // Get available door types
  const availableDoorTypes = useMemo(() => {
    const doorTypes = new Set<string>();
    variants.forEach(variant => {
      const doorType = getDoorTypeFromVariant(variant);
      doorTypes.add(doorType);
    });
    
    const sortedTypes = Array.from(doorTypes).sort((a, b) => {
      const order = ['Single-Door', 'Double-Door', 'Triple-Door', 'Combination', 'Drawer-Only'];
      const aIndex = order.indexOf(a);
      const bIndex = order.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      return a.localeCompare(b);
    });
    
    return sortedTypes;
  }, [variants]);

  // Get available dimensions filtered by door type
  const availableDimensions = useMemo(() => {
    if (!selectedDoorType) return [];
    
    const filteredVariants = variants.filter(variant => 
      getDoorTypeFromVariant(variant) === selectedDoorType
    );
    
    const dimensions = new Set<string>();
    filteredVariants.forEach(variant => {
      dimensions.add(standardizeDimensions(variant.dimensions));
    });
    
    return Array.from(dimensions).sort((a, b) => {
      const aHeight = getBenchHeight(a);
      const bHeight = getBenchHeight(b);
      if (aHeight !== bHeight) return aHeight - bHeight;
      return a.localeCompare(b);
    });
  }, [variants, selectedDoorType]);

  // Get available orientations filtered by door type and dimensions
  const availableOrientations = useMemo(() => {
    if (!selectedDoorType || !selectedDimension) return [];
    
    const filteredVariants = variants.filter(variant => 
      getDoorTypeFromVariant(variant) === selectedDoorType &&
      standardizeDimensions(variant.dimensions) === selectedDimension
    );
    
    const orientations = new Set<string>();
    filteredVariants.forEach(variant => {
      if (variant.orientation && variant.orientation !== 'None') {
        orientations.add(variant.orientation);
      }
    });
    
    return Array.from(orientations).sort();
  }, [variants, selectedDoorType, selectedDimension]);

  // Get available drawer counts filtered by previous selections
  const availableDrawerCounts = useMemo(() => {
    if (!selectedDoorType || !selectedDimension) return [];
    
    const filteredVariants = variants.filter(variant => {
      const matchesDoorType = getDoorTypeFromVariant(variant) === selectedDoorType;
      const matchesDimensions = standardizeDimensions(variant.dimensions) === selectedDimension;
      const matchesOrientation = !selectedOrientation || 
        !variant.orientation || 
        variant.orientation === 'None' || 
        variant.orientation === selectedOrientation;
      
      return matchesDoorType && matchesDimensions && matchesOrientation;
    });
    
    const drawerCounts = new Set<number>();
    filteredVariants.forEach(variant => {
      if (variant.drawer_count && variant.drawer_count > 0) {
        drawerCounts.add(variant.drawer_count);
      }
    });
    
    return Array.from(drawerCounts).sort((a, b) => a - b);
  }, [variants, selectedDoorType, selectedDimension, selectedOrientation]);

  // Get current configuration based on selections
  const currentConfiguration = useMemo(() => {
    if (!selectedDoorType || !selectedDimension) return null;
    
    const filteredVariants = variants.filter(variant => {
      const matchesDoorType = getDoorTypeFromVariant(variant) === selectedDoorType;
      const matchesDimensions = standardizeDimensions(variant.dimensions) === selectedDimension;
      const matchesOrientation = !selectedOrientation || 
        !variant.orientation || 
        variant.orientation === 'None' || 
        variant.orientation === selectedOrientation;
      const matchesDrawerCount = !selectedDrawerCount || 
        !variant.drawer_count || 
        variant.drawer_count.toString() === selectedDrawerCount;
      
      return matchesDoorType && matchesDimensions && matchesOrientation && matchesDrawerCount;
    });
    
    if (filteredVariants.length === 0) return null;
    
    const benchHeight = getBenchHeight(selectedDimension);
    const benchType = benchHeight === 650 ? '750mm Bench' : benchHeight === 800 ? '900mm Bench' : `${benchHeight}mm Bench`;
    
    let configName = selectedDoorType;
    if (selectedOrientation) {
      configName += ` (${selectedOrientation})`;
    }
    if (selectedDrawerCount) {
      configName += ` - ${selectedDrawerCount} Drawer${parseInt(selectedDrawerCount) > 1 ? 's' : ''}`;
    }
    
    let description = `${selectedDimension} ${selectedDoorType.toLowerCase()} cabinet`;
    if (selectedOrientation) {
      description += ` with ${selectedOrientation.toLowerCase()} configuration`;
    }
    if (selectedDrawerCount) {
      description += ` featuring ${selectedDrawerCount} drawer${parseInt(selectedDrawerCount) > 1 ? 's' : ''}`;
    }
    description += ` for ${benchType}`;
    
    const configKey = `${selectedDoorType}_${selectedDimension}_${selectedOrientation}_${selectedDrawerCount}`;
    
    return {
      id: configKey,
      name: configName,
      description,
      doorType: selectedDoorType,
      dimensions: selectedDimension,
      orientation: selectedOrientation,
      drawerCount: selectedDrawerCount ? parseInt(selectedDrawerCount) : undefined,
      finishType: filteredVariants[0].finish_type,
      variants: filteredVariants
    };
  }, [variants, selectedDoorType, selectedDimension, selectedOrientation, selectedDrawerCount]);

  // Auto-select configuration when all required options are selected
  React.useEffect(() => {
    if (currentConfiguration && 
        selectedDoorType && 
        selectedDimension && 
        (!isOrientationRequired(selectedDimension) || selectedOrientation) &&
        (availableDrawerCounts.length === 0 || selectedDrawerCount)) {
      onConfigurationSelect(currentConfiguration);
    }
  }, [currentConfiguration, selectedDoorType, selectedDimension, selectedOrientation, selectedDrawerCount, onConfigurationSelect]);

  // Reset dependent selections when parent selection changes
  React.useEffect(() => {
    if (selectedDoorType) {
      setSelectedDimension('');
      setSelectedOrientation('');
      setSelectedDrawerCount('');
    }
  }, [selectedDoorType]);

  React.useEffect(() => {
    if (selectedDimension) {
      setSelectedOrientation('');
      setSelectedDrawerCount('');
    }
  }, [selectedDimension]);

  React.useEffect(() => {
    if (selectedOrientation) {
      setSelectedDrawerCount('');
    }
  }, [selectedOrientation]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No cabinet configurations available</p>
      </div>
    );
  }

  const orientationRequired = selectedDimension && isOrientationRequired(selectedDimension);
  const drawerCountAvailable = availableDrawerCounts.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Configure Your Cabinet</h3>
        <p className="text-sm text-muted-foreground">
          Select options to customize your cabinet configuration
        </p>
      </div>

      {/* Step 1: Door Type Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            1
          </div>
          <label className="text-sm font-medium">Door Type</label>
          <Settings className="w-4 h-4 text-muted-foreground" />
        </div>
        
        <Select value={selectedDoorType} onValueChange={setSelectedDoorType}>
          <SelectTrigger>
            <SelectValue placeholder="Select door type" />
          </SelectTrigger>
          <SelectContent>
            {availableDoorTypes.map(doorType => (
              <SelectItem key={doorType} value={doorType}>
                {doorType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Step 2: Dimensions Selection */}
      {selectedDoorType && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              2
            </div>
            <label className="text-sm font-medium">Dimensions</label>
            <Ruler className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <Select value={selectedDimension} onValueChange={setSelectedDimension}>
            <SelectTrigger>
              <SelectValue placeholder="Select dimensions" />
            </SelectTrigger>
            <SelectContent>
              {availableDimensions.map(dimension => {
                const height = getBenchHeight(dimension);
                const benchType = height === 650 ? '750mm Bench' : height === 800 ? '900mm Bench' : `${height}mm Bench`;
                return (
                  <SelectItem key={dimension} value={dimension}>
                    <div className="flex items-center justify-between w-full">
                      <span>{dimension}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {benchType}
                      </Badge>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Step 3: Orientation Selection (if required) */}
      {selectedDimension && orientationRequired && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              3
            </div>
            <label className="text-sm font-medium">Orientation</label>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <Select value={selectedOrientation} onValueChange={setSelectedOrientation}>
            <SelectTrigger>
              <SelectValue placeholder="Select orientation" />
            </SelectTrigger>
            <SelectContent>
              {availableOrientations.map(orientation => (
                <SelectItem key={orientation} value={orientation}>
                  {orientation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Step 4: Drawer Count Selection (if available) */}
      {selectedDimension && (!orientationRequired || selectedOrientation) && drawerCountAvailable && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {orientationRequired ? '4' : '3'}
            </div>
            <label className="text-sm font-medium">Drawer Count</label>
            <Layers className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <Select value={selectedDrawerCount} onValueChange={setSelectedDrawerCount}>
            <SelectTrigger>
              <SelectValue placeholder="Select drawer count" />
            </SelectTrigger>
            <SelectContent>
              {availableDrawerCounts.map(count => (
                <SelectItem key={count} value={count.toString()}>
                  {count} Drawer{count > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Configuration Summary */}
      {currentConfiguration && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-4 h-4" />
              Selected Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{currentConfiguration.name}</span>
                <Badge variant="secondary">
                  {currentConfiguration.finishType === 'PC' ? 'Powder Coat' : 'Stainless Steel'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentConfiguration.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Dimensions: {currentConfiguration.dimensions}</span>
                <span>Type: {currentConfiguration.doorType}</span>
                {currentConfiguration.variants.length > 1 && (
                  <span>{currentConfiguration.variants.length} finish options</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModularCabinetConfigurator;
