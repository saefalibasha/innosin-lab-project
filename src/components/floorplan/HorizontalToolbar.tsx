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
  Grid,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Minus,
  ArrowUpDown,
  ArrowLeftRight
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
  onScaleChange?: (newScale: number) => void;
  doorOrientation?: 'horizontal' | 'vertical';
  onDoorOrientationChange?: (orientation: 'horizontal' | 'vertical') => void;
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
  scale,
  onScaleChange,
  doorOrientation = 'horizontal',
  onDoorOrientationChange
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
                title="Select (V)"
              >
                <MousePointer className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'move' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onToolChange('move')}
                title="Move Products (M)"
              >
                <Move className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'wall' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onToolChange('wall')}
                title="Exterior Wall (W)"
              >
                <Square className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'interior-wall' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onToolChange('interior-wall')}
                title="Interior Wall (I)"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'room' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onToolChange('room')}
                title="Room (Q)"
              >
                <Home className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'door' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onToolChange('door')}
                title="Door (D)"
              >
                <DoorOpen className="h-4 w-4" />
              </Button>
              
              {/* Door Orientation Controls - More visible */}
              {currentTool === 'door' && onDoorOrientationChange && (
                <div className="flex items-center bg-muted/30 border-2 border-primary/20 rounded-lg ml-2 p-1">
                  <div className="text-xs font-medium text-muted-foreground mr-2">Door:</div>
                  <Button
                    variant={doorOrientation === 'horizontal' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onDoorOrientationChange('horizontal')}
                    title="Horizontal Door"
                    className="rounded-r-none h-8 px-2"
                  >
                    <ArrowLeftRight className="h-4 w-4 mr-1" />
                    <span className="text-xs">H</span>
                  </Button>
                  <Button
                    variant={doorOrientation === 'vertical' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onDoorOrientationChange('vertical')}
                    title="Vertical Door"
                    className="rounded-l-none h-8 px-2"
                  >
                    <ArrowUpDown className="h-4 w-4 mr-1" />
                    <span className="text-xs">V</span>
                  </Button>
                </div>
              )}
              <Button
                variant={currentTool === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onToolChange('text')}
                title="Text (T)"
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

            {/* Scale Controls */}
            {onScaleChange && (
              <div className="flex items-center space-x-1 mr-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onScaleChange(Math.max(0.1, scale - 0.05))}
                  disabled={scale <= 0.1}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Badge variant="outline" className="text-xs px-2">
                  {(scale * 100).toFixed(0)}%
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onScaleChange(Math.min(1.0, scale + 0.05))}
                  disabled={scale >= 1.0}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onScaleChange(0.2)}
                  title="Reset scale"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            )}
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
