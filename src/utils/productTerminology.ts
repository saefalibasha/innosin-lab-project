/**
 * Utility functions for standardizing product terminology across the application
 */

// Map database orientation values to display names
export const orientationDisplayMap = {
  'LH': 'Left-Handed',
  'RH': 'Right-Handed',
  'None': 'None'
} as const;

// Map display names back to database values
export const orientationValueMap = {
  'Left-Handed': 'LH',
  'Right-Handed': 'RH',
  'None': 'None'
} as const;

/**
 * Convert database orientation value to display name
 */
export const getOrientationDisplayName = (value: string): string => {
  return orientationDisplayMap[value as keyof typeof orientationDisplayMap] || value;
};

/**
 * Convert display name to database orientation value
 */
export const getOrientationValue = (displayName: string): string => {
  return orientationValueMap[displayName as keyof typeof orientationValueMap] || displayName;
};

/**
 * Format drawer count for display
 */
export const formatDrawerCount = (count: number | string): string => {
  const num = typeof count === 'string' ? parseInt(count, 10) : count;
  if (isNaN(num) || num <= 0) return '';
  return `${num} Drawer${num !== 1 ? 's' : ''}`;
};

/**
 * Get standard attribute label for display
 */
export const getAttributeLabel = (attr: string): string => {
  const labels: Record<string, string> = {
    dimensions: 'Dimensions',
    door_type: 'Door Type',
    orientation: 'Orientation',
    drawer_count: 'Number of Drawers',
    number_of_drawers: 'Number of Drawers',
    mounting_type: 'Mounting Type',
    mixing_type: 'Mixing Type',
    handle_type: 'Handle Type',
    emergency_shower_type: 'Emergency Shower Type',
    finish_type: 'Finish'
  };
  return labels[attr] || attr.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Format attribute value for display
 */
export const formatAttributeValue = (attr: string, value: string | number): string => {
  switch (attr) {
    case 'orientation':
      return getOrientationDisplayName(String(value));
    case 'drawer_count':
    case 'number_of_drawers':
      return formatDrawerCount(value);
    case 'finish_type':
      return formatFinishType(String(value));
    default:
      return String(value);
  }
};

/**
 * Format finish type for display
 */
export const formatFinishType = (finishType: string): string => {
  const finishMap: Record<string, string> = {
    'PC': 'Powder Coat',
    'SS': 'Stainless Steel',
    'SS304': 'SS304'
  };
  return finishMap[finishType] || finishType;
};