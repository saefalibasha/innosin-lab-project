
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Pencil, 
  Minus, 
  Hand, 
  Eraser, 
  MousePointer, 
  Square, 
  DoorOpen,
  RotateCcw,
  Move3D,
  Maximize2 // Using Maximize2 instead of Fit
} from 'lucide-react';
import { DrawingTool } from '@/types/floorPlanTypes';

interface CompactToolPanelProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
  selectedProducts: any[];
  onClearSelection: () => void;
  onFitToView: () => void;
  onToggleGrid: () => void;
  showGrid: boolean;
}

const CompactToolPanel: React.FC<CompactToolPanelProps> = ({ 
  currentTool, 
  onToolChange,
  selectedProducts,
  onClearSelection,
  onFitToView,
  onToggleGrid,
  showGrid
}) => {
  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select', color: 'bg-blue-500' },
    { id: 'wall', icon: Minus, label: 'Wall', color: 'bg-green-500' },
    { id: 'interior-wall', icon: Square, label: 'Interior', color: 'bg-yellow-500' },
    { id: 'door', icon: DoorOpen, label: 'Door', color: 'bg-purple-500' },
    { id: 'line', icon: Minus, label: 'Line', color: 'bg-gray-500' },
    { id: 'freehand', icon: Pencil, label: 'Draw', color: 'bg-orange-500' },
    { id: 'pan', icon: Hand, label: 'Pan', color: 'bg-cyan-500' },
    { id: 'eraser', icon: Eraser, label: 'Erase', color: 'bg-red-500' },
    { id: 'rotate', icon: RotateCcw, label: 'Rotate', color: 'bg-indigo-500' }
  ];

  return (
    <div className="bg-white border rounded-lg shadow-sm p-2 space-y-2">
      {/* Tools Grid */}
      <div className="grid grid-cols-3 gap-1">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Button
              key={tool.id}
              variant={currentTool === tool.id ? "default" : "outline"}
              size="sm"
              className={`h-12 flex flex-col items-center justify-center p-1 ${
                currentTool === tool.id ? 'bg-primary text-primary-foreground' : ''
              }`}
              onClick={() => onToolChange(tool.id as any)}
            >
              <Icon className="h-4 w-4 mb-0.5" />
              <span className="text-xs leading-none">{tool.label}</span>
            </Button>
          );
        })}
      </div>

      <Separator />

      {/* View Controls */}
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onFitToView}
          className="flex-1"
        >
          <Maximize2 className="h-3 w-3 mr-1" />
          Fit
        </Button>
        <Button
          variant={showGrid ? "default" : "outline"}
          size="sm"
          onClick={onToggleGrid}
          className="flex-1"
        >
          <Move3D className="h-3 w-3 mr-1" />
          Grid
        </Button>
      </div>

      {/* Selection Info */}
      {selectedProducts.length > 0 && (
        <>
          <Separator />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
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
          </div>
        </>
      )}
    </div>
  );
};

export default CompactToolPanel;
