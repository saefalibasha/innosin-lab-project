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

  // Check if realDimensions exist (from drag data) - these are in meters
  if (product.realDimensions && typeof product.realDimensions === 'object') {
    const { length, width, height } = product.realDimensions;
    if (length && width && height) {
      return {
        width: width * 1000, // Convert meters to mm
        depth: length * 1000, // Convert meters to mm  
        height: height * 1000, // Convert meters to mm
        unit: 'mm'
      };
    }
  }

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
  const { width, depth, height, unit = 'mm' } = dimensions; // Default unit to 'mm' if undefined
  
  let multiplier = 1;
  switch ((unit || 'mm').toLowerCase()) {
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