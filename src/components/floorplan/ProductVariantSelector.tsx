
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Palette, RotateCcw, Layers, DoorOpen, Ruler, Building2, Droplets, Wrench, Mountain } from 'lucide-react';
import { Product } from '@/types/product';
import { SpecificProductSelector } from './SpecificProductSelector';
import { OptimizedOverviewImage } from '@/components/common/OptimizedOverviewImage';

interface ProductVariantSelectorProps {
  products: Product[];
  selectedVariants: {
    finish?: string;
    orientation?: string;
    drawerCount?: string;
    doorType?: string;
    dimensions?: string;
    mounting_type?: string;
    mixing_type?: string;
    handle_type?: string;
    emergency_shower_type?: string;
    cabinet_class?: string;
    finish_type?: string;
  };
  onVariantChange: (variantType: string, value: string) => void;
  onProductSelect: (product: Product) => void;
  selectedProduct?: Product;
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  products,
  selectedVariants,
  onVariantChange,
  onProductSelect,
  selectedProduct
}) => {
  // Helper function to clean product names by removing part numbers in parentheses
  const cleanProductName = (name: string): string => {
    // Remove everything in parentheses and any trailing/leading whitespace
    return name.replace(/\s*\([^)]*\)\s*/g, '').trim();
  };

  // Helper function to extract first numeric value from dimension string
  const extractFirstNumeric = (dimension: string): number => {
    const match = dimension.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Helper function to sort dimensions numerically by first value
  const sortDimensions = (dimensions: string[]): string[] => {
    return [...dimensions].sort((a, b) => {
      const numA = extractFirstNumeric(a);
      const numB = extractFirstNumeric(b);
      return numA - numB;
    });
  };

  // Check if this is a specific product series that needs custom handling
  const productSeries = products.length > 0 ? products[0].product_series || '' : '';
  const productName = products.length > 0 ? products[0].name?.toLowerCase() || '' : '';
  const category = products.length > 0 ? products[0].category?.toLowerCase() || '' : '';
  
  // Updated detection logic based on actual database content
  const isSpecificSeries = 
    // Emergency Shower detection - check for exact series name or partial matches
    productSeries.toLowerCase().includes('emergency shower') || 
    productName.includes('emergency shower') ||
    category.includes('emergency shower') ||
    productSeries === 'Broen-Lab Emergency Shower Series' ||
    // UNIFLEX detection - check for exact series name or partial matches
    productSeries.toLowerCase().includes('uniflex') ||
    productName.includes('uniflex') ||
    productSeries === 'Broen-Lab UNIFLEX Taps Series' ||
    // Safe Aire detection - check for exact series name or partial matches
    productSeries.toLowerCase().includes('safe aire') || 
    productName.includes('safe aire') ||
    productSeries === 'Safe Aire II Fume Hoods' ||
    // TANGERINE detection
    productSeries.toLowerCase().includes('tangerine') ||
    productName.includes('tangerine') ||
    // NOCE detection
    productSeries.toLowerCase().includes('noce') ||
    productName.includes('noce');

  // Extract available variant options from products
  const availableFinishes = Array.from(new Set(
    products.map(p => p.finish_type).filter(Boolean)
  ));
  
  const availableOrientations = Array.from(new Set(
    products.map(p => p.orientation).filter(Boolean)
  ));
  
  const availableDrawerCounts = Array.from(new Set(
    products.map(p => p.drawer_count?.toString()).filter(Boolean)
  ));
  
  const availableDoorTypes = Array.from(new Set(
    products.map(p => p.door_type).filter(Boolean)
  ));
  
  const availableDimensions = sortDimensions(Array.from(new Set(
    products.map(p => p.dimensions).filter(Boolean)
  )));

  // New variant options for specific series
  const availableMountingTypes = Array.from(new Set(
    products.map(p => p.mounting_type).filter(Boolean)
  ));

  const availableMixingTypes = Array.from(new Set(
    products.map(p => p.mixing_type).filter(Boolean)
  ));

  const availableHandleTypes = Array.from(new Set(
    products.map(p => p.handle_type).filter(Boolean)
  ));

  const availableEmergencyShowerTypes = Array.from(new Set(
    products.map(p => p.emergency_shower_type).filter(Boolean)
  ));

  // Filter products based on selected variants
  const filteredProducts = products.filter(product => {
    if (selectedVariants.finish && product.finish_type !== selectedVariants.finish) return false;
    if (selectedVariants.finish_type && product.finish_type !== selectedVariants.finish_type) return false;
    if (selectedVariants.orientation && product.orientation !== selectedVariants.orientation) return false;
    if (selectedVariants.drawerCount && product.drawer_count?.toString() !== selectedVariants.drawerCount) return false;
    if (selectedVariants.doorType && product.door_type !== selectedVariants.doorType) return false;
    if (selectedVariants.dimensions && product.dimensions !== selectedVariants.dimensions) return false;
    if (selectedVariants.mounting_type && product.mounting_type !== selectedVariants.mounting_type) return false;
    if (selectedVariants.mixing_type && product.mixing_type !== selectedVariants.mixing_type) return false;
    if (selectedVariants.handle_type && product.handle_type !== selectedVariants.handle_type) return false;
    if (selectedVariants.emergency_shower_type && product.emergency_shower_type !== selectedVariants.emergency_shower_type) return false;
    if (selectedVariants.cabinet_class && product.cabinet_class !== selectedVariants.cabinet_class) return false;
    return true;
  });

  const getFinishDisplayName = (finish: string) => {
    const finishMap: Record<string, string> = {
      'PC': 'Powder Coat',
      'SS304': 'Stainless Steel',
      'powder-coat': 'Powder Coat',
      'stainless-steel': 'Stainless Steel'
    };
    return finishMap[finish] || finish;
  };

  const getOrientationDisplayName = (orientation: string) => {
    const orientationMap: Record<string, string> = {
      'LH': 'Left Hand',
      'RH': 'Right Hand',
      'Left-Handed': 'Left Hand',
      'Right-Handed': 'Right Hand'
    };
    return orientationMap[orientation] || orientation;
  };

  return (
    <div className="space-y-4">
      {/* Company Tags Display */}
      {products.length > 0 && products[0].company_tags && products[0].company_tags.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1">
            {products[0].company_tags.map((tag, index) => (
              <Badge key={index} variant="default" className="text-xs bg-blue-500 hover:bg-blue-600">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Specific Product Series Selector */}
      {isSpecificSeries && (
        <SpecificProductSelector
          products={products}
          productSeries={productSeries}
          selectedVariants={selectedVariants}
          onVariantChange={onVariantChange}
        />
      )}

      {/* Standard variant selectors for non-specific series */}
      {!isSpecificSeries && (
        <>
          {/* Emergency Shower Type Selection - for Emergency Shower Series */}
          {availableEmergencyShowerTypes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                Emergency Shower Type:
              </label>
              <Select
                value={selectedVariants.emergency_shower_type || ''}
                onValueChange={(value) => onVariantChange('emergency_shower_type', value)}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select emergency shower type" />
                </SelectTrigger>
                <SelectContent>
                  {availableEmergencyShowerTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Mounting Type Selection - for Emergency Shower and Safe Aire II */}
          {availableMountingTypes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Mountain className="h-3 w-3" />
                Mounting Type:
              </label>
              <Select
                value={selectedVariants.mounting_type || ''}
                onValueChange={(value) => onVariantChange('mounting_type', value)}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select mounting type" />
                </SelectTrigger>
                <SelectContent>
                  {availableMountingTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Mixing Type Selection - for UNIFLEX Series */}
          {availableMixingTypes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                Mixing Type:
              </label>
              <Select
                value={selectedVariants.mixing_type || ''}
                onValueChange={(value) => onVariantChange('mixing_type', value)}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select mixing type" />
                </SelectTrigger>
                <SelectContent>
                  {availableMixingTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Handle Type Selection - for UNIFLEX Series */}
          {availableHandleTypes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Wrench className="h-3 w-3" />
                Handle Type:
              </label>
              <Select
                value={selectedVariants.handle_type || ''}
                onValueChange={(value) => onVariantChange('handle_type', value)}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select handle type" />
                </SelectTrigger>
                <SelectContent>
                  {availableHandleTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Finish Type Selection */}
          {availableFinishes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Palette className="h-3 w-3" />
                Finish Type:
              </label>
              <ToggleGroup
                type="single"
                value={selectedVariants.finish || selectedVariants.finish_type || ''}
                onValueChange={(value) => onVariantChange('finish_type', value)}
                className="justify-start"
              >
                {availableFinishes.map((finish) => (
                  <ToggleGroupItem
                    key={finish}
                    value={finish}
                    variant="outline"
                    className="text-xs h-8 px-3"
                  >
                    {getFinishDisplayName(finish)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}

          {/* Orientation Selection */}
          {availableOrientations.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <RotateCcw className="h-3 w-3" />
                Orientation:
              </label>
              <div className="flex gap-2">
                {availableOrientations.map((orientation) => (
                  <Button
                    key={orientation}
                    variant={selectedVariants.orientation === orientation ? "default" : "outline"}
                    size="sm"
                    onClick={() => onVariantChange('orientation', orientation)}
                    className="text-xs h-8 px-3"
                  >
                    {getOrientationDisplayName(orientation)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Drawer Count Selection */}
          {availableDrawerCounts.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Layers className="h-3 w-3" />
                Drawer Count:
              </label>
              <Select
                value={selectedVariants.drawerCount || ''}
                onValueChange={(value) => onVariantChange('drawerCount', value)}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select drawer count" />
                </SelectTrigger>
                <SelectContent>
                  {availableDrawerCounts.map((count) => (
                    <SelectItem key={count} value={count}>
                      {count} {count === '1' ? 'Drawer' : 'Drawers'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Door Type Selection */}
          {availableDoorTypes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <DoorOpen className="h-3 w-3" />
                Door Type:
              </label>
              <Select
                value={selectedVariants.doorType || ''}
                onValueChange={(value) => onVariantChange('doorType', value)}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select door type" />
                </SelectTrigger>
                <SelectContent>
                  {availableDoorTypes.map((doorType) => (
                    <SelectItem key={doorType} value={doorType}>
                      {doorType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Dimensions Selection */}
          {availableDimensions.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Ruler className="h-3 w-3" />
                Dimensions:
              </label>
              <Select
                value={selectedVariants.dimensions || ''}
                onValueChange={(value) => onVariantChange('dimensions', value)}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select dimensions" />
                </SelectTrigger>
                <SelectContent>
                  {availableDimensions.map((dimension) => (
                    <SelectItem key={dimension} value={dimension}>
                      {dimension}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      {/* Product Selection */}
      {filteredProducts.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Available Products: <Badge variant="outline" className="text-xs">{filteredProducts.length}</Badge>
          </label>
          <div className="grid grid-cols-1 gap-2">
            {filteredProducts.map((product) => (
              <Button
                key={product.id}
                variant={selectedProduct?.id === product.id ? "default" : "outline"}
                className="w-full p-3 h-auto justify-start text-left"
                onClick={() => onProductSelect(product)}
              >
                <div className="flex items-center gap-3 w-full">
                  <OptimizedOverviewImage
                    src={product.thumbnail_path || '/placeholder.svg'}
                    alt={product.name}
                    className="w-10 h-10 flex-shrink-0"
                    showCompanyTag={false}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs truncate">{cleanProductName(product.name)}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {product.product_code}
                    </div>
                    {product.company_tags && product.company_tags.length > 0 && (
                      <Badge variant="default" className="text-xs mt-1 bg-blue-500 hover:bg-blue-600">
                        {product.company_tags[0]}
                      </Badge>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-xs">No products match the selected variants</p>
        </div>
      )}
    </div>
  );
};
