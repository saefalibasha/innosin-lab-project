
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RealisticProduct3DViewer from '@/components/RealisticProduct3DViewer';

type DrawingTool = 'wall' | 'line' | 'freehand' | 'pan' | 'eraser' | 'select' | 'interior-wall' | 'door' | 'rotate';

interface ObjectLibraryProps {
  onProductDrag: (product: any) => void;
  currentTool: DrawingTool;
}

const ObjectLibrary: React.FC<ObjectLibraryProps> = ({ onProductDrag, currentTool }) => {
  const categories = [
    {
      name: 'Lab Benches',
      items: [
        {
          id: 'lab-bench-standard',
          name: 'Standard Lab Bench',
          dimensions: { length: 3.0, width: 0.75, height: 0.85 },
          color: '#3b82f6',
          modelType: 'box'
        },
        {
          id: 'lab-bench-island',
          name: 'Island Lab Bench',
          dimensions: { length: 4.0, width: 1.5, height: 0.85 },
          color: '#1d4ed8',
          modelType: 'box'
        },
        {
          id: 'lab-bench-corner',
          name: 'Corner Lab Bench',
          dimensions: { length: 2.0, width: 2.0, height: 0.85 },
          color: '#2563eb',
          modelType: 'box'
        }
      ]
    },
    {
      name: 'Fume Hoods',
      items: [
        {
          id: 'fume-hood-standard',
          name: 'Standard Fume Hood',
          dimensions: { length: 1.5, width: 0.75, height: 2.4 },
          color: '#ef4444',
          modelType: 'box'
        },
        {
          id: 'fume-hood-walk-in',
          name: 'Walk-in Fume Hood',
          dimensions: { length: 2.5, width: 1.2, height: 2.4 },
          color: '#dc2626',
          modelType: 'box'
        },
        {
          id: 'fume-hood-bench-top',
          name: 'Bench-top Fume Hood',
          dimensions: { length: 1.2, width: 0.6, height: 1.8 },
          color: '#f87171',
          modelType: 'box'
        }
      ]
    },
    {
      name: 'Safety Equipment',
      items: [
        {
          id: 'eye-wash',
          name: 'Eye Wash Station',
          dimensions: { length: 0.6, width: 0.4, height: 1.2 },
          color: '#10b981',
          modelType: 'cone'
        },
        {
          id: 'safety-shower',
          name: 'Emergency Shower',
          dimensions: { length: 1.0, width: 1.0, height: 2.2 },
          color: '#059669',
          modelType: 'sphere'
        },
        {
          id: 'fire-extinguisher',
          name: 'Fire Extinguisher',
          dimensions: { length: 0.3, width: 0.3, height: 1.0 },
          color: '#dc2626',
          modelType: 'sphere'
        }
      ]
    },
    {
      name: 'Storage',
      items: [
        {
          id: 'storage-cabinet',
          name: 'Storage Cabinet',
          dimensions: { length: 1.2, width: 0.6, height: 1.8 },
          color: '#f59e0b',
          modelType: 'box'
        },
        {
          id: 'chemical-storage',
          name: 'Chemical Storage',
          dimensions: { length: 1.0, width: 0.8, height: 2.0 },
          color: '#d97706',
          modelType: 'box'
        },
        {
          id: 'overhead-cabinet',
          name: 'Overhead Cabinet',
          dimensions: { length: 1.5, width: 0.4, height: 0.6 },
          color: '#fbbf24',
          modelType: 'box'
        }
      ]
    },
    {
      name: 'Equipment',
      items: [
        {
          id: 'autoclave',
          name: 'Autoclave',
          dimensions: { length: 0.8, width: 0.6, height: 1.0 },
          color: '#8b5cf6',
          modelType: 'sphere'
        },
        {
          id: 'centrifuge',
          name: 'Centrifuge',
          dimensions: { length: 0.5, width: 0.5, height: 0.4 },
          color: '#7c3aed',
          modelType: 'sphere'
        },
        {
          id: 'microscope-station',
          name: 'Microscope Station',
          dimensions: { length: 1.0, width: 0.6, height: 0.85 },
          color: '#a855f7',
          modelType: 'box'
        }
      ]
    }
  ];

  const handleDragStart = (e: React.DragEvent, product: any) => {
    e.dataTransfer.setData('product', JSON.stringify({
      ...product,
      category: categories.find(cat => cat.items.some(item => item.id === product.id))?.name || 'Uncategorized'
    }));
    onProductDrag(product);
  };

  const isInteractionDisabled = currentTool !== 'select' && currentTool !== 'wall';

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Object Library</CardTitle>
        <div className="text-xs text-gray-500">
          Drag objects to the canvas
        </div>
      </CardHeader>
      <CardContent>
        {isInteractionDisabled && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            Switch to Select tool to place objects
          </div>
        )}
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {categories.map(category => (
            <div key={category.name}>
              <h4 className="font-medium text-xs text-gray-700 mb-2 uppercase tracking-wide">
                {category.name}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {category.items.map(item => (
                  <div
                    key={item.id}
                    draggable={!isInteractionDisabled}
                    onDragStart={(e) => handleDragStart(e, item)}
                    className={`border rounded-lg transition-all duration-200 ${
                      isInteractionDisabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'cursor-move hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="p-2">
                      <RealisticProduct3DViewer
                        productType={item.modelType as any}
                        color={item.color}
                        className="w-full h-16 mb-2 rounded"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-2 h-2 rounded-full border"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium text-xs truncate">{item.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {item.dimensions.length} × {item.dimensions.width}m
                        </p>
                        <Badge variant="secondary" className="text-xs h-4 px-1">
                          {category.name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ObjectLibrary;
