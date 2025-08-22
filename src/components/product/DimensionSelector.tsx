import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseDimensionString } from '@/utils/dimensionUtils';

interface DimensionSelectorProps {
  variants: any[];
  selectedWidth: string;
  selectedDepth: string;
  selectedHeight: string;
  onWidthChange: (width: string) => void;
  onDepthChange: (depth: string) => void;
  onHeightChange: (height: string) => void;
  className?: string;
}

export const DimensionSelector: React.FC<DimensionSelectorProps> = ({
  variants,
  selectedWidth,
  selectedDepth,
  selectedHeight,
  onWidthChange,
  onDepthChange,
  onHeightChange,
  className = ''
}) => {
  // Extract unique width, depth, and height options from dimensions
  const { widths, depths, heights } = React.useMemo(() => {
    const dimensionStrings = variants.map(v => v.dimensions).filter(Boolean);
    const widthSet = new Set<string>();
    const depthSet = new Set<string>();
    const heightSet = new Set<string>();

    dimensionStrings.forEach(dimStr => {
      const parsed = parseDimensionString(dimStr);
      if (parsed) {
        widthSet.add(parsed.width.toString());
        depthSet.add(parsed.depth.toString());
        heightSet.add(parsed.height.toString());
      }
    });

    const sortedWidths = Array.from(widthSet).sort((a, b) => parseInt(a) - parseInt(b));
    const sortedDepths = Array.from(depthSet).sort((a, b) => parseInt(a) - parseInt(b));
    const sortedHeights = Array.from(heightSet).sort((a, b) => parseInt(a) - parseInt(b));

    return {
      widths: sortedWidths,
      depths: sortedDepths,
      heights: sortedHeights
    };
  }, [variants]);

  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      {/* Width Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Width (mm)</label>
        {widths.length === 1 ? (
          <div className="w-full h-10 text-sm bg-muted rounded border flex items-center px-3">
            <span className="text-muted-foreground">{widths[0]}mm</span>
          </div>
        ) : (
          <Select value={selectedWidth} onValueChange={onWidthChange}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Select width" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              {widths.map((width) => (
                <SelectItem key={width} value={width}>
                  {width}mm
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Depth Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Depth (mm)</label>
        <Select value={selectedDepth} onValueChange={onDepthChange}>
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Select depth" />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50">
            {depths.map((depth) => (
              <SelectItem key={depth} value={depth}>
                {depth}mm
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Height Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Height (mm)</label>
        <Select value={selectedHeight} onValueChange={onHeightChange}>
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Select height" />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50">
            {heights.map((height) => (
              <SelectItem key={height} value={height}>
                {height}mm
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};