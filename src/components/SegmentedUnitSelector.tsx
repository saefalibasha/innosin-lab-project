import React from 'react';
import { Button } from '@/components/ui/button';
import { MeasurementUnit } from '@/utils/measurements';

interface SegmentedUnitSelectorProps {
  selectedUnit: MeasurementUnit;
  onUnitChange: (unit: MeasurementUnit) => void;
  className?: string;
}

const SegmentedUnitSelector: React.FC<SegmentedUnitSelectorProps> = ({
  selectedUnit,
  onUnitChange,
  className = ''
}) => {
  const units: { value: MeasurementUnit; label: string }[] = [
    { value: 'mm', label: 'mm' },
    { value: 'm', label: 'm' },
    { value: 'ft', label: 'ft' }
  ];

  return (
    <div className={`inline-flex rounded-md shadow-sm ${className}`} role="group">
      {units.map((unit, index) => (
        <Button
          key={unit.value}
          type="button"
          variant={selectedUnit === unit.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onUnitChange(unit.value)}
          className={`
            px-3 py-1 text-xs font-medium
            ${index === 0 ? 'rounded-r-none' : ''}
            ${index === units.length - 1 ? 'rounded-l-none' : ''}
            ${index > 0 && index < units.length - 1 ? 'rounded-none border-l-0 border-r-0' : ''}
            ${index > 0 && index !== units.length - 1 ? 'border-l-0' : ''}
            ${selectedUnit === unit.value 
              ? 'bg-primary text-primary-foreground border-primary z-10' 
              : 'bg-background hover:bg-accent hover:text-accent-foreground border-input'
            }
          `}
        >
          {unit.label}
        </Button>
      ))}
    </div>
  );
};

export default SegmentedUnitSelector;