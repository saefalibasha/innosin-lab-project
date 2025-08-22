import { parseDimensionString, ParsedDimensions } from './dimensionUtils';

export interface ProductDimensions {
  width: number;
  depth: number;
  height: number;
  unit: string;
}

/**
 * Get product dimensions in millimeters from various input formats
 */
export const getProductDimensionsInMm = (product: any): ProductDimensions | null => {
  if (!product) return null;

  // If dimensions are already parsed as an object
  if (product.parsedDimensions && typeof product.parsedDimensions === 'object') {
    return convertToMm(product.parsedDimensions);
  }

  // If dimensions exist as a string
  if (product.dimensions) {
    const parsed = parseDimensionString(product.dimensions);
    if (parsed) {
      return convertToMm(parsed);
    }
  }

  // Fallback: try to extract from specifications
  if (product.specifications?.dimensions) {
    const parsed = parseDimensionString(product.specifications.dimensions);
    if (parsed) {
      return convertToMm(parsed);
    }
  }

  return null;
};

/**
 * Convert parsed dimensions to millimeters
 */
const convertToMm = (dimensions: ParsedDimensions): ProductDimensions => {
  const { width, depth, height, unit } = dimensions;
  
  let multiplier = 1;
  switch (unit.toLowerCase()) {
    case 'cm':
      multiplier = 10;
      break;
    case 'm':
      multiplier = 1000;
      break;
    case 'mm':
    default:
      multiplier = 1;
      break;
  }

  return {
    width: width * multiplier,
    depth: depth * multiplier,
    height: height * multiplier,
    unit: 'mm'
  };
};

/**
 * Format dimensions for display
 */
export const formatDimensionsDisplay = (dimensions: ProductDimensions | null): string => {
  if (!dimensions) return 'Dimensions not available';
  
  const { width, depth, height, unit } = dimensions;
  return `${width}×${depth}×${height} ${unit}`;
};