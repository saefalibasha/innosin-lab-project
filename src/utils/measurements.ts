
// Measurement utilities for mm-based calculations
export type MeasurementUnit = 'mm' | 'cm' | 'm' | 'in' | 'ft';

export interface Dimensions {
  width: number;  // in mm
  height: number; // in mm
  depth: number;  // in mm
}

export interface MeasurementConfig {
  unit: MeasurementUnit;
  precision: number;
  showUnit: boolean;
}

// Convert measurements to mm (base unit)
export const convertToMm = (value: number, unit: MeasurementUnit): number => {
  switch (unit) {
    case 'mm': return value;
    case 'cm': return value * 10;
    case 'm': return value * 1000;
    case 'in': return value * 25.4;
    case 'ft': return value * 304.8;
    default: return value;
  }
};

// Convert from mm to target unit
export const convertFromMm = (value: number, unit: MeasurementUnit): number => {
  switch (unit) {
    case 'mm': return value;
    case 'cm': return value / 10;
    case 'm': return value / 1000;
    case 'in': return value / 25.4;
    case 'ft': return value / 304.8;
    default: return value;
  }
};

// Format measurement with unit
export const formatMeasurement = (value: number, config: MeasurementConfig): string => {
  const converted = convertFromMm(value, config.unit);
  const formatted = converted.toFixed(config.precision);
  return config.showUnit ? `${formatted}${config.unit}` : formatted;
};

// Parse dimension string from database format "750×550×880 mm"
export const parseDimensionString = (dimensionStr: string): Dimensions | null => {
  const match = dimensionStr.match(/(\d+)×(\d+)×(\d+)\s*mm/);
  if (!match) return null;
  
  return {
    width: parseInt(match[1]),
    height: parseInt(match[2]),
    depth: parseInt(match[3])
  };
};

// Calculate canvas scale (pixels per mm)
export const calculateScale = (canvasWidth: number, realWidthMm: number): number => {
  return canvasWidth / realWidthMm;
};

// Convert canvas coordinates to real-world mm
export const canvasToMm = (canvasValue: number, scale: number): number => {
  return canvasValue / scale;
};

// Convert real-world mm to canvas coordinates
export const mmToCanvas = (mmValue: number, scale: number): number => {
  return mmValue * scale;
};

// Grid size options in mm
export const GRID_SIZES = {
  fine: 1,     // 1mm
  medium: 5,   // 5mm
  coarse: 10,  // 10mm
  standard: 20 // 20mm
};

// Common architectural dimensions in mm
export const COMMON_DIMENSIONS = {
  doorWidth: 800,
  doorHeight: 2000,
  windowHeight: 1200,
  ceilingHeight: 2400,
  wallThickness: 100,
  standardRoom: {
    small: { width: 3000, height: 3000 },
    medium: { width: 4000, height: 4000 },
    large: { width: 6000, height: 6000 }
  }
};
