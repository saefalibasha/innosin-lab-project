
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { jsPDF } from 'jspdf';
import { getProductsAsync } from '@/data/products';
import { Product } from '@/types/product';

interface FloorItem {
  id: string;
  productId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

const FloorPlanner = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [floorItems, setFloorItems] = useState<FloorItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [planName, setPlanName] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await getProductsAsync();
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToFloor = (product: Product) => {
    const newItem: FloorItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      x: Math.random() * 400,
      y: Math.random() * 300,
      width: 100,
      height: 80,
      rotation: 0,
    };
    setFloorItems(prev => [...prev, newItem]);
    
    toast({
      title: "Item added",
      description: `${product.name} added to floor plan`,
    });
  };

  const handleResize = useCallback(
    (id: string) =>
      (e: React.SyntheticEvent, data: ResizeCallbackData) => {
        setFloorItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, width: data.size.width, height: data.size.height }
              : item
          )
        );
      },
    []
  );

  const removeFromFloor = (id: string) => {
    setFloorItems(prev => prev.filter(item => item.id !== id));
  };

  const rotateItem = (id: string) => {
    setFloorItems(prev => prev.map(item => 
      item.id === id ? { ...item, rotation: (item.rotation + 90) % 360 } : item
    ));
  };

  const exportToPDF = () => {
    const pdf = new jsPDF('landscape');
    pdf.setFontSize(16);
    pdf.text(planName || 'Floor Plan', 20, 20);
    
    floorItems.forEach((item, index) => {
      pdf.setFontSize(12);
      pdf.text(`${index + 1}. ${item.name}`, 20, 40 + index * 10);
    });
    
    pdf.save(`${planName || 'floor-plan'}.pdf`);
    
    toast({
      title: "Export successful",
      description: "Floor plan exported to PDF",
    });
  };

  const savePlan = () => {
    if (!planName.trim()) {
      toast({
        title: "Plan name required",
        description: "Please enter a name for your floor plan",
        variant: "destructive",
      });
      return;
    }

    const planData = {
      name: planName,
      items: floorItems,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(`floorplan-${Date.now()}`, JSON.stringify(planData));
    
    toast({
      title: "Plan saved",
      description: "Your floor plan has been saved locally",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-full mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Floor Planner</h1>
          <p className="text-gray-600">Design your laboratory layout by dragging products onto the floor plan</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Product Library */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Product Library</CardTitle>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={product.thumbnail || product.images[0] || '/placeholder-product.jpg'} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-product.jpg';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.name}</p>
                          <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => addToFloor(product)}
                      >
                        Add to Floor
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Floor Plan Canvas */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Floor Plan Canvas</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Plan name..."
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      className="w-48"
                    />
                    <Button onClick={savePlan} variant="outline">Save</Button>
                    <Button onClick={exportToPDF} variant="outline">Export PDF</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  className="relative bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                  style={{ width: '800px', height: '600px', margin: '0 auto' }}
                >
                  {floorItems.map((item) => (
                    <div
                      key={item.id}
                      className="absolute border-2 border-blue-500 bg-blue-100 rounded shadow-lg"
                      style={{ 
                        left: item.x,
                        top: item.y,
                        transform: `rotate(${item.rotation}deg)`,
                        transformOrigin: 'center center'
                      }}
                    >
                      <ResizableBox
                        width={item.width}
                        height={item.height}
                        onResize={handleResize(item.id)}
                        minConstraints={[50, 40]}
                        className="flex items-center justify-center p-2 text-xs font-medium text-blue-800 cursor-move"
                      >
                        <div className="text-center truncate w-full">
                          {item.name}
                        </div>
                      </ResizableBox>
                      <div className="absolute -top-8 right-0 flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => rotateItem(item.id)}
                        >
                          ↻
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 w-6 p-0"
                          onClick={() => removeFromFloor(item.id)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {floorItems.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <p className="text-lg font-medium mb-2">Your floor plan is empty</p>
                        <p className="text-sm">Add products from the library to get started</p>
                      </div>
                    </div>
                  )}
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
