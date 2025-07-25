
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MousePointer, 
  Square, 
  Circle, 
  Minus, 
  DoorOpen, 
  Type, 
  RotateCcw,
  Trash2,
  Ruler,
  Hand,
  PenTool,
  Pencil
} from 'lucide-react';

export type DrawingTool = 'select' | 'wall' | 'room' | 'door' | 'text' | 'pan' | 'eraser' | 'rotate' | 'measure' | 'line' | 'freehand';

interface DrawingToolbarProps {
  currentTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
}

const DrawingToolbar: React.FC<DrawingToolbarProps> = ({ currentTool, onToolChange }) => {
  const tools = [
    { id: 'select' as DrawingTool, icon: MousePointer, label: 'Select' },
    { id: 'wall' as DrawingTool, icon: Minus, label: 'Wall' },
    { id: 'room' as DrawingTool, icon: Square, label: 'Room' },
    { id: 'door' as DrawingTool, icon: DoorOpen, label: 'Door' },
    { id: 'text' as DrawingTool, icon: Type, label: 'Text' },
    { id: 'measure' as DrawingTool, icon: Ruler, label: 'Measure' },
    { id: 'line' as DrawingTool, icon: PenTool, label: 'Line' },
    { id: 'freehand' as DrawingTool, icon: Pencil, label: 'Freehand' },
    { id: 'pan' as DrawingTool, icon: Hand, label: 'Pan' },
    { id: 'rotate' as DrawingTool, icon: RotateCcw, label: 'Rotate' },
    { id: 'eraser' as DrawingTool, icon: Trash2, label: 'Eraser' },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-muted/20 rounded-lg">
      <div className="flex flex-wrap gap-1">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={currentTool === tool.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolChange(tool.id)}
            className="flex items-center gap-2"
          >
            <tool.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tool.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DrawingToolbar;
