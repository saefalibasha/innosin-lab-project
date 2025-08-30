import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Maximize2, 
  Minimize2, 
  Download, 
  Save, 
  Upload,
  RotateCw,
  Copy,
  Trash2,
  Ruler,
  Grid3X3,
  Layers,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { products } from '@/data/products';
import HeroNavigation from '@/components/HeroNavigation';
import Footer from '@/components/Footer';

interface PlacedItem {
  id: string;
  productId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
}

interface FloorPlan {
  id: string;
  name: string;
  width: number;
  height: number;
  items: PlacedItem[];
  createdAt: Date;
  notes: string;
}

const FloorPlanner = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<PlacedItem | null>(null);
  const [draggedItem, setDraggedItem] = useState<PlacedItem | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [showGrid, setShowGrid] = useState(true);
  const [planName, setPlanName] = useState('Untitled Floor Plan');
  const [planNotes, setPlanNotes] = useState('');
  const [savedPlans, setSavedPlans] = useState<FloorPlan[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  const filteredProducts = products.filter(p => p.category === 'Innosin Lab');

  const handleDragStart = useCallback((product: any) => {
    const newItem: PlacedItem = {
      id: `item-${Date.now()}`,
      productId: product.id,
      name: product.name,
      x: 100,
      y: 100,
      width: 80,
      height: 60,
      rotation: 0,
      color: '#3b82f6'
    };
    setDraggedItem(newItem);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!draggedItem) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newItem = {
      ...draggedItem,
      x: x - draggedItem.width / 2,
      y: y - draggedItem.height / 2
    };

    setPlacedItems(prev => [...prev, newItem]);
    setDraggedItem(null);
    toast.success(`Added ${newItem.name} to floor plan`);
  }, [draggedItem]);

  const handleItemClick = useCallback((item: PlacedItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(item);
  }, []);

  const updateSelectedItem = useCallback((updates: Partial<PlacedItem>) => {
    if (!selectedItem) return;

    setPlacedItems(prev => 
      prev.map(item => 
        item.id === selectedItem.id ? { ...item, ...updates } : item
      )
    );
    setSelectedItem(prev => prev ? { ...prev, ...updates } : null);
  }, [selectedItem]);

  const deleteSelectedItem = useCallback(() => {
    if (!selectedItem) return;

    setPlacedItems(prev => prev.filter(item => item.id !== selectedItem.id));
    setSelectedItem(null);
    toast.success('Item deleted');
  }, [selectedItem]);

  const duplicateSelectedItem = useCallback(() => {
    if (!selectedItem) return;

    const newItem = {
      ...selectedItem,
      id: `item-${Date.now()}`,
      x: selectedItem.x + 20,
      y: selectedItem.y + 20
    };

    setPlacedItems(prev => [...prev, newItem]);
    setSelectedItem(newItem);
    toast.success('Item duplicated');
  }, [selectedItem]);

  const savePlan = useCallback(() => {
    const plan: FloorPlan = {
      id: `plan-${Date.now()}`,
      name: planName,
      width: canvasSize.width,
      height: canvasSize.height,
      items: placedItems,
      createdAt: new Date(),
      notes: planNotes
    };

    setSavedPlans(prev => [...prev, plan]);
    localStorage.setItem('floorPlans', JSON.stringify([...savedPlans, plan]));
    toast.success('Floor plan saved');
  }, [planName, canvasSize, placedItems, planNotes, savedPlans]);

  const exportToPDF = useCallback(() => {
    const pdf = new jsPDF('landscape');
    pdf.text(planName, 20, 20);
    pdf.text(`Dimensions: ${canvasSize.width} x ${canvasSize.height}`, 20, 30);
    
    if (planNotes) {
      pdf.text('Notes:', 20, 40);
      pdf.text(planNotes, 20, 50);
    }

    placedItems.forEach((item, index) => {
      const yPos = 70 + (index * 10);
      pdf.text(`${item.name} - Position: (${Math.round(item.x)}, ${Math.round(item.y)})`, 20, yPos);
    });

    pdf.save(`${planName}.pdf`);
    toast.success('Floor plan exported to PDF');
  }, [planName, canvasSize, placedItems, planNotes]);

  useEffect(() => {
    const savedPlansData = localStorage.getItem('floorPlans');
    if (savedPlansData) {
      setSavedPlans(JSON.parse(savedPlansData));
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {!isFullscreen && <HeroNavigation />}
      
      <main className="flex-grow">
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''} flex h-full`}>
          {/* Sidebar */}
          <div className="w-80 border-r bg-gray-50 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Floor Planner</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name</Label>
                <Input
                  id="planName"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="Enter plan name"
                />
              </div>
            </div>

            {/* Products Library */}
            <div className="flex-1 overflow-auto p-4">
              <h3 className="font-medium mb-3">Product Library</h3>
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-grab hover:shadow-md transition-shadow"
                    onClick={() => handleDragStart(product)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-product.jpg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {product.company}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Selected Item Properties */}
            {selectedItem && (
              <div className="border-t p-4 bg-white">
                <h3 className="font-medium mb-3">Properties</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Position X</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedItem.x)}
                      onChange={(e) => updateSelectedItem({ x: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Position Y</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedItem.y)}
                      onChange={(e) => updateSelectedItem({ y: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Rotation</Label>
                    <Input
                      type="number"
                      value={selectedItem.rotation}
                      onChange={(e) => updateSelectedItem({ rotation: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={duplicateSelectedItem}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateSelectedItem({ rotation: selectedItem.rotation + 90 })}>
                      <RotateCw className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={deleteSelectedItem}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="border-b p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
                    <Grid3X3 className="h-4 w-4 mr-1" />
                    Grid
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <span className="text-sm text-muted-foreground">
                    Canvas: {canvasSize.width} × {canvasSize.height}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={savePlan}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportToPDF}>
                    <Download className="h-4 w-4 mr-1" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-auto bg-gray-100 p-8">
              <div
                ref={canvasRef}
                className="relative bg-white border border-gray-300 mx-auto"
                style={{ 
                  width: canvasSize.width, 
                  height: canvasSize.height,
                  backgroundImage: showGrid ? 'radial-gradient(circle, #ccc 1px, transparent 1px)' : 'none',
                  backgroundSize: showGrid ? '20px 20px' : 'auto'
                }}
                onClick={handleCanvasClick}
              >
                {placedItems.map((item) => (
                  <div
                    key={item.id}
                    className={`absolute border-2 cursor-move flex items-center justify-center text-xs font-medium text-white ${
                      selectedItem?.id === item.id ? 'border-red-500' : 'border-gray-400'
                    }`}
                    style={{
                      left: item.x,
                      top: item.y,
                      width: item.width,
                      height: item.height,
                      backgroundColor: item.color,
                      transform: `rotate(${item.rotation}deg)`
                    }}
                    onClick={(e) => handleItemClick(item, e)}
                  >
                    <span className="truncate px-1">{item.name.split(' ').slice(0, 2).join(' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {!isFullscreen && <Footer />}
    </div>
  );
};

export default FloorPlanner;
