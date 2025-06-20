
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ShoppingCart, ExternalLink, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRFQ } from '@/contexts/RFQContext';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  category: string;
  dimensions: string;
  description: string;
  specifications: string[];
  image: string;
}

interface Hotspot {
  id: string;
  x: number;
  y: number;
  product: Product;
}

const ShopTheLook = () => {
  const { addItem } = useRFQ();
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const products: Product[] = [
    {
      id: 'fh-001',
      name: 'Chemical Fume Hood - Standard',
      category: 'Broen-Lab',
      dimensions: '1500 × 750 × 2400mm',
      description: 'Standard chemical fume hood with variable air volume control and energy-efficient design.',
      specifications: ['VAV Control', 'Energy Efficient', 'ASHRAE 110 Compliant'],
      image: '/placeholder.svg'
    },
    {
      id: 'lb-001',
      name: 'Epoxy Resin Lab Bench',
      category: 'Hamilton Laboratory Solutions',
      dimensions: '3000 × 750 × 850mm',
      description: 'Chemical-resistant epoxy resin lab bench with integrated utilities.',
      specifications: ['Chemical Resistant', 'Integrated Utilities', 'Modular Design'],
      image: '/placeholder.svg'
    },
    {
      id: 'ew-001',
      name: 'Emergency Eye Wash Station',
      category: 'Oriental Giken Inc.',
      dimensions: '600 × 400 × 1200mm',
      description: 'ANSI Z358.1 compliant emergency eye wash station with stainless steel construction.',
      specifications: ['ANSI Z358.1', 'Stainless Steel', 'Hands-Free Operation'],
      image: '/placeholder.svg'
    },
    {
      id: 'sc-001',
      name: 'Chemical Storage Cabinet',
      category: 'Innosin Lab',
      dimensions: '1200 × 600 × 1800mm',
      description: 'Fire-resistant chemical storage cabinet with ventilation system.',
      specifications: ['Fire Resistant', 'Ventilated', 'Multiple Shelves'],
      image: '/placeholder.svg'
    }
  ];

  const hotspots: Hotspot[] = [
    {
      id: 'fume-hood',
      x: 15,
      y: 25,
      product: products[0]
    },
    {
      id: 'lab-bench',
      x: 65,
      y: 70,
      product: products[1]
    },
    {
      id: 'eye-wash',
      x: 85,
      y: 35,
      product: products[2]
    },
    {
      id: 'storage',
      x: 25,
      y: 80,
      product: products[3]
    }
  ];

  const handleAddToQuote = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      category: product.category,
      dimensions: product.dimensions,
      image: product.image
    });
    toast.success(`${product.name} added to quote request`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-serif font-bold text-primary mb-4 tracking-tight">
          Build This <span className="text-sea">Lab</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
          Explore our past projects fitted with premium laboratory furniture and equipment. 
          Click on the interactive points to discover the products used in this real laboratory setup.
        </p>
      </div>
      
      <Card className="overflow-hidden shadow-xl border-0 bg-white rounded-3xl">
        <CardContent className="p-0">
          <div className="relative">
            {/* Laboratory Background Image */}
            <img
              src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=700&fit=crop"
              alt="Modern Laboratory Setup"
              className="w-full h-[700px] object-cover"
            />
            
            {/* Hotspots */}
            {hotspots.map((hotspot) => (
              <Popover key={hotspot.id} open={activeHotspot === hotspot.id} onOpenChange={(open) => setActiveHotspot(open ? hotspot.id : null)}>
                <PopoverTrigger asChild>
                  <Button
                    className="absolute w-8 h-8 rounded-full bg-white border-4 border-blue-500 shadow-lg hover:scale-110 transition-all duration-200 p-0 animate-pulse hover:animate-none"
                    style={{
                      left: `${hotspot.x}%`,
                      top: `${hotspot.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={() => setActiveHotspot(activeHotspot === hotspot.id ? null : hotspot.id)}
                  >
                    <Plus className="w-4 h-4 text-blue-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0 shadow-2xl border-0" side="top" align="center">
                  <Card className="border-0">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <Badge variant="outline" className="mb-2 text-xs">
                            {hotspot.product.category}
                          </Badge>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {hotspot.product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Dimensions:</span> {hotspot.product.dimensions}
                          </p>
                        </div>
                        
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {hotspot.product.description}
                        </p>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
                          <div className="flex flex-wrap gap-1">
                            {hotspot.product.specifications.map((spec, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 pt-2">
                          <Button
                            onClick={() => handleAddToQuote(hotspot.product)}
                            className="flex-1 bg-black hover:bg-gray-800 text-white"
                            size="sm"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Quote
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Link to={`/products?category=${encodeURIComponent(hotspot.product.category)}`}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </PopoverContent>
              </Popover>
            ))}
            
            {/* Instructions Overlay */}
            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                  <Plus className="w-3 h-3 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Click the <span className="text-blue-500">+</span> icons to explore products
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopTheLook;
