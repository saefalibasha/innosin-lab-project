
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Palette, RotateCcw, Layers, DoorOpen, Ruler, Building2, Droplets, Wrench } from 'lucide-react';
import { Product } from '@/types/product';
import { OptimizedOverviewImage } from '@/components/common/OptimizedOverviewImage';

interface SpecificProductSelectorProps {
  products: Product[];
  productSeries: string;
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
}

export const SpecificProductSelector: React.FC<SpecificProductSelectorProps> = ({
  products,
  productSeries,
  selectedVariants,
  onVariantChange
}) => {
  // Helper function to clean product names
  const cleanProductName = (name: string): string => {
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

  // Emergency Shower Series configuration
  if (productSeries.toLowerCase().includes('emergency shower')) {
    const availableEmergencyTypes = Array.from(new Set(
      products.map(p => p.emergency_shower_type).filter(Boolean)
    ));

    const availableDimensions = sortDimensions(Array.from(new Set(
      products.map(p => p.dimensions).filter(Boolean)
    )));

    const availableFinishes = Array.from(new Set(
      products.map(p => p.finish_type).filter(Boolean)
    ));

    // Filter products based on selected variants
    const filteredProducts = products.filter(product => {
      if (selectedVariants.emergency_shower_type && product.emergency_shower_type !== selectedVariants.emergency_shower_type) return false;
      if (selectedVariants.dimensions && product.dimensions !== selectedVariants.dimensions) return false;
      if (selectedVariants.finish_type && product.finish_type !== selectedVariants.finish_type) return false;
      return true;
    });

    return (
      <div className="space-y-4">
        {/* Company Tag Display */}
        {products.length > 0 && products[0].company_tags && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Badge variant="default" className="text-sm bg-blue-500 hover:bg-blue-600">
              {products[0].company_tags[0]}
            </Badge>
          </div>
        )}

        {/* Emergency Shower Type Selection */}
        {availableEmergencyTypes.length > 0 && (
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
                {availableEmergencyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
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

        {/* Finish Type Selection */}
        {availableFinishes.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Palette className="h-3 w-3" />
              Finish Type:
            </label>
            <ToggleGroup
              type="single"
              value={selectedVariants.finish_type || ''}
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
                  {finish === 'PC' ? 'Powder Coat' : finish === 'SS304' ? 'Stainless Steel' : finish}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        {/* Filtered Products Display */}
        {filteredProducts.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Available Products: <Badge variant="outline" className="text-xs">{filteredProducts.length}</Badge>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <OptimizedOverviewImage
                    src={product.thumbnail_path || '/placeholder.svg'}
                    alt={product.name}
                    className="w-12 h-12 flex-shrink-0"
                    showCompanyTag={false}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{cleanProductName(product.name)}</div>
                    <div className="text-xs text-muted-foreground">{product.product_code}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // UNIFLEX Series configuration
  if (productSeries.toLowerCase().includes('uniflex')) {
    const availableMixingTypes = Array.from(new Set(
      products.map(p => p.mixing_type).filter(Boolean)
    ));

    const availableHandleTypes = Array.from(new Set(
      products.map(p => p.handle_type).filter(Boolean)
    ));

    const availableDimensions = sortDimensions(Array.from(new Set(
      products.map(p => p.dimensions).filter(Boolean)
    )));

    const availableFinishes = Array.from(new Set(
      products.map(p => p.finish_type).filter(Boolean)
    ));

    // Filter products based on selected variants
    const filteredProducts = products.filter(product => {
      if (selectedVariants.mixing_type && product.mixing_type !== selectedVariants.mixing_type) return false;
      if (selectedVariants.handle_type && product.handle_type !== selectedVariants.handle_type) return false;
      if (selectedVariants.dimensions && product.dimensions !== selectedVariants.dimensions) return false;
      if (selectedVariants.finish_type && product.finish_type !== selectedVariants.finish_type) return false;
      return true;
    });

    return (
      <div className="space-y-4">
        {/* Company Tag Display */}
        {products.length > 0 && products[0].company_tags && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Badge variant="default" className="text-sm bg-blue-500 hover:bg-blue-600">
              {products[0].company_tags[0]}
            </Badge>
          </div>
        )}

        {/* Mixing Type Selection */}
        {availableMixingTypes.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              Mixing Type:
            </label>
            <ToggleGroup
              type="single"
              value={selectedVariants.mixing_type || ''}
              onValueChange={(value) => onVariantChange('mixing_type', value)}
              className="justify-start"
            >
              {availableMixingTypes.map((type) => (
                <ToggleGroupItem
                  key={type}
                  value={type}
                  variant="outline"
                  className="text-xs h-8 px-3"
                >
                  {type}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        {/* Handle Type Selection */}
        {availableHandleTypes.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Wrench className="h-3 w-3" />
              Handle Type:
            </label>
            <ToggleGroup
              type="single"
              value={selectedVariants.handle_type || ''}
              onValueChange={(value) => onVariantChange('handle_type', value)}
              className="justify-start"
            >
              {availableHandleTypes.map((type) => (
                <ToggleGroupItem
                  key={type}
                  value={type}
                  variant="outline"
                  className="text-xs h-8 px-3"
                >
                  {type}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
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

        {/* Finish Type Selection */}
        {availableFinishes.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Palette className="h-3 w-3" />
              Finish Type:
            </label>
            <ToggleGroup
              type="single"
              value={selectedVariants.finish_type || ''}
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
                  {finish === 'PC' ? 'Powder Coat' : finish === 'SS304' ? 'Stainless Steel' : finish}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        {/* Filtered Products Display */}
        {filteredProducts.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Available Products: <Badge variant="outline" className="text-xs">{filteredProducts.length}</Badge>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <OptimizedOverviewImage
                    src={product.thumbnail_path || '/placeholder.svg'}
                    alt={product.name}
                    className="w-12 h-12 flex-shrink-0"
                    showCompanyTag={false}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{cleanProductName(product.name)}</div>
                    <div className="text-xs text-muted-foreground">{product.product_code}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Safe Aire II Fume Hoods configuration
  if (productSeries.toLowerCase().includes('safe aire')) {
    const availableMountingTypes = Array.from(new Set(
      products.map(p => p.mounting_type).filter(Boolean)
    ));

    const availableDimensions = sortDimensions(Array.from(new Set(
      products.map(p => p.dimensions).filter(Boolean)
    )));

    const availableFinishes = Array.from(new Set(
      products.map(p => p.finish_type).filter(Boolean)
    ));

    // Filter products based on selected variants
    const filteredProducts = products.filter(product => {
      if (selectedVariants.mounting_type && product.mounting_type !== selectedVariants.mounting_type) return false;
      if (selectedVariants.dimensions && product.dimensions !== selectedVariants.dimensions) return false;
      if (selectedVariants.finish_type && product.finish_type !== selectedVariants.finish_type) return false;
      return true;
    });

    return (
      <div className="space-y-4">
        {/* Company Tag Display */}
        {products.length > 0 && products[0].company_tags && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Badge variant="default" className="text-sm bg-blue-500 hover:bg-blue-600">
              {products[0].company_tags[0]}
            </Badge>
          </div>
        )}

        {/* Mounting Type Selection */}
        {availableMountingTypes.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Wrench className="h-3 w-3" />
              Mounting Type:
            </label>
            <ToggleGroup
              type="single"
              value={selectedVariants.mounting_type || ''}
              onValueChange={(value) => onVariantChange('mounting_type', value)}
              className="justify-start"
            >
              {availableMountingTypes.map((type) => (
                <ToggleGroupItem
                  key={type}
                  value={type}
                  variant="outline"
                  className="text-xs h-8 px-3"
                >
                  {type}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
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

        {/* Finish Type Selection */}
        {availableFinishes.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Palette className="h-3 w-3" />
              Finish Type:
            </label>
            <ToggleGroup
              type="single"
              value={selectedVariants.finish_type || ''}
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
                  {finish === 'PC' ? 'Powder Coat' : finish === 'SS304' ? 'Stainless Steel' : finish}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        {/* Filtered Products Display */}
        {filteredProducts.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Available Products: <Badge variant="outline" className="text-xs">{filteredProducts.length}</Badge>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <OptimizedOverviewImage
                    src={product.thumbnail_path || '/placeholder.svg'}
                    alt={product.name}
                    className="w-12 h-12 flex-shrink-0"
                    showCompanyTag={false}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{cleanProductName(product.name)}</div>
                    <div className="text-xs text-muted-foreground">{product.product_code}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // TANGERINE Series configuration
  if (productSeries.toLowerCase().includes('tangerine')) {
    const availableCabinetClasses = Array.from(new Set(
      products.map(p => p.cabinet_class).filter(Boolean)
    ));

    const availableFinishes = Array.from(new Set(
      products.map(p => p.finish_type).filter(Boolean)
    ));

    // Filter products based on selected variants
    const filteredProducts = products.filter(product => {
      if (selectedVariants.cabinet_class && product.cabinet_class !== selectedVariants.cabinet_class) return false;
      if (selectedVariants.finish_type && product.finish_type !== selectedVariants.finish_type) return false;
      return true;
    });

    return (
      <div className="space-y-4">
        {/* Company Tag Display */}
        {products.length > 0 && products[0].company_tags && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Badge variant="default" className="text-sm bg-blue-500 hover:bg-blue-600">
              {products[0].company_tags[0]}
            </Badge>
          </div>
        )}

        {/* Cabinet Class Selection */}
        {availableCabinetClasses.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Layers className="h-3 w-3" />
              Cabinet Class:
            </label>
            <ToggleGroup
              type="single"
              value={selectedVariants.cabinet_class || ''}
              onValueChange={(value) => onVariantChange('cabinet_class', value)}
              className="justify-start"
            >
              {availableCabinetClasses.map((cabinetClass) => (
                <ToggleGroupItem
                  key={cabinetClass}
                  value={cabinetClass}
                  variant="outline"
                  className="text-xs h-8 px-3"
                >
                  {cabinetClass}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
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
              value={selectedVariants.finish_type || ''}
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
                  {finish === 'PC' ? 'Powder Coat' : finish === 'SS304' ? 'Stainless Steel' : finish}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        {/* Filtered Products Display */}
        {filteredProducts.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Available Products: <Badge variant="outline" className="text-xs">{filteredProducts.length}</Badge>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <OptimizedOverviewImage
                    src={product.thumbnail_path || '/placeholder.svg'}
                    alt={product.name}
                    className="w-12 h-12 flex-shrink-0"
                    showCompanyTag={false}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{cleanProductName(product.name)}</div>
                    <div className="text-xs text-muted-foreground">{product.product_code}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // NOCE Series configuration
  if (productSeries.toLowerCase().includes('noce')) {
    const availableFinishes = Array.from(new Set(
      products.map(p => p.finish_type).filter(Boolean)
    ));

    // Filter products based on selected variants
    const filteredProducts = products.filter(product => {
      if (selectedVariants.finish_type && product.finish_type !== selectedVariants.finish_type) return false;
      return true;
    });

    return (
      <div className="space-y-4">
        {/* Company Tag Display */}
        {products.length > 0 && products[0].company_tags && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Badge variant="default" className="text-sm bg-blue-500 hover:bg-blue-600">
              {products[0].company_tags[0]}
            </Badge>
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
              value={selectedVariants.finish_type || ''}
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
                  {finish === 'PC' ? 'Powder Coat' : finish === 'SS304' ? 'Stainless Steel' : finish}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        {/* Filtered Products Display */}
        {filteredProducts.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Available Products: <Badge variant="outline" className="text-xs">{filteredProducts.length}</Badge>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <OptimizedOverviewImage
                    src={product.thumbnail_path || '/placeholder.svg'}
                    alt={product.name}
                    className="w-12 h-12 flex-shrink-0"
                    showCompanyTag={false}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{cleanProductName(product.name)}</div>
                    <div className="text-xs text-muted-foreground">{product.product_code}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default fallback for other series - show company tag if available
  if (products.length > 0 && products[0].company_tags && products[0].company_tags.length > 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <Badge variant="default" className="text-sm bg-blue-500 hover:bg-blue-600">
            {products[0].company_tags[0]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Product configuration not available for this series yet.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-4 text-muted-foreground">
      <p className="text-xs">No specific configuration available for this product series.</p>
    </div>
  );
};
