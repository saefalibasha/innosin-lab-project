
import { PlacedProduct } from '@/types/floorPlanTypes';

// Standard Safe Aire II Fume Hood dimensions (in mm)
// Based on industry standards and manufacturer specifications
export const SAFE_AIRE_II_DIMENSIONS = {
  '4ft': { length: 1219, width: 762, height: 2438 }, // 4 feet
  '5ft': { length: 1524, width: 762, height: 2438 }, // 5 feet  
  '6ft': { length: 1829, width: 762, height: 2438 }, // 6 feet
  '8ft': { length: 2438, width: 762, height: 2438 }, // 8 feet
};

// Verification function for product dimensions
export const verifyProductDimensions = (product: PlacedProduct): {
  isValid: boolean;
  suggestedDimensions?: { length: number; width: number; height: number };
  warnings: string[];
} => {
  const warnings: string[] = [];
  let isValid = true;
  let suggestedDimensions;

  // Check Safe Aire II Fume Hood specifically
  if (product.name.toLowerCase().includes('safe aire') && 
      product.name.toLowerCase().includes('fume hood')) {
    
    const currentDims = product.dimensions;
    
    // Find closest standard size
    let closestSize = '6ft';
    let minDiff = Infinity;
    
    Object.entries(SAFE_AIRE_II_DIMENSIONS).forEach(([size, dims]) => {
      const diff = Math.abs(dims.length - currentDims.length);
      if (diff < minDiff) {
        minDiff = diff;
        closestSize = size;
      }
    });

    const standardDims = SAFE_AIRE_II_DIMENSIONS[closestSize];
    
    // Check if dimensions match standard (within 50mm tolerance)
    const lengthDiff = Math.abs(currentDims.length - standardDims.length);
    const widthDiff = Math.abs(currentDims.width - standardDims.width);
    
    if (lengthDiff > 50) {
      warnings.push(`Length differs from standard ${closestSize} by ${lengthDiff}mm`);
      isValid = false;
    }
    
    if (widthDiff > 50) {
      warnings.push(`Width differs from standard by ${widthDiff}mm`);
      isValid = false;
    }

    if (!isValid) {
      suggestedDimensions = standardDims;
      warnings.push(`Consider using standard ${closestSize} dimensions: ${standardDims.length}×${standardDims.width}×${standardDims.height}mm`);
    }
  }

  // General dimension validation
  if (product.dimensions.length <= 0 || product.dimensions.width <= 0) {
    warnings.push('Invalid dimensions detected');
    isValid = false;
  }

  // Check for unusually large products (over 3 meters)
  if (product.dimensions.length > 3000 || product.dimensions.width > 3000) {
    warnings.push('Product dimensions are unusually large');
  }

  // Check for unusually small products (under 100mm)
  if (product.dimensions.length < 100 || product.dimensions.width < 100) {
    warnings.push('Product dimensions are unusually small');
  }

  return {
    isValid,
    suggestedDimensions,
    warnings
  };
};

// Function to update product with verified dimensions
export const updateProductDimensions = (
  product: PlacedProduct,
  newDimensions: { length: number; width: number; height: number }
): PlacedProduct => {
  return {
    ...product,
    dimensions: newDimensions
  };
};

// Batch verification for all products
export const verifyAllProductDimensions = (products: PlacedProduct[]): {
  validProducts: PlacedProduct[];
  invalidProducts: { product: PlacedProduct; issues: string[] }[];
} => {
  const validProducts: PlacedProduct[] = [];
  const invalidProducts: { product: PlacedProduct; issues: string[] }[] = [];

  products.forEach(product => {
    const verification = verifyProductDimensions(product);
    if (verification.isValid) {
      validProducts.push(product);
    } else {
      invalidProducts.push({
        product,
        issues: verification.warnings
      });
    }
  });

  return { validProducts, invalidProducts };
};
