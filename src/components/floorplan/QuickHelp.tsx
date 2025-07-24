
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Mouse, Keyboard, RotateCcw, Save } from 'lucide-react';

const QuickHelp: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          Quick Help
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Mouse className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium">Mouse Controls:</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground ml-5">
            <div>• Click: Select products</div>
            <div>• Drag: Move selected products</div>
            <div>• Drag from library: Place products</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Keyboard className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium">Keyboard Shortcuts:</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground ml-5">
            <div>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Z</kbd>: Undo</div>
            <div>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+S</kbd>: Save</div>
            <div>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Del</kbd>: Delete selected</div>
            <div>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">R</kbd>: Rotate selected</div>
            <div>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd>: Clear selection</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium">Tools:</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground ml-5">
            <div>• <strong>Select:</strong> Choose and move products</div>
            <div>• <strong>Wall:</strong> Draw room boundaries</div>
            <div>• <strong>Door:</strong> Add doors to walls</div>
            <div>• <strong>Pan:</strong> Navigate the canvas</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Save className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium">Tips:</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground ml-5">
            <div>• Select dimensions before placing</div>
            <div>• Use grid snap for precise placement</div>
            <div>• Save regularly to avoid losing work</div>
            <div>• Use Ctrl+A to select all products</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickHelp;
