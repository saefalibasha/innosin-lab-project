
export interface ParsedDimensions {
  width: number;
  depth: number;
  height: number;
  unit: string;
}

export const parseDimensionString = (dimensionStr: string | object): ParsedDimensions | null => {
  if (!dimensionStr) return null;
  
  // Handle if already parsed as an object
  if (typeof dimensionStr === 'object' && 'width' in dimensionStr) {
    return dimensionStr as ParsedDimensions;
  }
  
  const dimensionString = String(dimensionStr);
  
  // Match patterns like "750×500×650 mm", "750 x 500 x 650", "750mm x 500mm x 650mm"
  const match = dimensionString.match(/(\d+)\s*[×x]\s*(\d+)\s*[×x]\s*(\d+)\s*(mm|cm|m)?/i);
  
  if (!match) return null;
  
  const [, width, depth, height, unit = 'mm'] = match;
  
  return {
    width: parseInt(width, 10),
    depth: parseInt(depth, 10),
    height: parseInt(height, 10),
    unit: unit.toLowerCase()
  };
};

export const mmToCanvas = (mm: number, scale: number): number => {
  return mm * scale;
};

export const canvasToMm = (pixels: number, scale: number): number => {
  return pixels / scale;
};
