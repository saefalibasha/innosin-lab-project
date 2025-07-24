
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DrawingMode } from '@/types/floorPlanTypes';

interface ToolbarProps {
  currentTool: DrawingMode;
  onToolChange: (tool: DrawingMode) => void;
  showGrid: boolean;
  onGridToggle: () => void;
  showMeasurements: boolean;
  onMeasurementsToggle: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onToolChange,
  showGrid,
  onGridToggle,
  showMeasurements,
  onMeasurementsToggle
}) => {
  const tools: { mode: DrawingMode; label: string }[] = [
    { mode: 'select', label: 'Select' },
    { mode: 'room', label: 'Room' },
    { mode: 'wall', label: 'Wall' },
    { mode: 'door', label: 'Door' },
    { mode: 'product', label: 'Product' },
    { mode: 'measure', label: 'Measure' }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-medium">Tools</h3>
          <div className="grid grid-cols-2 gap-2">
            {tools.map(tool => (
              <Button
                key={tool.mode}
                variant={currentTool === tool.mode ? "default" : "outline"}
                size="sm"
                onClick={() => onToolChange(tool.mode)}
              >
                {tool.label}
              </Button>
            ))}
          </div>
          
          <div className="pt-2 border-t">
            <div className="space-y-2">
              <Button
                variant={showGrid ? "default" : "outline"}
                size="sm"
                onClick={onGridToggle}
                className="w-full"
              >
                Grid
              </Button>
              <Button
                variant={showMeasurements ? "default" : "outline"}
                size="sm"
                onClick={onMeasurementsToggle}
                className="w-full"
              >
                Measurements
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Toolbar;
