import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  MousePointer, 
  Square, 
  Home, 
  DoorOpen, 
  Package, 
  Type, 
  Ruler, 
  RotateCcw, 
  Move, 
  Trash2, 
  Minus, 
  PenTool, 
  Hand, 
  Eraser,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  X
} from 'lucide-react';
import { DrawingTool } from '@/types/floorPlanTypes';

interface HorizontalToolbarProps {
  currentTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  selectedProducts: string[];
  onClearSelection: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToView: () => void;
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
  onZoomIn,
  onZoomOut,
  onFitToView,
  onToggleGrid,
  showGrid,
  scale
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={currentTool === 'select' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('select')}
      >
        <MousePointer className="w-4 h-4 mr-2" />
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
        variant={currentTool === 'interior-wall' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('interior-wall')}
      >
        <Home className="w-4 h-4 mr-2" />
        Int. Wall
      </Button>
      <Button
        variant={currentTool === 'room' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('room')}
      >
        <Home className="w-4 h-4 mr-2" />
        Room
      </Button>
      <Button
        variant={currentTool === 'door' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('door')}
      >
        <DoorOpen className="w-4 h-4 mr-2" />
        Door
      </Button>
      <Button
        variant={currentTool === 'product' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('product')}
      >
        <Package className="w-4 h-4 mr-2" />
        Product
      </Button>
      <Button
        variant={currentTool === 'text' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('text')}
      >
        <Type className="w-4 h-4 mr-2" />
        Text
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant={currentTool === 'measure' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('measure')}
      >
        <Ruler className="w-4 h-4 mr-2" />
        Measure
      </Button>
      <Button
        variant={currentTool === 'rotate' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('rotate')}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Rotate
      </Button>
      <Button
        variant={currentTool === 'move' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('move')}
      >
        <Move className="w-4 h-4 mr-2" />
        Move
      </Button>
      <Button
        variant={currentTool === 'delete' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('delete')}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant={currentTool === 'line' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('line')}
      >
        <Minus className="w-4 h-4 mr-2" />
        Line
      </Button>
      <Button
        variant={currentTool === 'freehand' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('freehand')}
      >
        <PenTool className="w-4 h-4 mr-2" />
        Freehand
      </Button>
      <Button
        variant={currentTool === 'pan' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('pan')}
      >
        <Hand className="w-4 h-4 mr-2" />
        Pan
      </Button>
      <Button
        variant={currentTool === 'eraser' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('eraser')}
      >
        <Eraser className="w-4 h-4 mr-2" />
        Eraser
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button variant="outline" size="sm" onClick={onUndo} disabled={!canUndo}>
        <Undo className="w-4 h-4 mr-2" />
        Undo
      </Button>
      <Button variant="outline" size="sm" onClick={onRedo} disabled={!canRedo}>
        <Redo className="w-4 h-4 mr-2" />
        Redo
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button variant="outline" size="sm" onClick={onZoomIn}>
        <ZoomIn className="w-4 h-4 mr-2" />
        Zoom In
      </Button>
      <Button variant="outline" size="sm" onClick={onZoomOut}>
        <ZoomOut className="w-4 h-4 mr-2" />
        Zoom Out
      </Button>
      <Button variant="outline" size="sm" onClick={onFitToView}>
        <Maximize2 className="w-4 h-4 mr-2" />
        Fit to View
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button variant={showGrid ? 'default' : 'outline'} size="sm" onClick={onToggleGrid}>
        <Grid className="w-4 h-4 mr-2" />
        {showGrid ? 'Hide Grid' : 'Show Grid'}
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {selectedProducts.length > 0 && (
        <Badge variant="secondary" className="gap-1.5">
          <Package className="h-2 w-2" />
          {selectedProducts.length} Selected
          <Button variant="ghost" size="icon" onClick={onClearSelection}>
            <X className="h-3 w-3" />
            <span className="sr-only">Clear selection</span>
          </Button>
        </Badge>
      )}

      <div className="ml-2 text-sm text-gray-500">
        Scale: {Math.round(scale * 100)}%
      </div>
    </div>
  );
};

export default HorizontalToolbar;
