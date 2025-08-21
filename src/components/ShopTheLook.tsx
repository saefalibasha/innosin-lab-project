
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/anim';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ShoppingCart, ExternalLink, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRFQ } from '@/contexts/RFQContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Product {
  id: string;
  name: string;
  category: string;
  dimensions: string;
  description: string;
  specifications: string[];
  image: string;
  price: string;
  productLink: string;
}

interface Hotspot {
  id: string;
  x: number;
  y: number;
  product: Product;
}

interface ShopLookContent {
  title: string;
  titleHighlight: string;
  description: string;
  backgroundImage: string;
  backgroundAlt: string;
}

const ShopTheLook = () => {
  const { addItem } = useRFQ();
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // Fetch shop look content
  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ['shop-look-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_content')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      
      return data ? {
        title: data.title || 'Shop',
        titleHighlight: data.title_highlight || 'The Look',
        description: data.description || 'Explore our featured laboratory setup.',
        backgroundImage: data.background_image || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1920&q=80',
        backgroundAlt: data.background_alt || 'Modern Laboratory Setup'
      } as ShopLookContent : null;
    }
  });

  // Fetch hotspots
  const { data: hotspots = [], isLoading: hotspotsLoading } = useQuery({
    queryKey: ['shop-look-hotspots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_hotspots')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      
      return data.map(hotspot => ({
        id: hotspot.id,
        x: Number(hotspot.x_position),
        y: Number(hotspot.y_position),
        product: {
          id: hotspot.id,
          name: hotspot.title,
          category: hotspot.category || 'Laboratory Equipment',
          dimensions: 'Contact for specifications',
          description: hotspot.description || '',
          specifications: Array.isArray(hotspot.specifications) 
            ? hotspot.specifications as string[]
            : ['Premium Quality', 'Professional Grade', 'Industry Standard'],
          image: hotspot.image || '',
          price: hotspot.price || 'Contact for pricing',
          productLink: hotspot.product_link || '/products'
        }
      })) as Hotspot[];
    }
  });

  if (contentLoading || hotspotsLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="overflow-hidden shadow-xl border-0 bg-white rounded-3xl">
          <CardContent className="p-12 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
              <div className="h-[700px] bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      {content && (
        <Reveal>
          <div className="text-center mb-8">
            <h2 className="text-4xl font-serif font-bold text-primary mb-4 tracking-tight">
              {content.title} <span className="text-sea">{content.titleHighlight}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
              {content.description}
            </p>
          </div>
        </Reveal>
      )}
      
      <Card className="overflow-hidden shadow-xl border-0 bg-white rounded-3xl">
        <CardContent className="p-0">
          <div className="relative">
            {/* Laboratory Background Image - Full Size */}
            <img
              src={content?.backgroundImage || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1920&q=80'}
              alt={content?.backgroundAlt || 'Modern Laboratory Setup'}
              className="w-full h-[700px] object-cover object-center"
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
                            <span className="font-medium">Price:</span> {hotspot.product.price}
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
                            <Link to={hotspot.product.productLink}>
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
