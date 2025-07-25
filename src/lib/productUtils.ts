
/**
 * Utility functions for product data processing
 */

/**
 * Cleans product names by removing parentheses and their contents
 * Example: "MC-PC (750565)" becomes "MC-PC"
 */
export const cleanProductName = (name: string): string => {
  if (!name) return '';
  // Remove everything in parentheses and any trailing/leading whitespace
  return name.replace(/\s*\([^)]*\)\s*/g, '').trim();
};

/**
 * Cleans product names in an array of products
 */
export const cleanProductNames = <T extends { name: string }>(products: T[]): T[] => {
  return products.map(product => ({
    ...product,
    name: cleanProductName(product.name)
  }));
};

/**
 * Cleans product names in a single product object
 */
export const cleanProduct = <T extends { name: string }>(product: T): T => {
  return {
    ...product,
    name: cleanProductName(product.name)
  };
};
