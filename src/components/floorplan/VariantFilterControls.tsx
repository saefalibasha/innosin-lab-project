import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface VariantFilterControlsProps {
  availableVariants: {
    finishes: string[];
    orientations: string[];
    drawerCounts: number[];
    doorTypes: string[];
    dimensions: string[];
    mountingTypes?: string[];
    mixingTypes?: string[];
    handleTypes?: string[];
    cabinetClasses?: string[];
  };
  activeFilters: Record<string, any>;
  onFilterChange: (filterKey: string, value: string | null) => void;
  onClearFilters: () => void;
}

const VariantFilterControls: React.FC<VariantFilterControlsProps> = ({
  availableVariants,
  activeFilters,
  onFilterChange,
  onClearFilters,
}) => {
  const hasActiveFilters = Object.keys(activeFilters).some(key => activeFilters[key]);

  return (
    <div className="space-y-3 p-3 border-b bg-muted/50">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Filter Variants</h4>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-6 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 text-xs">
        {availableVariants.finishes.length > 0 && (
          <Select
            value={activeFilters.finish || ""}
            onValueChange={(value) => onFilterChange('finish', value || null)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Finish" />
            </SelectTrigger>
            <SelectContent>
              {availableVariants.finishes.map((finish) => (
                <SelectItem key={finish} value={finish}>
                  {finish}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {availableVariants.orientations.length > 0 && (
          <Select
            value={activeFilters.orientation || ""}
            onValueChange={(value) => onFilterChange('orientation', value || null)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Orientation" />
            </SelectTrigger>
            <SelectContent>
              {availableVariants.orientations.map((orientation) => (
                <SelectItem key={orientation} value={orientation}>
                  {orientation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {availableVariants.drawerCounts.length > 0 && (
          <Select
            value={activeFilters.drawerCount || ""}
            onValueChange={(value) => onFilterChange('drawerCount', value || null)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Drawers" />
            </SelectTrigger>
            <SelectContent>
              {availableVariants.drawerCounts.map((count) => (
                <SelectItem key={count} value={String(count)}>
                  {count} Drawers
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {availableVariants.doorTypes.length > 0 && (
          <Select
            value={activeFilters.doorType || ""}
            onValueChange={(value) => onFilterChange('doorType', value || null)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Door Type" />
            </SelectTrigger>
            <SelectContent>
              {availableVariants.doorTypes.map((doorType) => (
                <SelectItem key={doorType} value={doorType}>
                  {doorType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {availableVariants.dimensions.length > 1 && (
          <Select
            value={activeFilters.dimensions || ""}
            onValueChange={(value) => onFilterChange('dimensions', value || null)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {availableVariants.dimensions.map((dimension) => (
                <SelectItem key={dimension} value={dimension}>
                  {dimension}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {availableVariants.mountingTypes?.length > 0 && (
          <Select
            value={activeFilters.mountingType || ""}
            onValueChange={(value) => onFilterChange('mountingType', value || null)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Mounting" />
            </SelectTrigger>
            <SelectContent>
              {availableVariants.mountingTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {availableVariants.mixingTypes?.length > 0 && (
          <Select
            value={activeFilters.mixingType || ""}
            onValueChange={(value) => onFilterChange('mixingType', value || null)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Mixing" />
            </SelectTrigger>
            <SelectContent>
              {availableVariants.mixingTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {availableVariants.handleTypes?.length > 0 && (
          <Select
            value={activeFilters.handleType || ""}
            onValueChange={(value) => onFilterChange('handleType', value || null)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Handle" />
            </SelectTrigger>
            <SelectContent>
              {availableVariants.handleTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {availableVariants.cabinetClasses?.length > 0 && (
          <Select
            value={activeFilters.cabinetClass || ""}
            onValueChange={(value) => onFilterChange('cabinetClass', value || null)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Cabinet Class" />
            </SelectTrigger>
            <SelectContent>
              {availableVariants.cabinetClasses.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

export default VariantFilterControls;