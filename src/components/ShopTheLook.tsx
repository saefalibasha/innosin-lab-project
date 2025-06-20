
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const ShopTheLook = () => {
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  const labProducts = [
    {
      id: 1,
      name: "Advanced Fume Hood",
      price: "Request Quote",
      position: { x: 25, y: 35 },
      category: "Broen-Lab"
    },
    {
      id: 2,
      name: "Laboratory Bench",
      price: "Request Quote", 
      position: { x: 60, y: 55 },
      category: "Hamilton Laboratory Solutions"
    },
    {
      id: 3,
      name: "Emergency Shower",
      price: "Request Quote",
      position: { x: 15, y: 70 },
      category: "Oriental Giken Inc."
    },
    {
      id: 4,
      name: "Storage Cabinet",
      price: "Request Quote",
      position: { x: 80, y: 40 },
      category: "Innosin Lab"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-serif font-bold text-primary mb-6 tracking-tight">
          Build This <span className="text-sea">Laboratory</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
          Explore our interactive lab setup and click on the hotspots to discover the products that create this modern research environment
        </p>
      </div>

      <div className="relative w-full max-w-4xl mx-auto">
        {/* LAB SETUP BACKGROUND IMAGE - Replace with: public/interactive-lab/lab-setup-background.jpg */}
        {/* Current: Placeholder image, should show clean modern laboratory workspace */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=1200&h=800&fit=crop"
            alt="Interactive Laboratory Setup - Replace with actual lab workspace image"
            className="w-full h-96 md:h-[500px] object-cover rounded-lg shadow-lg"
          />
          
          {/* Interactive hotspots */}
          {labProducts.map((product) => (
            <button
              key={product.id}
              className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all duration-300 ${
                selectedProduct === product.id 
                  ? 'bg-sea scale-125 animate-pulse' 
                  : 'bg-sea/80 hover:bg-sea hover:scale-110'
              }`}
              style={{
                left: `${product.position.x}%`,
                top: `${product.position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => setSelectedProduct(selectedProduct === product.id ? null : product.id)}
            >
              <div className="w-full h-full rounded-full bg-white/30 animate-ping"></div>
            </button>
          ))}
        </div>

        {/* Product information panel */}
        {selectedProduct && (
          <Card className="absolute bottom-4 left-4 right-4 md:relative md:mt-6 glass-card border-sea/20">
            <CardContent className="p-6">
              {(() => {
                const product = labProducts.find(p => p.id === selectedProduct);
                return product ? (
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <Badge variant="outline" className="mb-2 border-sea text-sea">
                        {product.category}
                      </Badge>
                      <h3 className="text-xl font-serif font-semibold text-primary mb-2">
                        {product.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Professional laboratory equipment designed for modern research environments
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" size="sm">
                        <Info className="w-4 h-4 mr-2" />
                        Learn More
                      </Button>
                      <Button size="sm" className="bg-sea hover:bg-sea-dark">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Quote
                      </Button>
                    </div>
                  </div>
                ) : null;
              })()}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="text-center">
        <Button asChild variant="outline" size="lg" className="animate-pulse-subtle">
          <Link to="/products">
            View All Laboratory Products
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ShopTheLook;
