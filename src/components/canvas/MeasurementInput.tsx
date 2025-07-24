
import React, { useState } from 'react';
import { formatMeasurement } from '@/utils/measurements';

interface MeasurementInputProps {
  value: number;
  onChange: (value: number) => void;
  unit: string;
  precision?: number;
  className?: string;
}

const MeasurementInput: React.FC<MeasurementInputProps> = ({
  value,
  onChange,
  unit,
  precision = 0,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(
    formatMeasurement(value, { unit, precision, showUnit: false })
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    
    const numericValue = parseFloat(newValue);
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    }
  };

  const handleBlur = () => {
    setDisplayValue(formatMeasurement(value, { unit, precision, showUnit: false }));
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-20 px-2 py-1 text-sm border rounded"
      />
      <span className="text-sm text-gray-500">{unit}</span>
    </div>
  );
};

export default MeasurementInput;
