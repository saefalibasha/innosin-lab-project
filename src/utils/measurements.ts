
export const mmToCanvas = (mm: number, scale: number): number => {
  return mm * scale;
};

export const canvasToMm = (canvas: number, scale: number): number => {
  return canvas / scale;
};

export interface MeasurementOptions {
  unit: 'mm' | 'cm' | 'm';
  precision: number;
  showUnit: boolean;
}

export interface MeasurementConfig {
  unit: 'mm' | 'cm' | 'm';
  precision: number;
  showUnit: boolean;
}

export const formatMeasurement = (value: number, options: MeasurementOptions): string => {
  const { unit, precision, showUnit } = options;
  
  let convertedValue = value;
  let unitStr = unit;
  
  switch (unit) {
    case 'cm':
      convertedValue = value / 10;
      unitStr = 'cm';
      break;
    case 'm':
      convertedValue = value / 1000;
      unitStr = 'm';
      break;
    default:
      convertedValue = value;
      unitStr = 'mm';
  }
  
  const formatted = convertedValue.toFixed(precision);
  return showUnit ? `${formatted}${unitStr}` : formatted;
};

export const convertToMm = (value: number, unit: 'mm' | 'cm' | 'm'): number => {
  switch (unit) {
    case 'cm':
      return value * 10;
    case 'm':
      return value * 1000;
    default:
      return value;
  }
};

export const GRID_SIZES = [
  { value: 10, label: '10mm' },
  { value: 20, label: '20mm' },
  { value: 50, label: '50mm' },
  { value: 100, label: '100mm' },
  { value: 200, label: '200mm' },
  { value: 500, label: '500mm' }
];
