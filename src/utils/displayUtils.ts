/**
 * Utility functions for formatting display values across configurators
 */

/**
 * Capitalizes the first letter of each word in a string
 */
export const capitalizeWords = (str: string): string => {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

/**
 * Formats mounting type for display (capitalizes properly)
 */
export const formatMountingType = (mountingType: string): string => {
  if (!mountingType) return '';
  
  // Handle hyphenated mounting types
  return mountingType
    .split('-')
    .map(part => capitalizeWords(part))
    .join('-');
};

/**
 * Formats emergency shower type for display
 * Combines 'Combination' and 'Combination Shower' into unified 'Combination Shower'
 */
export const formatEmergencyShowerType = (type: string): string => {
  if (!type) return '';
  
  // Unify combination types
  if (type.toLowerCase() === 'combination') {
    return 'Combination Shower';
  }
  
  return type;
};

/**
 * Formats orientation display text
 */
export const formatOrientation = (orientation: string): string => {
  switch (orientation?.toUpperCase()) {
    case 'LH':
      return 'Left Hand';
    case 'RH':
      return 'Right Hand';
    default:
      return orientation || 'Standard';
  }
};