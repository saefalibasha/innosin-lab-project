
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  MousePointer, 
  Square, 
  Minus, 
  Hand, 
  Eraser, 
  RotateCcw, 
  DoorOpen, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  Grid3X3,
  Maximize2
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
  const tools = [
    { id: 'select' as DrawingTool, icon: MousePointer, label: 'Select', shortcut: 'S' },
    { id: 'wall' as DrawingTool, icon: Square, label: 'Wall', shortcut: 'W' },
    { id: 'interior-wall' as DrawingTool, icon: Minus, label: 'Interior', shortcut: 'I' },
    { id: 'door' as DrawingTool, icon: DoorOpen, label: 'Door', shortcut: 'D' },
    { id: 'pan' as DrawingTool, icon: Hand, label: 'Pan', shortcut: 'P' },
    { id: 'eraser' as DrawingTool, icon: Eraser, label: 'Eraser', shortcut: 'E' },
  ];

  return (
    <div className="flex items-center gap-2 p-2 bg-background border rounded-lg">
      {/* Drawing Tools */}
      <div className="flex items-center gap-1">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Button
              key={tool.id}
              variant={currentTool === tool.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onToolChange(tool.id)}
              className="h-8 w-8 p-0"
              title={`${tool.label} (${tool.shortcut})`}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* History Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="h-8 w-8 p-0"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="h-8 w-8 p-0"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* View Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomOut}
          className="h-8 w-8 p-0"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomIn}
          className="h-8 w-8 p-0"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onFitToView}
          className="h-8 w-8 p-0"
          title="Fit to View"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Grid Toggle */}
      <Button
        variant={showGrid ? "default" : "ghost"}
        size="sm"
        onClick={onToggleGrid}
        className="h-8 w-8 p-0"
        title="Toggle Grid"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>

      {/* Selection Info */}
      {selectedProducts.length > 0 && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {selectedProducts.length} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-6 px-2 text-xs"
            >
              Clear
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default HorizontalToolbar;
