
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
