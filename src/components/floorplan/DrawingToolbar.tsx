
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MousePointer, 
  Home, 
  Minus, 
  DoorOpen, 
  Type, 
  Grid, 
  Ruler,
  Undo,
  Redo,
  Trash2
} from 'lucide-react';
import { DrawingMode } from '@/types/floorPlanTypes';

interface DrawingToolbarProps {
  currentMode: DrawingMode;
  onModeChange: (mode: DrawingMode) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showMeasurements: boolean;
  onToggleMeasurements: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClear: () => void;
}

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  currentMode,
  onModeChange,
  showGrid,
  onToggleGrid,
  showMeasurements,
  onToggleMeasurements,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClear
}) => {
  const drawingTools = [
    { 
      mode: 'select' as DrawingMode, 
      name: 'Select', 
      icon: MousePointer, 
      shortcut: 'V',
      description: 'Select and move objects'
    },
    { 
      mode: 'wall' as DrawingMode, 
      name: 'Wall', 
      icon: Minus, 
      shortcut: 'W',
      description: 'Draw walls (double-click to finish)'
    },
    { 
      mode: 'room' as DrawingMode, 
      name: 'Room', 
      icon: Home, 
      shortcut: 'R',
      description: 'Draw room boundaries (double-click to finish)'
    },
    { 
      mode: 'door' as DrawingMode, 
      name: 'Door', 
      icon: DoorOpen, 
      shortcut: 'D',
      description: 'Place doors'
    },
    { 
      mode: 'text' as DrawingMode, 
      name: 'Text', 
      icon: Type, 
      shortcut: 'T',
      description: 'Add text annotations'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MousePointer className="w-5 h-5" />
          Drawing Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drawing Tools */}
        <div className="grid grid-cols-1 gap-2">
          {drawingTools.map(tool => (
            <Button
              key={tool.mode}
              variant={currentMode === tool.mode ? "default" : "outline"}
              className="justify-start h-auto p-3"
              onClick={() => onModeChange(tool.mode)}
              title={tool.description}
            >
              <tool.icon className="w-4 h-4 mr-2" />
              <div className="flex-1 text-left">
                <div className="font-medium">{tool.name}</div>
                <div className="text-xs text-gray-500">{tool.description}</div>
              </div>
              <Badge variant="outline" className="ml-2 text-xs">
                {tool.shortcut}
              </Badge>
            </Button>
          ))}
        </div>

        <Separator />

        {/* View Controls */}
        <div className="space-y-2">
          <div className="text-sm font-medium">View Options</div>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant={showGrid ? "default" : "outline"}
              onClick={onToggleGrid}
              className="justify-start"
            >
              <Grid className="w-4 h-4 mr-2" />
              {showGrid ? 'Hide Grid' : 'Show Grid'}
            </Button>
            <Button
              variant={showMeasurements ? "default" : "outline"}
              onClick={onToggleMeasurements}
              className="justify-start"
            >
              <Ruler className="w-4 h-4 mr-2" />
              {showMeasurements ? 'Hide Measurements' : 'Show Measurements'}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Action Controls */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Actions</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={onUndo}
              disabled={!canUndo}
              className="justify-start"
            >
              <Undo className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="outline"
              onClick={onRedo}
              disabled={!canRedo}
              className="justify-start"
            >
              <Redo className="w-4 h-4 mr-2" />
              Redo
            </Button>
          </div>
          <Button
            variant="destructive"
            onClick={onClear}
            className="w-full justify-start"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DrawingToolbar;
