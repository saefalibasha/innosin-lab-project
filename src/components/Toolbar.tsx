
import React from 'react';
import { Button } from '@/components/ui/button';
import { DrawingMode } from '@/types/floorPlanTypes';
import { Square, Move, DoorOpen, Settings, RotateCcw } from 'lucide-react';

interface ToolbarProps {
  currentTool: DrawingMode;
  onToolChange: (tool: DrawingMode) => void;
  onDimensionSettingsOpen: () => void;
  onResetConfirmationOpen: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onToolChange,
  onDimensionSettingsOpen,
  onResetConfirmationOpen
}) => {
  return (
    <div className="flex items-center gap-2 p-4 bg-background border-b">
      <Button
        variant={currentTool === 'select' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('select')}
      >
        <Move className="w-4 h-4 mr-2" />
        Select
      </Button>
      
      <Button
        variant={currentTool === 'wall' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('wall')}
      >
        <Square className="w-4 h-4 mr-2" />
        Wall
      </Button>
      
      <Button
        variant={currentTool === 'door' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('door')}
      >
        <DoorOpen className="w-4 h-4 mr-2" />
        Door
      </Button>
      
      <div className="flex-1" />
      
      <Button
        variant="outline"
        size="sm"
        onClick={onDimensionSettingsOpen}
      >
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onResetConfirmationOpen}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset
      </Button>
    </div>
  );
};

export default Toolbar;
