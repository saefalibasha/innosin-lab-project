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

    console.log('🔍 DimensionSelector - Raw dimension strings:', dimensionStrings);

    dimensionStrings.forEach(dimStr => {
      console.log('🔍 Parsing dimension string:', dimStr);
      const parsed = parseDimensionString(dimStr);
      console.log('🔍 Parsed result:', parsed);
      
      if (parsed) {
        widthSet.add(parsed.width.toString());
        depthSet.add(parsed.depth.toString());
        heightSet.add(parsed.height.toString());
      }
    });

    const sortedWidths = Array.from(widthSet).sort((a, b) => parseInt(a) - parseInt(b));
    const sortedDepths = Array.from(depthSet).sort((a, b) => parseInt(a) - parseInt(b));
    const sortedHeights = Array.from(heightSet).sort((a, b) => parseInt(a) - parseInt(b));

    console.log('🔍 Final dimensions:', {
      widths: sortedWidths,
      depths: sortedDepths,
      heights: sortedHeights
    });

    return {
      widths: sortedWidths,
      depths: sortedDepths,
      heights: sortedHeights
    };
  }, [variants]);

  return (
    <div className={`grid grid-cols-3 gap-16 w-full ${className}`}>
      {/* Width Selection */}
      <div className="space-y-2 min-w-0 flex-1">
        <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Width (mm)</label>
        {widths.length === 1 ? (
          <div className="w-full h-10 text-sm bg-muted rounded border flex items-center px-3">
            <span className="text-muted-foreground">{widths[0]}</span>
          </div>
        ) : (
          <Select value={selectedWidth || (widths.length > 0 ? widths[0] : '')} onValueChange={onWidthChange}>
            <SelectTrigger className="w-full h-10 min-w-[120px]">
              <SelectValue
                placeholder="Select width" 
                defaultValue={widths.length > 0 ? widths[0] : undefined}
              />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              {widths.map((width) => (
                <SelectItem key={width} value={width}>
                  {width}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Depth Selection */}
      <div className="space-y-2 min-w-0 flex-1">
        <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Depth (mm)</label>
        <Select value={selectedDepth || (depths.length > 0 ? depths[0] : '')} onValueChange={onDepthChange}>
          <SelectTrigger className="w-full h-10 min-w-[120px]">
            <SelectValue 
              placeholder="Select depth" 
              defaultValue={depths.length > 0 ? depths[0] : undefined}
            />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50">
            {depths.map((depth) => (
              <SelectItem key={depth} value={depth}>
                {depth}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Height Selection */}
      <div className="space-y-2 min-w-0 flex-1">
        <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Height (mm)</label>
        <Select value={selectedHeight || (heights.length > 0 ? heights[0] : '')} onValueChange={onHeightChange}>
          <SelectTrigger className="w-full h-10 min-w-[120px]">
            <SelectValue 
              placeholder="Select height" 
              defaultValue={heights.length > 0 ? heights[0] : undefined}
            />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50">
            {heights.map((height) => (
              <SelectItem key={height} value={height}>
                {height}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
