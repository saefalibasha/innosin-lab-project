
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ruler, Palette, Settings2, Grid3X3, RotateCcw } from 'lucide-react';

interface ProductVariant {
  id: string;
  name: string;
  product_code: string;
  category: string;
  dimensions: string;
  description: string;
  full_description: string;
  specifications: any;
  thumbnail_path: string;
  model_path: string;
  additional_images: string[];
  finish_type: string;
  orientation: string;
  door_type: string;
  variant_type: string;
  drawer_count?: number;
  parent_series_id: string;
}

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  selectedFinish: string;
  onFinishChange: (finish: string) => void;
  groupByDimensions?: boolean;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariantId,
  onVariantChange,
  selectedFinish,
  onFinishChange,
  groupByDimensions = true
}) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  const selectedVariant = variants.find(v => v.id === selectedVariantId);

  // Get unique dimensions and sort by length value (smallest to largest)
  const uniqueDimensions = [...new Set(variants.map(v => v.dimensions || 'Standard'))]
    .sort((a, b) => {
      // Extract the length value from dimension strings (e.g., "1200 x 600 x 800" -> 1200)
      const getLengthValue = (dim: string) => {
        const match = dim.match(/^(\d+)/);
        return match ? parseInt(match[1]) : 0;
      };
      return getLengthValue(a) - getLengthValue(b);
    });
  
  // Get selected dimension
  const selectedDimension = selectedVariant?.dimensions || uniqueDimensions[0];

  // Get available drawer counts for selected dimension
  const getAvailableDrawerCounts = (dimension: string) => {
    const dimensionVariants = variants.filter(v => v.dimensions === dimension);
    const drawerCounts = dimensionVariants
      .map(v => v.drawer_count)
      .filter(count => count !== undefined && count !== null)
      .sort((a, b) => a! - b!);
    return [...new Set(drawerCounts)] as number[];
  };

  const availableDrawerCounts = getAvailableDrawerCounts(selectedDimension);
  const selectedDrawerCount = selectedVariant?.drawer_count || (availableDrawerCounts[0] || null);

  // Get available orientations for selected dimension and drawer count
  const getAvailableOrientations = (dimension: string, drawerCount: number | null) => {
    let dimensionVariants = variants.filter(v => v.dimensions === dimension);
    
    if (drawerCount !== null) {
      dimensionVariants = dimensionVariants.filter(v => v.drawer_count === drawerCount);
    }
    
    const orientations = dimensionVariants
      .map(v => v.orientation)
      .filter(o => o && o !== 'None' && (o === 'LH' || o === 'RH'));
    
    return [...new Set(orientations)] as ('LH' | 'RH')[];
  };

  const availableOrientations = getAvailableOrientations(selectedDimension, selectedDrawerCount);
  const selectedOrientation = selectedVariant?.orientation && selectedVariant.orientation !== 'None' 
    ? selectedVariant.orientation as 'LH' | 'RH'
    : (availableOrientations[0] || null);

  // Find the best matching variant based on all criteria
  const findMatchingVariant = (dimension: string, drawerCount: number | null, orientation: 'LH' | 'RH' | null) => {
    let filtered = variants.filter(v => v.dimensions === dimension);
    
    if (drawerCount !== null) {
      filtered = filtered.filter(v => v.drawer_count === drawerCount);
    }
    
    if (orientation) {
      filtered = filtered.filter(v => v.orientation === orientation);
    }
    
    return filtered[0] || variants.find(v => v.dimensions === dimension);
  };

  // Handle dimension change
  const handleDimensionChange = (dimensions: string) => {
    const newDrawerCounts = getAvailableDrawerCounts(dimensions);
    const newDrawerCount = newDrawerCounts[0] || null;
    const newOrientations = getAvailableOrientations(dimensions, newDrawerCount);
    const newOrientation = newOrientations[0] || null;
    
    const variant = findMatchingVariant(dimensions, newDrawerCount, newOrientation);
    if (variant) {
      onVariantChange(variant.id);
    }
  };

  // Handle drawer count change
  const handleDrawerCountChange = (drawerCount: number) => {
    const newOrientations = getAvailableOrientations(selectedDimension, drawerCount);
    const newOrientation = newOrientations[0] || null;
    
    const variant = findMatchingVariant(selectedDimension, drawerCount, newOrientation);
    if (variant) {
      onVariantChange(variant.id);
    }
  };

  // Handle orientation change
  const handleOrientationChange = (orientation: 'LH' | 'RH') => {
    const variant = findMatchingVariant(selectedDimension, selectedDrawerCount, orientation);
    if (variant) {
      onVariantChange(variant.id);
    }
  };

  // Available finish options
  const finishOptions = [
    { value: 'PC', label: 'Powder Coat', description: 'Durable powder coating finish' },
    { value: 'SS', label: 'Stainless Steel', description: 'Premium stainless steel finish' }
  ];

  return (
    <Card className="shadow-sm border-muted">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Settings2 className="w-5 h-5 text-primary" />
          Product Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dimension Selection */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-semibold text-foreground">Dimensions</h4>
          </div>
          <Select value={selectedDimension} onValueChange={handleDimensionChange}>
            <SelectTrigger className="w-full h-11 border-muted">
              <SelectValue placeholder="Select dimensions" />
            </SelectTrigger>
            <SelectContent>
              {uniqueDimensions.map((dimension) => (
                <SelectItem key={dimension} value={dimension} className="py-2">
                  {dimension}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Drawer Count Selection */}
        {availableDrawerCounts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Grid3X3 className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-semibold text-foreground">Number of Drawers</h4>
            </div>
            <div className="flex gap-2 flex-wrap">
              {availableDrawerCounts.map((count) => (
                <Button
                  key={count}
                  variant={selectedDrawerCount === count ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDrawerCountChange(count)}
                  className="transition-all duration-200"
                >
                  {count} {count === 1 ? 'Drawer' : 'Drawers'}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Orientation Selection */}
        {availableOrientations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-semibold text-foreground">Orientation</h4>
            </div>
            <div className="flex gap-2">
              {availableOrientations.map((orientation) => (
                <Button
                  key={orientation}
                  variant={selectedOrientation === orientation ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleOrientationChange(orientation)}
                  className="transition-all duration-200 min-w-20"
                >
                  {orientation === 'LH' ? 'Left Hand' : 'Right Hand'}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Finish Selection */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-semibold text-foreground">Finish Type</h4>
          </div>
          <RadioGroup value={selectedFinish} onValueChange={onFinishChange} className="space-y-3">
            {finishOptions.map((finish) => (
              <div key={finish.value} className="flex items-start space-x-3 p-3 rounded-lg border border-muted hover:bg-muted/30 transition-colors">
                <RadioGroupItem value={finish.value} id={finish.value} className="mt-1" />
                <div className="flex-1 min-w-0">
                  <Label htmlFor={finish.value} className="cursor-pointer font-medium text-foreground">
                    {finish.label}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {finish.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Selected Configuration Summary */}
        {selectedVariant && (
          <div className="bg-muted/30 p-4 rounded-lg border">
            <h4 className="font-semibold text-foreground mb-3 text-base">Selected Configuration</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-foreground">Product Code:</span>
                <p className="text-muted-foreground">{selectedVariant.product_code}</p>
              </div>
              <div>
                <span className="font-medium text-foreground">Dimensions:</span>
                <p className="text-muted-foreground">{selectedVariant.dimensions}</p>
              </div>
              {selectedDrawerCount && (
                <div>
                  <span className="font-medium text-foreground">Drawers:</span>
                  <p className="text-muted-foreground">{selectedDrawerCount}</p>
                </div>
              )}
              {selectedOrientation && (
                <div>
                  <span className="font-medium text-foreground">Orientation:</span>
                  <p className="text-muted-foreground">{selectedOrientation === 'LH' ? 'Left Hand' : 'Right Hand'}</p>
                </div>
              )}
              <div>
                <span className="font-medium text-foreground">Finish:</span>
                <p className="text-muted-foreground">{selectedFinish === 'PC' ? 'Powder Coat' : 'Stainless Steel'}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VariantSelector;
