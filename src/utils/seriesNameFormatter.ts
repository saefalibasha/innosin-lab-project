/**
 * Utility functions for standardizing series names and product titles
 */

/**
 * Convert a string to proper title case
 */
export const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Handle special cases
      if (word === 'pc') return 'PC';
      if (word === 'ss') return 'SS';
      if (word === 'ss304') return 'SS304';
      if (word === 'lh') return 'LH';
      if (word === 'rh') return 'RH';
      if (word.includes('mm')) return word.toUpperCase();
      
      // Handle Roman numerals (i, ii, iii, iv, v, vi, vii, viii, ix, x)
      if (/^i{1,3}$|^iv$|^v$|^vi{1,3}$|^ix$|^x$/.test(word)) {
        return word.toUpperCase();
      }
      
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

/**
 * Standardize series names for consistent display
 */
export const formatSeriesName = (seriesName: string): string => {
  if (!seriesName) return '';
  
  // Handle specific series patterns
  const formattedName = seriesName
    // Handle mobile cabinet variations
    .replace(/mobile\s+cabinet/gi, 'Mobile Cabinet')
    .replace(/mobile\s+combination\s+cabinet/gi, 'Mobile Combination Cabinet')
    .replace(/wall\s+cabinet/gi, 'Wall Cabinet')
    .replace(/tall\s+cabinet/gi, 'Tall Cabinet')
    .replace(/open\s+rack/gi, 'Open Rack')
    // Handle bench height specifications
    .replace(/for\s+750mm\s+height?\s+bench/gi, 'For 750mm Height Bench')
    .replace(/for\s+900mm\s+height?\s+bench/gi, 'For 900mm Height Bench')
    // Handle series suffix
    .replace(/\s+series$/gi, ' Series');
  
  return toTitleCase(formattedName);
};

/**
 * Format product name for consistent display
 */
export const formatProductName = (productName: string): string => {
  if (!productName) return '';
  
  return productName
    // Handle common abbreviations
    .replace(/\bMC-PC\b/g, 'MC-PC')
    .replace(/\bMCC-PC\b/g, 'MCC-PC')
    .replace(/\bTCG-PC\b/g, 'TCG-PC')
    .replace(/\bWCG-PC\b/g, 'WCG-PC')
    .replace(/\bOR-PC\b/g, 'OR-PC')
    // Handle orientation suffixes
    .replace(/\b(LH|RH)\b/g, (match) => match.toUpperCase())
    // Handle model numbers
    .replace(/\((\d+)\)/g, '($1)')
    // Ensure proper spacing
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Format category name for consistent display
 */
export const formatCategoryName = (categoryName: string): string => {
  if (!categoryName) return '';
  
  return categoryName
    .split(' ')
    .map(word => {
      // Handle special cases
      if (word.toLowerCase() === 'lab') return 'Lab';
      if (word.toLowerCase() === 'inc.') return 'Inc.';
      if (word.toLowerCase() === 'solutions') return 'Solutions';
      
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};