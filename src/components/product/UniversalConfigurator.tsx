import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Ruler, Settings, Layers, ArrowRight, DoorClosed, Palette, RotateCcw } from 'lucide-react';

interface ProductVariant {
  id: string;
  name: string;
  product_code: string;
  dimensions: string;
  finish_type: string;
  orientation?: string;
  door_type?: string;
  drawer_count?: number;
  thumbnail_path: string;
  model_path: string;
  additional_images: string[];
}

interface ConfigurationTerm {
  name: string;
  type: 'select' | 'button' | 'number';
  values: string[];
  icon?: React.ComponentType<{ className?: string }>;
  required: boolean;
  displayName: string;
}

interface UniversalConfiguration {
  terms: Record<string, string>;
  variants: ProductVariant[];
  isValid: boolean;
}

interface UniversalConfiguratorProps {
  variants: ProductVariant[];
  selectedConfiguration?: UniversalConfiguration | null;
  onConfigurationSelect: (configuration: UniversalConfiguration) => void;
  isLoading?: boolean;
}

// Helper functions for parsing and standardizing values
const standardizeDimensions = (dimensions: string): string => {
  if (!dimensions) return '';
  const cleanDimensions = dimensions.replace(/mm$/i, '').trim();
  const normalized = cleanDimensions
    .replace(/[×x*]/gi, ' × ')
    .replace(/\s+/g, ' ')
    .trim();
  return `${normalized} mm`;
};

const standardizeFinishType = (finishType: string): string => {
  if (!finishType) return '';
  const upperFinish = finishType.toUpperCase();
  if (upperFinish === 'SS304') return 'SS';
  return upperFinish;
};

const standardizeOrientation = (orientation: string): string => {
  if (!orientation || orientation === 'None' || orientation === 'null' || orientation === 'undefined') {
    return 'None';
  }
  const orientationMap: { [key: string]: string } = {
    'Left-Handed': 'LH',
    'Right-Handed': 'RH',
    'LH': 'LH',
    'RH': 'RH'
  };
  return orientationMap[orientation] || orientation;
};

const getDisplayValue = (termName: string, value: string): string => {
  switch (termName) {
    case 'finish_type':
      return value === 'PC' ? 'Powder Coat' : value === 'SS' ? 'Stainless Steel' : value;
    case 'orientation':
      return value === 'LH' ? 'Left Hand' : value === 'RH' ? 'Right Hand' : value;
    case 'drawer_count':
      const count = parseInt(value);
      return count === 0 ? 'No Drawers' : `${count} Drawer${count > 1 ? 's' : ''}`;
    default:
      return value;
  }
};

const getTermIcon = (termName: string) => {
  switch (termName) {
    case 'dimensions':
      return Ruler;
    case 'finish_type':
      return Palette;
    case 'orientation':
      return RotateCcw;
    case 'door_type':
      return DoorClosed;
    case 'drawer_count':
      return Layers;
    default:
      return Settings;
  }
};

