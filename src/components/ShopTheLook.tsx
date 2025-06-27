
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ShoppingCart, ExternalLink, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRFQ } from '@/contexts/RFQContext';
import { toast } from 'sonner';
import { shopTheLookContent } from '@/data/shopTheLookContent';

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

  // Convert content data to component format
  const products: Product[] = shopTheLookContent.hotspots.map(hotspot => ({
    id: hotspot.id.toString(),
    name: hotspot.title,
    category: hotspot.category,
    dimensions: 'Contact for specifications',
    description: hotspot.description,
    specifications: ['Premium Quality', 'Professional Grade', 'Industry Standard'],
    image: hotspot.image
  }));

  const hotspots: Hotspot[] = shopTheLookContent.hotspots.map(hotspot => ({
    id: hotspot.id.toString(),
    x: hotspot.x,
    y: hotspot.y,
    product: products.find(p => p.id === hotspot.id.toString())!
  }));

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
          {shopTheLookContent.section.title} <span className="text-sea">{shopTheLookContent.section.titleHighlight}</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
          {shopTheLookContent.section.description}
        </p>
      </div>
      
      <Card className="overflow-hidden shadow-xl border-0 bg-white rounded-3xl">
        <CardContent className="p-0">
          <div className="relative">
            {/* Laboratory Background Image */}
            <img
              src={shopTheLookContent.section.backgroundImage}
              alt={shopTheLookContent.section.backgroundAlt}
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
                            <span className="font-medium">Price:</span> {shopTheLookContent.hotspots.find(h => h.id.toString() === hotspot.id)?.price || 'Contact for pricing'}
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
                            <Link to={shopTheLookContent.hotspots.find(h => h.id.toString() === hotspot.id)?.productLink || '/products'}>
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
