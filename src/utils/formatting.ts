/**
 * Utility functions for text formatting
 */

/**
 * Converts a string to title case (capitalizes first letter of each word)
 * @param str - The string to convert
 * @returns The string in title case
 */
export const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Converts kebab-case or snake_case to title case
 * @param str - The string to convert
 * @returns The string in title case
 */
export const kebabToTitleCase = (str: string): string => {
  return str
    .replace(/[-_]/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};