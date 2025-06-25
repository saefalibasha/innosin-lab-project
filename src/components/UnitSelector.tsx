
import React from 'react';
import { Button } from '@/components/ui/button';

type Units = 'mm' | 'cm' | 'm' | 'ft' | 'in';

interface UnitSelectorProps {
  units: Units;
  onUnitsChange: (units: Units) => void;
}

const UnitSelector: React.FC<UnitSelectorProps> = ({ units, onUnitsChange }) => {
  const unitOptions: { value: Units; label: string; description: string }[] = [
    { value: 'mm', label: 'mm', description: 'Millimeters' },
    { value: 'cm', label: 'cm', description: 'Centimeters' },
    { value: 'm', label: 'm', description: 'Meters' },
    { value: 'ft', label: 'ft', description: 'Feet' },
    { value: 'in', label: 'in', description: 'Inches' }
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {unitOptions.map(option => (
        <Button
          key={option.value}
          variant={units === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onUnitsChange(option.value)}
          title={option.description}
          className="h-7 px-2 text-xs"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default UnitSelector;
