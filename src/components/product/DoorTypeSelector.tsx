
import React from 'react';
import { Button } from '@/components/ui/button';

interface DoorTypeSelectorProps {
  doorTypes: string[];
  selectedDoorType: string;
  onDoorTypeChange: (doorType: string) => void;
}

const DoorTypeSelector: React.FC<DoorTypeSelectorProps> = ({
  doorTypes,
  selectedDoorType,
  onDoorTypeChange
}) => {
  if (doorTypes.length === 0) return null;

  return (
    <div>
      <h4 className="font-medium mb-3">Door Type</h4>
      <div className="grid grid-cols-2 gap-2">
        {doorTypes.map((doorType) => {
          const isSelected = selectedDoorType === doorType;
          return (
            <Button
              key={doorType}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDoorTypeChange(doorType)}
              className="text-sm"
            >
              {doorType}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default DoorTypeSelector;
