
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import FloorPlannerCanvas from '@/components/FloorPlannerCanvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Download, Save, Grid, Ruler, Move } from 'lucide-react';
import { toast } from 'sonner';

interface Point {
  x: number;
  y: number;
}

interface PlacedProduct {
  id: string;
  productId: string;
  name: string;
  position: Point;
  rotation: number;
  dimensions: { length: number; width: number; height: number };
  color: string;
}

const FloorPlanner = () => {
  const [roomPoints, setRoomPoints] = useState<Point[]>([]);
  const [placedProducts, setPlacedProducts] = useState<PlacedProduct[]>([]);
  const [isDrawingMode, setIsDrawingMode] = useState(true);
  const [scale] = useState(40); // pixels per meter

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

  const handleDragStart = (e: React.DragEvent, product: any) => {
    e.dataTransfer.setData('product', JSON.stringify(product));
  };

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
            {/* Drawing Mode Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant={isDrawingMode ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setIsDrawingMode(true)}
                  >
                    <Ruler className="w-4 h-4 mr-2" />
                    Draw Room
                  </Button>
                  <Button
                    variant={!isDrawingMode ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setIsDrawingMode(false)}
                  >
                    <Move className="w-4 h-4 mr-2" />
                    Place Products
                  </Button>
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
                      draggable={!isDrawingMode}
                      onDragStart={(e) => handleDragStart(e, product)}
                      className={`p-3 border rounded-lg transition-colors ${
                        isDrawingMode ? 'opacity-50 cursor-not-allowed' : 'cursor-move hover:bg-gray-50'
                      }`}
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
            <FloorPlannerCanvas
              roomPoints={roomPoints}
              setRoomPoints={setRoomPoints}
              placedProducts={placedProducts}
              setPlacedProducts={setPlacedProducts}
              isDrawingMode={isDrawingMode}
              scale={scale}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanner;
