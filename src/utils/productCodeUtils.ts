
/**
 * Utility functions for extracting, validating, and normalizing product codes
 */

export interface ProductCode {
  code: string;
  series: string;
  variant?: string;
  size?: string;
  orientation?: 'LH' | 'RH' | 'None';
  type?: string;
}

/**
 * Extract product code from product name or variant name
 */
export const extractProductCode = (productName: string): ProductCode | null => {
  // Handle cases like "MC-PC-LH (505065)" or "KS1000" or "OR-PC-3838 (604518)"
  const patterns = [
    // Pattern for products with parentheses: "MC-PC-LH (505065)"
    /^([A-Z]+-[A-Z]+-?[A-Z]*)-?([LR]H)?\s*\(([0-9]+)\)$/,
    // Pattern for KS series: "KS1000"
    /^(KS)([0-9]+)$/,
    // Pattern for OR series with code: "OR-PC-3838 (604518)"
    /^([A-Z]+-[A-Z]+-[0-9]+)\s*\(([0-9]+)\)$/,
    // Pattern for drawer configurations: "MC-PC-DWR3 (505080)"
    /^([A-Z]+-[A-Z]+-[A-Z]+[0-9]+)\s*\(([0-9]+)\)$/,
  ];

  for (const pattern of patterns) {
    const match = productName.match(pattern);
    if (match) {
      if (pattern === patterns[1]) { // KS series
        return {
          code: match[0],
          series: match[1],
          size: match[2]
        };
      } else if (pattern === patterns[2]) { // OR series
        return {
          code: `${match[1]} (${match[2]})`,
          series: match[1].split('-')[0],
          variant: match[1],
          size: match[2]
        };
      } else {
        // Standard pattern with orientation or drawer config
        const hasOrientation = match[2] && ['LH', 'RH'].includes(match[2]);
        return {
          code: productName,
          series: match[1].split('-')[0],
          variant: match[1],
          orientation: hasOrientation ? match[2] as 'LH' | 'RH' : 'None',
          size: match[3] || match[2]
        };
      }
    }
  }

  return null;
};

/**
 * Normalize product code for consistent file naming
 */
export const normalizeProductCode = (code: string): string => {
  return code.trim().replace(/\s+/g, ' ');
};

/**
 * Generate storage path for a product code
 */
export const getStoragePath = (productCode: string, fileType: 'jpg' | 'glb'): string => {
  const normalized = normalizeProductCode(productCode);
  return `products/${normalized}.${fileType}`;
};

/**
 * Generate base name for product grouping (removes size codes and orientations)
 */
export const getProductBaseName = (productName: string): string => {
  const productCode = extractProductCode(productName);
  if (!productCode) return productName;
  
  // For KS series, return the series name
  if (productCode.series === 'KS') {
    return productCode.series;
  }
  
  // For other series, remove size codes and orientations
  return productCode.variant || productCode.series;
};

/**
 * Check if a product code is valid for Innosin Lab
 */
export const isInnosinLabProduct = (productName: string): boolean => {
  const productCode = extractProductCode(productName);
  if (!productCode) return false;
  
  const innosinSeries = ['MC', 'MCC', 'TCG', 'TCS', 'WCG', 'WCS', 'OR', 'KS', 'PC'];
  return innosinSeries.includes(productCode.series);
};
