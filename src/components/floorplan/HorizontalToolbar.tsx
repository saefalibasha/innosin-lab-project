import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MousePointer, 
  Square, 
  Home, 
  DoorOpen, 
  Type, 
  Undo, 
  Redo,
  Grid
} from 'lucide-react';
import { DrawingMode } from '@/types/floorPlanTypes';

interface HorizontalToolbarProps {
  currentTool: DrawingMode;
  onToolChange: (tool: DrawingMode) => void;
  selectedProducts: string[];
  onClearSelection: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onToggleGrid: () => void;
  showGrid: boolean;
  scale: number;
}

const HorizontalToolbar: React.FC<HorizontalToolbarProps> = ({
  currentTool,
  onToolChange,
  selectedProducts,
  onClearSelection,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onToggleGrid,
  showGrid,
  scale
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Drawing Tools */}
            <div className="flex items-center space-x-1 mr-4">
              <Button
                variant={currentTool === 'select' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onToolChange('select')}
              >
                <MousePointer className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'wall' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onToolChange('wall')}
              >
                <Square className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'room' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onToolChange('room')}
              >
                <Home className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'door' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onToolChange('door')}
              >
                <DoorOpen className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onToolChange('text')}
              >
                <Type className="h-4 w-4" />
              </Button>
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center space-x-1 mr-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onUndo}
                disabled={!canUndo}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onRedo}
                disabled={!canRedo}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>

            {/* Grid Toggle */}
            <Button
              variant={showGrid ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleGrid}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Selection Actions */}
            {selectedProducts.length > 0 && (
              <div className="flex items-center space-x-2 mr-4">
                <Badge variant="secondary">
                  {selectedProducts.length} selected
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearSelection}
                >
                  Clear
                </Button>
              </div>
            )}

            {/* Scale Display */}
            <Badge variant="outline" className="text-xs">
              Scale: {scale.toFixed(3)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HorizontalToolbar;
