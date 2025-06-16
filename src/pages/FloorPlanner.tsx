
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Save, Grid, Ruler, Move } from 'lucide-react';
import { toast } from 'sonner';

const FloorPlanner = () => {
  const [roomDimensions, setRoomDimensions] = useState({
    length: 8,
    width: 6,
    height: 3
  });

  const [selectedTool, setSelectedTool] = useState('select');
  const [placedItems, setPlacedItems] = useState<any[]>([]);

  const tools = [
    { id: 'select', name: 'Select', icon: <Move className="w-4 h-4" /> },
    { id: 'measure', name: 'Measure', icon: <Ruler className="w-4 h-4" /> },
    { id: 'grid', name: 'Grid', icon: <Grid className="w-4 h-4" /> }
  ];

  const productLibrary = [
    {
      id: 'fh-std',
      name: 'Standard Fume Hood',
      dimensions: { length: 1.5, width: 0.75, height: 2.4 },
      category: 'Fume Hoods',
      color: '#ef4444'
    },
    {
      id: 'lab-bench',
      name: 'Lab Bench',
      dimensions: { length: 3.0, width: 0.75, height: 0.85 },
      category: 'Lab Benches',
      color: '#3b82f6'
    },
    {
      id: 'eye-wash',
      name: 'Eye Wash Station',
      dimensions: { length: 0.6, width: 0.4, height: 1.2 },
      category: 'Safety Equipment',
      color: '#10b981'
    },
    {
      id: 'storage',
      name: 'Storage Cabinet',
      dimensions: { length: 1.2, width: 0.6, height: 1.8 },
      category: 'Storage',
      color: '#f59e0b'
    }
  ];

  const handleSaveLayout = () => {
    toast.success('Floor plan saved successfully!');
  };

  const handleExportPDF = () => {
    toast.success('Floor plan exported as PDF!');
  };

  const handleDragStart = (e: React.DragEvent, product: any) => {
    e.dataTransfer.setData('product', JSON.stringify(product));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const product = JSON.parse(e.dataTransfer.getData('product'));
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newItem = {
      ...product,
      id: `${product.id}-${Date.now()}`,
      position: { x, y },
      rotation: 0
    };
    
    setPlacedItems([...placedItems, newItem]);
    toast.success(`${product.name} placed in floor plan`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const scale = 40; // pixels per meter
  const canvasWidth = roomDimensions.length * scale;
  const canvasHeight = roomDimensions.width * scale;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Floor Planner</h1>
          <p className="text-xl text-gray-600">
            Design your laboratory layout with our interactive floor planning tool
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Room Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Room Dimensions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="length">Length (m)</Label>
                  <Input
                    id="length"
                    type="number"
                    value={roomDimensions.length}
                    onChange={(e) => setRoomDimensions({
                      ...roomDimensions,
                      length: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="width">Width (m)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={roomDimensions.width}
                    onChange={(e) => setRoomDimensions({
                      ...roomDimensions,
                      width: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (m)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={roomDimensions.height}
                    onChange={(e) => setRoomDimensions({
                      ...roomDimensions,
                      height: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tools.map(tool => (
                    <Button
                      key={tool.id}
                      variant={selectedTool === tool.id ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setSelectedTool(tool.id)}
                    >
                      {tool.icon}
                      <span className="ml-2">{tool.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Product Library */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Library</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {productLibrary.map(product => (
                    <div
                      key={product.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, product)}
                      className="p-3 border rounded-lg cursor-move hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: product.color }}
                        />
                        <span className="font-medium text-sm">{product.name}</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {product.dimensions.length}×{product.dimensions.width}×{product.dimensions.height}m
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {product.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Canvas Area */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Floor Plan Canvas</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleSaveLayout}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleExportPDF}>
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white relative overflow-auto">
                  <div
                    className="relative bg-gray-100 border-2 border-gray-400 mx-auto"
                    style={{
                      width: `${canvasWidth}px`,
                      height: `${canvasHeight}px`,
                      minWidth: '400px',
                      minHeight: '300px'
                    }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    {/* Grid Pattern */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ opacity: 0.3 }}
                    >
                      <defs>
                        <pattern
                          id="grid"
                          width={scale}
                          height={scale}
                          patternUnits="userSpaceOnUse"
                        >
                          <path
                            d={`M ${scale} 0 L 0 0 0 ${scale}`}
                            fill="none"
                            stroke="#d1d5db"
                            strokeWidth="1"
                          />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>

                    {/* Room Label */}
                    <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded shadow text-sm font-medium">
                      {roomDimensions.length}m × {roomDimensions.width}m × {roomDimensions.height}m
                    </div>

                    {/* Placed Items */}
                    {placedItems.map((item, index) => (
                      <div
                        key={index}
                        className="absolute border-2 border-gray-600 cursor-move flex items-center justify-center text-xs font-medium text-white"
                        style={{
                          left: `${item.position.x}px`,
                          top: `${item.position.y}px`,
                          width: `${item.dimensions.length * scale}px`,
                          height: `${item.dimensions.width * scale}px`,
                          backgroundColor: item.color,
                          transform: `rotate(${item.rotation}deg)`
                        }}
                      >
                        {item.name}
                      </div>
                    ))}

                    {/* Drop Zone Message */}
                    {placedItems.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-lg">
                        Drag products from the library to place them in your lab
                      </div>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Set your room dimensions in the sidebar</li>
                    <li>• Drag products from the library onto the canvas</li>
                    <li>• Click on placed items to select and modify them</li>
                    <li>• Use the tools to measure distances and toggle grid view</li>
                    <li>• Save your layout or export as PDF when finished</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanner;
