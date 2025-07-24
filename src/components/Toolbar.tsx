
import React from 'react';
import { Button } from '@/components/ui/button';
import { DrawingMode } from '@/types/floorPlanTypes';

interface ToolbarProps {
  currentTool: DrawingMode;
  onToolChange: (tool: DrawingMode) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onToolChange,
  onUndo,
  onRedo,
  onClear
}) => {
  const tools: { id: DrawingMode; label: string; icon: string }[] = [
    { id: 'select', label: 'Select', icon: '↖' },
    { id: 'wall', label: 'Wall', icon: '▬' },
    { id: 'door', label: 'Door', icon: '⌐' },
    { id: 'product', label: 'Product', icon: '□' },
    { id: 'measure', label: 'Measure', icon: '📏' }
  ];

  return (
    <div className="flex items-center gap-2 p-4 bg-white border-b">
      {tools.map((tool) => (
        <Button
          key={tool.id}
          variant={currentTool === tool.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onToolChange(tool.id)}
        >
          {tool.icon} {tool.label}
        </Button>
      ))}
      
      <div className="ml-4 flex items-center gap-2">
        {onUndo && (
          <Button variant="outline" size="sm" onClick={onUndo}>
            ↶ Undo
          </Button>
        )}
        {onRedo && (
          <Button variant="outline" size="sm" onClick={onRedo}>
            ↷ Redo
          </Button>
        )}
        {onClear && (
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
