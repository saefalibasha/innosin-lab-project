
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const KeyboardShortcuts = () => {
  const shortcuts = [
    { key: 'W', description: 'Switch to Wall tool' },
    { key: 'I', description: 'Switch to Interior Wall tool' },
    { key: 'S', description: 'Switch to Select tool' },
    { key: 'D', description: 'Switch to Door tool' },
    { key: 'E', description: 'Switch to Eraser tool' },
    { key: 'Ctrl + Z', description: 'Undo last action' },
    { key: 'Ctrl + Y', description: 'Redo last action' },
    { key: 'Ctrl + D', description: 'Duplicate selected object' },
    { key: 'Delete', description: 'Delete selected object' },
    { key: 'Escape', description: 'Finish drawing / Deselect' },
    { key: 'Space + Drag', description: 'Pan canvas view' },
    { key: 'Ctrl + Plus', description: 'Zoom in' },
    { key: 'Ctrl + Minus', description: 'Zoom out' },
    { key: 'F', description: 'Fit to view' },
    { key: 'R', description: 'Reset view' },
    { key: 'G', description: 'Toggle grid' },
    { key: 'Ctrl + A', description: 'Select all objects' },
    { key: '?', description: 'Show this help' }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-3">
          <HelpCircle className="w-4 h-4 mr-1" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{shortcut.description}</span>
              <Badge variant="outline" className="text-xs font-mono">
                {shortcut.key}
              </Badge>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcuts;
