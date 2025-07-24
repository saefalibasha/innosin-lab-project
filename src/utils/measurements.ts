
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
