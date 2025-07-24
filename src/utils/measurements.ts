
// Measurement utility functions
export const mmToCanvas = (mm: number, scale: number): number => {
  return mm * scale;
};

export const canvasToMm = (canvas: number, scale: number): number => {
  return canvas / scale;
};

export const formatMeasurement = (value: number, options: { 
  unit?: string; 
  precision?: number; 
  showUnit?: boolean 
}): string => {
  const { unit = 'mm', precision = 0, showUnit = true } = options;
  const formatted = value.toFixed(precision);
  return showUnit ? `${formatted}${unit}` : formatted;
};

export interface MeasurementConfig {
  unit: string;
  precision: number;
  showUnit: boolean;
}

export const convertToMm = (value: number, unit: string): number => {
  switch (unit) {
    case 'mm':
      return value;
    case 'cm':
      return value * 10;
    case 'm':
      return value * 1000;
    case 'in':
      return value * 25.4;
    case 'ft':
      return value * 304.8;
    default:
      return value;
  }
};

export const GRID_SIZES = [1, 5, 10, 25, 50, 100, 250, 500]; // mm
