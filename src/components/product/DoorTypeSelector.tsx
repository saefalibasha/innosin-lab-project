
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DoorOpen, Eye } from 'lucide-react';

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
  const formatDoorType = (doorType: string) => {
    switch (doorType.toLowerCase()) {
      case 'solid':
        return 'Solid Door';
      case 'glass':
        return 'Glass Door';
      default:
        return doorType;
    }
  };

  const getDoorIcon = (doorType: string) => {
    switch (doorType.toLowerCase()) {
      case 'glass':
        return <Eye className="w-4 h-4" />;
      case 'solid':
      default:
        return <DoorOpen className="w-4 h-4" />;
    }
  };

  if (doorTypes.length <= 1) {
    return null;
  }

  return (
    <div>
      <h4 className="font-medium mb-3">Door Type</h4>
      <div className="grid grid-cols-2 gap-2">
        {doorTypes.map((doorType) => {
          const isSelected = selectedDoorType === doorType;
          
          return (
            <Button
              key={doorType}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onDoorTypeChange(doorType)}
              className="text-sm flex items-center gap-2 justify-start"
            >
              {getDoorIcon(doorType)}
              {formatDoorType(doorType)}
            </Button>
          );
        })}
      </div>
      {selectedDoorType && (
        <div className="mt-2 text-sm text-muted-foreground">
          Current door type: <Badge variant="outline">{formatDoorType(selectedDoorType)}</Badge>
        </div>
      )}
    </div>
  );
};

export default DoorTypeSelector;
