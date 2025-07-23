
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Ruler, Settings } from 'lucide-react';

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
  // First check if door_type is explicitly set and not empty
  if (variant.door_type && variant.door_type.trim() !== '' && variant.door_type !== 'None') {
    return variant.door_type;
  }
  
  // Check product code for door type indicators
  const productCode = variant.product_code.toUpperCase();
  
  if (productCode.includes('DD') || productCode.includes('DOUBLE')) {
    return 'Double-Door';
  } else if (productCode.includes('TD') || productCode.includes('TRIPLE')) {
    return 'Triple-Door';
  } else if (productCode.includes('SD') || productCode.includes('SINGLE')) {
    return 'Single-Door';
  } else if (productCode.includes('DWR') || productCode.includes('DRAWER')) {
    return 'Drawer-Only';
  } else if (productCode.includes('MCC') || productCode.includes('COMBINATION')) {
    return 'Combination';
  }
  
  // Default to Single-Door for standard cabinets
  return 'Single-Door';
};

// Generate configurations from variants
const generateConfigurations = (variants: ModularCabinetVariant[]): ModularCabinetConfiguration[] => {
  const configMap = new Map<string, ModularCabinetConfiguration>();

  variants.forEach(variant => {
    const doorType = getDoorTypeFromVariant(variant);
    const standardizedDimensions = standardizeDimensions(variant.dimensions);
    const benchHeight = getBenchHeight(variant.dimensions);
    
    // Create a unique key for each configuration
    const orientation = variant.orientation && variant.orientation !== 'None' ? variant.orientation : '';
    const drawerCount = variant.drawer_count || 0;
    
    const configKey = `${doorType}_${standardizedDimensions}_${orientation}_${drawerCount}_${variant.finish_type}`;
    
    if (!configMap.has(configKey)) {
      // Generate configuration name
      let configName = doorType;
      if (orientation) {
        configName += ` (${orientation})`;
      }
      if (drawerCount > 0) {
        configName += ` - ${drawerCount} Drawer${drawerCount > 1 ? 's' : ''}`;
      }
      
      // Generate description
      let description = `${standardizedDimensions} ${doorType.toLowerCase()} cabinet`;
      if (orientation) {
        description += ` with ${orientation.toLowerCase()} configuration`;
      }
      if (drawerCount > 0) {
        description += ` featuring ${drawerCount} drawer${drawerCount > 1 ? 's' : ''}`;
      }
      
      const benchType = benchHeight === 650 ? '750mm Bench' : benchHeight === 800 ? '900mm Bench' : `${benchHeight}mm Bench`;
      description += ` for ${benchType}`;

      configMap.set(configKey, {
        id: configKey,
        name: configName,
        description,
        doorType,
        dimensions: standardizedDimensions,
        orientation,
        drawerCount,
        finishType: variant.finish_type,
        variants: [variant]
      });
    } else {
      // Add variant to existing configuration
      const existingConfig = configMap.get(configKey)!;
      existingConfig.variants.push(variant);
    }
  });

  return Array.from(configMap.values()).sort((a, b) => {
    // Sort by bench height first, then door type, then dimensions
    const aHeight = getBenchHeight(a.dimensions);
    const bHeight = getBenchHeight(b.dimensions);
    
    if (aHeight !== bHeight) {
      return aHeight - bHeight;
    }
    
    const doorTypeOrder = ['Single-Door', 'Double-Door', 'Triple-Door', 'Combination', 'Drawer-Only'];
    const aDoorIndex = doorTypeOrder.indexOf(a.doorType);
    const bDoorIndex = doorTypeOrder.indexOf(b.doorType);
    
    if (aDoorIndex !== -1 && bDoorIndex !== -1) {
      return aDoorIndex - bDoorIndex;
    }
    
    return a.name.localeCompare(b.name);
  });
};

const ModularCabinetConfigurator: React.FC<ModularCabinetConfiguratorProps> = ({
  variants,
  selectedConfiguration,
  onConfigurationSelect,
  isLoading = false
}) => {
  const configurations = useMemo(() => {
    if (!variants || variants.length === 0) return [];
    return generateConfigurations(variants);
  }, [variants]);

  // Group configurations by bench height
  const configurationsByBench = useMemo(() => {
    const groups: Record<string, ModularCabinetConfiguration[]> = {};
    
    configurations.forEach(config => {
      const height = getBenchHeight(config.dimensions);
      const benchType = height === 650 ? '750mm Bench' : height === 800 ? '900mm Bench' : `${height}mm Bench`;
      
      if (!groups[benchType]) {
        groups[benchType] = [];
      }
      groups[benchType].push(config);
    });
    
    return groups;
  }, [configurations]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (configurations.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No cabinet configurations available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Select Cabinet Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Choose from {configurations.length} available configurations
        </p>
      </div>

      {Object.entries(configurationsByBench).map(([benchType, configs]) => (
        <div key={benchType} className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="w-4 h-4 text-primary" />
            <h4 className="font-medium text-primary">{benchType}</h4>
            <Badge variant="secondary">{configs.length} configurations</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configs.map((config) => (
              <Card 
                key={config.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedConfiguration?.id === config.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => onConfigurationSelect(config)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{config.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {config.finishType === 'PC' ? 'Powder Coat' : 'Stainless Steel'}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {config.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Ruler className="w-3 h-3" />
                      <span>{config.dimensions}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="w-3 h-3" />
                      <span>{config.doorType}</span>
                    </div>
                  </div>
                  
                  {config.variants.length > 1 && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        {config.variants.length} finish options available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {selectedConfiguration && (
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
                <span className="font-medium">{selectedConfiguration.name}</span>
                <Badge variant="secondary">
                  {selectedConfiguration.finishType === 'PC' ? 'Powder Coat' : 'Stainless Steel'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedConfiguration.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Dimensions: {selectedConfiguration.dimensions}</span>
                <span>Type: {selectedConfiguration.doorType}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModularCabinetConfigurator;