const UniversalConfigurator: React.FC<UniversalConfiguratorProps> = ({
  variants,
  selectedConfiguration,
  onConfigurationSelect,
  isLoading = false
}) => {
  const [selectedTerms, setSelectedTerms] = useState<Record<string, string>>({});

  // Analyze variants to extract available configuration terms
  const configurationTerms = useMemo(() => {
    if (variants.length === 0) return {};

    const terms: Record<string, ConfigurationTerm> = {};

    // Always include dimensions if available
    const dimensions = new Set<string>();
    variants.forEach(variant => {
      if (variant.dimensions) {
        dimensions.add(standardizeDimensions(variant.dimensions));
      }
    });
    if (dimensions.size > 0) {
      terms.dimensions = {
        name: 'dimensions',
        type: 'select',
        values: Array.from(dimensions).sort(),
        icon: getTermIcon('dimensions'),
        required: true,
        displayName: 'Dimensions'
      };
    }

    // Include finish types if available
    const finishTypes = new Set<string>();
    variants.forEach(variant => {
      if (variant.finish_type) {
        finishTypes.add(standardizeFinishType(variant.finish_type));
      }
    });
    if (finishTypes.size > 1) { // Only show if multiple options
      terms.finish_type = {
        name: 'finish_type',
        type: 'button',
        values: Array.from(finishTypes).sort(),
        icon: getTermIcon('finish_type'),
        required: true,
        displayName: 'Finish'
      };
    }

    // Include orientations if available
    const orientations = new Set<string>();
    variants.forEach(variant => {
      const orientation = standardizeOrientation(variant.orientation);
      if (orientation && orientation !== 'None') {
        orientations.add(orientation);
      }
    });
    if (orientations.size > 0) {
      terms.orientation = {
        name: 'orientation',
        type: 'button',
        values: Array.from(orientations).sort(),
        icon: getTermIcon('orientation'),
        required: false,
        displayName: 'Orientation'
      };
    }

    // Include door types if available
    const doorTypes = new Set<string>();
    variants.forEach(variant => {
      if (variant.door_type) {
        doorTypes.add(variant.door_type);
      }
    });
    if (doorTypes.size > 1) { // Only show if multiple options
      terms.door_type = {
        name: 'door_type',
        type: 'button',
        values: Array.from(doorTypes).sort(),
        icon: getTermIcon('door_type'),
        required: false,
        displayName: 'Door Type'
      };
    }

    // Include drawer counts if available
    const drawerCounts = new Set<string>();
    variants.forEach(variant => {
      if (variant.drawer_count !== undefined && variant.drawer_count !== null) {
        drawerCounts.add(variant.drawer_count.toString());
      }
    });
    if (drawerCounts.size > 1) { // Only show if multiple options
      terms.drawer_count = {
        name: 'drawer_count',
        type: 'select',
        values: Array.from(drawerCounts).sort((a, b) => parseInt(a) - parseInt(b)),
        icon: getTermIcon('drawer_count'),
        required: false,
        displayName: 'Drawer Count'
      };
    }

    return terms;
  }, [variants]);

  // Get available values for a term based on current selections
  const getAvailableValues = (termName: string): string[] => {
    const term = configurationTerms[termName];
    if (!term) return [];

    // Filter variants based on current selections (excluding this term)
    let filteredVariants = variants.filter(variant => {
      return Object.entries(selectedTerms).every(([selectedTermName, selectedValue]) => {
        if (selectedTermName === termName) return true; // Skip current term
        if (!selectedValue) return true; // Skip unselected terms

        switch (selectedTermName) {
          case 'dimensions':
            return standardizeDimensions(variant.dimensions) === selectedValue;
          case 'finish_type':
            return standardizeFinishType(variant.finish_type) === selectedValue;
          case 'orientation':
            return standardizeOrientation(variant.orientation) === selectedValue;
          case 'door_type':
            return variant.door_type === selectedValue;
          case 'drawer_count':
            return variant.drawer_count?.toString() === selectedValue;
          default:
            return true;
        }
      });
    });

    // Extract available values for this term from filtered variants
    const availableValues = new Set<string>();
    filteredVariants.forEach(variant => {
      let value: string = '';
      switch (termName) {
        case 'dimensions':
          value = standardizeDimensions(variant.dimensions);
          break;
        case 'finish_type':
          value = standardizeFinishType(variant.finish_type);
          break;
        case 'orientation':
          value = standardizeOrientation(variant.orientation);
          if (value === 'None') return; // Skip 'None' orientations
          break;
        case 'door_type':
          value = variant.door_type || '';
          break;
        case 'drawer_count':
          value = variant.drawer_count?.toString() || '';
          break;
      }
      if (value) {
        availableValues.add(value);
      }
    });

    return Array.from(availableValues).sort();
  };

  // Find matching variants for current configuration
  const getMatchingVariants = (): ProductVariant[] => {
    return variants.filter(variant => {
      return Object.entries(selectedTerms).every(([termName, selectedValue]) => {
        if (!selectedValue) return true; // Skip unselected terms

        switch (termName) {
          case 'dimensions':
            return standardizeDimensions(variant.dimensions) === selectedValue;
          case 'finish_type':
            return standardizeFinishType(variant.finish_type) === selectedValue;
          case 'orientation':
            const variantOrientation = standardizeOrientation(variant.orientation);
            return variantOrientation === selectedValue || variantOrientation === 'None';
          case 'door_type':
            return variant.door_type === selectedValue;
          case 'drawer_count':
            return variant.drawer_count?.toString() === selectedValue;
          default:
            return true;
        }
      });
    });
  };

  // Check if current configuration is valid
  const isConfigurationValid = (): boolean => {
    const requiredTerms = Object.values(configurationTerms).filter(term => term.required);
    const hasAllRequired = requiredTerms.every(term => selectedTerms[term.name]);
    const hasMatchingVariants = getMatchingVariants().length > 0;
    return hasAllRequired && hasMatchingVariants;
  };

  // Handle term value changes
  const handleTermChange = (termName: string, value: string) => {
    const newSelectedTerms = { ...selectedTerms, [termName]: value };
    setSelectedTerms(newSelectedTerms);

    // Clear dependent terms that are no longer valid
    const availableTerms = Object.keys(configurationTerms);
    availableTerms.forEach(otherTermName => {
      if (otherTermName !== termName && newSelectedTerms[otherTermName]) {
        const availableValues = getAvailableValues(otherTermName);
        if (!availableValues.includes(newSelectedTerms[otherTermName])) {
          newSelectedTerms[otherTermName] = '';
        }
      }
    });

    setSelectedTerms(newSelectedTerms);
  };

  // Auto-select configuration when valid
  useEffect(() => {
    if (isConfigurationValid()) {
      const matchingVariants = getMatchingVariants();
      const configuration: UniversalConfiguration = {
        terms: selectedTerms,
        variants: matchingVariants,
        isValid: true
      };
      onConfigurationSelect(configuration);
    }
  }, [selectedTerms]);

  // Clear selections when variants change
  useEffect(() => {
    setSelectedTerms({});
  }, [variants]);

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
        <p className="text-muted-foreground">No product configurations available</p>
      </div>
    );
  }

  const termEntries = Object.entries(configurationTerms);
  if (termEntries.length === 0) {
    return (
      <div className="text-center py-8">
        <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No configuration options available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration Steps */}
      {termEntries.map(([termName, term], index) => {
        const availableValues = getAvailableValues(termName);
        const selectedValue = selectedTerms[termName] || '';
        const Icon = term.icon || Settings;

        return (
          <div key={termName} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                {index + 1}
              </div>
              <label className="text-sm font-medium">{term.displayName}</label>
              <Icon className="w-4 h-4 text-muted-foreground" />
              {term.required && <span className="text-red-500 text-xs">*</span>}
            </div>

            {term.type === 'select' && (
              <Select value={selectedValue} onValueChange={(value) => handleTermChange(termName, value)}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${term.displayName.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {availableValues.map(value => (
                    <SelectItem key={value} value={value}>
                      {getDisplayValue(termName, value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {term.type === 'button' && (
              <div className="flex gap-2 flex-wrap">
                {availableValues.map(value => (
                  <Button
                    key={value}
                    variant={selectedValue === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTermChange(termName, value)}
                    className="transition-all duration-200"
                  >
                    {getDisplayValue(termName, value)}
                  </Button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Configuration Summary */}
      {Object.keys(selectedTerms).some(key => selectedTerms[key]) && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-4 h-4" />
              Configuration Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(selectedTerms).map(([termName, value]) => {
                if (!value) return null;
                const term = configurationTerms[termName];
                return (
                  <div key={termName} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{term.displayName}:</span>
                    <Badge variant="secondary">
                      {getDisplayValue(termName, value)}
                    </Badge>
                  </div>
                );
              })}
              {isConfigurationValid() && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant="default" className="bg-green-600">
                    Valid Configuration
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UniversalConfigurator;