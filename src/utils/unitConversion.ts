
type Units = 'mm' | 'cm' | 'm' | 'ft' | 'in';

// Base unit is meters
const CONVERSION_FACTORS: Record<Units, number> = {
  'mm': 1000,
  'cm': 100,
  'm': 1,
  'ft': 3.28084,
  'in': 39.3701
};

const UNIT_LABELS: Record<Units, string> = {
  'mm': 'mm',
  'cm': 'cm',
  'm': 'm',
  'ft': 'ft',
  'in': 'in'
};

export const convertValue = (value: number, fromUnit: Units, toUnit: Units): number => {
  if (fromUnit === toUnit) return value;
  
  // Convert to meters first, then to target unit
  const valueInMeters = value / CONVERSION_FACTORS[fromUnit];
  return valueInMeters * CONVERSION_FACTORS[toUnit];
};

export const formatMeasurement = (value: number, unit: Units, precision: number = 2): string => {
  return `${value.toFixed(precision)}${UNIT_LABELS[unit]}`;
};

export const convertDimensions = (
  dimensions: { length: number; width: number; height: number },
  fromUnit: Units,
  toUnit: Units
) => {
  return {
    length: convertValue(dimensions.length, fromUnit, toUnit),
    width: convertValue(dimensions.width, fromUnit, toUnit),
    height: convertValue(dimensions.height, fromUnit, toUnit)
  };
};

export const getUnitLabel = (unit: Units): string => {
  return UNIT_LABELS[unit];
};

export const getAllUnits = (): Units[] => {
  return Object.keys(CONVERSION_FACTORS) as Units[];
};
