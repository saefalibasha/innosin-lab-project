
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  Minus, 
  Move, 
  DoorOpen, 
  Eraser, 
  RotateCcw, 
  Grid,
  Ruler,
  Download,
  Send,
  Package
} from 'lucide-react';

interface HowToUseModalProps {
  children: React.ReactNode;
}

const HowToUseModal: React.FC<HowToUseModalProps> = ({ children }) => {
  const toolGuide = [
    {
      icon: Home,
      name: 'Wall Tool',
      shortcut: 'W',
      description: 'Click to place wall points. Double-click to finish the room shape.'
    },
    {
      icon: Minus,
      name: 'Interior Wall',
      shortcut: 'I',
      description: 'Click to start an interior wall, click again to end it.'
    },
    {
      icon: DoorOpen,
      name: 'Door Tool',
      shortcut: 'D',
      description: 'Click near a wall to place a door opening.'
    },
    {
      icon: Move,
      name: 'Select Tool',
      shortcut: 'S',
      description: 'Click objects to select them. Drag to move selected objects.'
    },
    {
      icon: RotateCcw,
      name: 'Rotate Tool',
      shortcut: 'R',
      description: 'Click an object to rotate it by 90 degrees.'
    },
    {
      icon: Eraser,
      name: 'Eraser Tool',
      shortcut: 'E',
      description: 'Click objects or wall points to delete them.'
    }
  ];

  const shortcuts = [
    { key: 'Ctrl + Z', action: 'Undo last action' },
    { key: 'Ctrl + Y', action: 'Redo last action' },
    { key: 'M', action: 'Toggle measurements display' },
    { key: 'G', action: 'Toggle grid display' },
    { key: 'F', action: 'Fit view to content' },
    { key: 'Ctrl + A', action: 'Select all objects' },
    { key: 'Ctrl + C', action: 'Copy selected objects' },
    { key: 'Ctrl + V', action: 'Paste copied objects' },
    { key: 'Delete', action: 'Delete selected objects' }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">How to Use Floor Planner</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold">1. Draw Your Room</h4>
                <p className="text-sm text-gray-600">
                  Select the Wall Tool (W) and click to place points around your room perimeter. 
                  Double-click to complete the room shape.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">2. Add Interior Elements</h4>
                <p className="text-sm text-gray-600">
                  Use Interior Wall Tool (I) to divide spaces and Door Tool (D) to add openings.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">3. Place Lab Equipment</h4>
                <p className="text-sm text-gray-600">
                  Switch to the Objects tab and drag lab equipment from the library onto your floor plan.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">4. Export or Send Enquiry</h4>
                <p className="text-sm text-gray-600">
                  Use the Export button to download your plan or Send Enquiry to request a quote.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tools Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tools Reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {toolGuide.map((tool, index) => (
                <div key={index} className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50">
                  <tool.icon className="w-5 h-5 mt-0.5 text-blue-600" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{tool.name}</span>
                      <Badge variant="outline" className="text-xs">{tool.shortcut}</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{tool.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <Badge variant="outline" className="font-mono text-xs">
                    {shortcut.key}
                  </Badge>
                  <span className="text-sm text-gray-600">{shortcut.action}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tips & Tricks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips & Tricks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <Ruler className="w-4 h-4 mr-2" />
                  Measurements
                </h4>
                <p className="text-sm text-gray-600">
                  Toggle measurements (M) to see wall lengths. Change units in the Tools tab.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <Grid className="w-4 h-4 mr-2" />
                  Snap to Grid
                </h4>
                <p className="text-sm text-gray-600">
                  Enable grid (G) for precise placement. Objects will snap to grid intersections.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Lab Equipment
                </h4>
                <p className="text-sm text-gray-600">
                  Drag lab benches, fume hoods, and safety equipment from the Objects library.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <Send className="w-4 h-4 mr-2" />
                  Get a Quote
                </h4>
                <p className="text-sm text-gray-600">
                  Send your floor plan to our team for a custom lab design quote.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HowToUseModal;
