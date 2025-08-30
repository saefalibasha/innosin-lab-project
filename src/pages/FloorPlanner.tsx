import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { jsPDF } from 'jspdf';
import { getProductsAsync } from '@/data/products';
import { Product } from '@/types/product';
import HeroNavigation from '@/components/HeroNavigation';
import Footer from '@/components/Footer';

interface FloorItem {
  id: string;
  productId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  image: string;
}

const FloorPlanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [floorItems, setFloorItems] = useState<FloorItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const productsData = await getProductsAsync();
        setProducts(productsData);
      } catch (error) {
        console.error("Error loading products:", error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [toast]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResize = useCallback(
    (id: string) =>
      (_: Event, data: ResizeCallbackData) => {
        setFloorItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  width: data.size.width,
                  height: data.size.height,
                }
              : item
          )
        );
      },
    []
  );

  const handleRotate = (id: string) => {
    setFloorItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, rotation: item.rotation + 90 } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setFloorItems(prev => prev.filter(item => item.id !== id));
  };

  const addProductToFloor = (product: Product, x: number, y: number) => {
    const newItem: FloorItem = {
      id: Date.now().toString(),
      productId: product.id,
      name: product.name,
      x,
      y,
      width: 60,
      height: 40,
      rotation: 0,
      image: product.thumbnail || product.images[0] || '/placeholder-product.jpg'
    };
    setFloorItems([...floorItems, newItem]);
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('Floor Plan Layout', 20, 30);
    
    // Add items list
    pdf.setFontSize(12);
    let yPos = 50;
    
    floorItems.forEach((item, index) => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        pdf.text(`${index + 1}. ${product.name} - ${product.category || 'Unknown Category'}`, 20, yPos);
        yPos += 10;
      }
    });
    
    pdf.save('floor-plan.pdf');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeroNavigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading products...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HeroNavigation />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Floor Planner</h1>

          {/* Product Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product List */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Available Products</CardTitle>
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2 border rounded-md mb-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => addProductToFloor(product, 50, 50)}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-md overflow-hidden mr-2">
                          <img
                            src={product.thumbnail || product.images[0] || '/placeholder-product.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-product.jpg';
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">{product.name}</Label>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {product.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Floor Plan Area */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Floor Plan</CardTitle>
                </CardHeader>
                <CardContent className="relative h-[500px] bg-gray-100 overflow-hidden">
                  {floorItems.map((item) => (
                    <ResizableBox
                      key={item.id}
                      width={item.width}
                      height={item.height}
                      x={item.x}
                      y={item.y}
                      onResize={handleResize(item.id)}
                      minConstraints={[50, 50]}
                      className="absolute shadow-md"
                      style={{
                        transform: `rotate(${item.rotation}deg)`,
                        left: `${item.x}px`,
                        top: `${item.y}px`,
                      }}
                    >
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          style={{
                            transform: `rotate(${-item.rotation}deg)`,
                          }}
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-product.jpg';
                          }}
                        />
                        <div className="absolute top-1 left-1 flex gap-1">
                          <Badge variant="secondary">{item.name}</Badge>
                        </div>
                        <div className="absolute bottom-1 right-1 flex gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRotate(item.id)}
                            style={{
                              transform: `rotate(${-item.rotation}deg)`,
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M21 15V6H3" />
                              <path d="M21 12a9 9 0 0 0-9 9" />
                              <path d="M15 18l3-3-3-3" />
                            </svg>
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            style={{
                              transform: `rotate(${-item.rotation}deg)`,
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              <line x1="10" x2="10" y1="11" y2="17" />
                              <line x1="14" x2="14" y1="11" y2="17" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </ResizableBox>
                  ))}
                </CardContent>
              </Card>

              <Button className="mt-4" onClick={exportToPDF}>
                Export to PDF
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FloorPlanner;
