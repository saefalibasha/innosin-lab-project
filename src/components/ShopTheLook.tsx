import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, ShoppingCart, ArrowRight } from 'lucide-react';

interface Hotspot {
  id: string;
  title: string;
  description: string;
  x_position: number;
  y_position: number;
  price: string;
  category: string;
  image: string;
  product_link: string;
  specifications: string[];
}

interface ShopLookContent {
  title: string;
  title_highlight: string;
  description: string;
  background_image: string;
  background_alt: string;
}

const ShopTheLook = () => {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  // Fetch shop look content
  const { data: shopLookContent } = useQuery({
    queryKey: ['shop-look-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      // Return default content if none found
      return data || {
        title: "Shop The Look",
        title_highlight: "Premium Laboratory Solutions",
        description: "Discover our complete range of laboratory equipment and furniture designed for modern research facilities. Click on the interactive points to explore each product in detail.",
        background_image: "/api/placeholder/1200/800",
        background_alt: "Modern laboratory setup with premium equipment"
      };
    }
  });

  // Fetch hotspots from Supabase
  const { data: hotspots = [], isLoading } = useQuery({
    queryKey: ['shop-look-hotspots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_hotspots')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      
      // Transform specifications from JSON to string array
      return data.map(hotspot => ({
        ...hotspot,
        specifications: Array.isArray(hotspot.specifications) 
          ? hotspot.specifications 
          : typeof hotspot.specifications === 'string' 
            ? [hotspot.specifications]
            : ['Premium Quality', 'Professional Grade', 'Industry Standard']
      })) as Hotspot[];
    }
  });

  if (isLoading || !shopLookContent) {
    return (
      <section className="py-16 bg-gradient-to-br from-white via-gray-50/30 to-sea/5">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-white via-gray-50/30 to-sea/5">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Shop The <span className="text-blue-600">Look</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our products that have been fully set up in real laboratory environments. 
            Click on the blue markers to discover detailed product information and specifications.
          </p>
        </div>

        {/* Full Width Interactive Image with Overlay */}
        <div className="relative">
          <div className="grid lg:grid-cols-3 gap-0">
            {/* Main Image - Takes 2/3 on large screens */}
            <div className="lg:col-span-2 relative overflow-hidden rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none shadow-2xl">
              <img
                src={shopLookContent.background_image}
                alt={shopLookContent.background_alt}
                className="w-full h-auto object-cover object-center block"
                onError={(e) => {
                  e.currentTarget.src = '/api/placeholder/1200/600';
                }}
              />
              
              {/* Hotspot Markers */}
              {hotspots.map((hotspot) => (
                <button
                  key={hotspot.id}
                  className={`absolute w-8 h-8 rounded-full border-3 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-125 ${
                    selectedHotspot?.id === hotspot.id
                      ? 'bg-blue-600 animate-pulse scale-125'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  style={{
                    left: `${hotspot.x_position}%`,
                    top: `${hotspot.y_position}%`,
                  }}
                  onClick={() => setSelectedHotspot(hotspot)}
                  aria-label={`View ${hotspot.title}`}
                >
                  <div className="w-full h-full rounded-full bg-white/30 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                </button>
              ))}
            </div>

            {/* Product Details Overlay - Takes 1/3 on large screens */}
            <div className="lg:col-span-1 bg-white rounded-b-2xl lg:rounded-r-2xl lg:rounded-bl-none shadow-2xl overflow-y-auto">
              {selectedHotspot ? (
                <div className="p-6 space-y-6">
                  {/* Category Badge */}
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {selectedHotspot.category}
                  </Badge>

                  {/* Product Title */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {selectedHotspot.title}
                    </h3>
                  </div>

                  {/* Product Image */}
                  {selectedHotspot.image && (
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={selectedHotspot.image}
                        alt={selectedHotspot.title}
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/api/placeholder/400/200';
                        }}
                      />
                    </div>
                  )}

                  {/* Product Description */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 text-sm">Product Description</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {selectedHotspot.description && selectedHotspot.description.trim() !== '' 
                        ? selectedHotspot.description 
                        : "Professional laboratory furniture designed for modern research environments. Features durable construction with premium materials and ergonomic design for optimal functionality and safety."
                      }
                    </p>
                  </div>

                  {/* Dimensions & Details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm">Specifications</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Dimensions:</span>
                          <span className="font-medium">1200 x 750 x 900 mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Finish:</span>
                          <span className="font-medium">Powder Coated</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Price */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Starting Price</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedHotspot.price}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => window.open(selectedHotspot.product_link, '_blank')}
                    >
                      <ArrowRight className="w-3 h-3 mr-1" />
                      View Full Details
                    </Button>
                    <Button 
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => window.open('/contact', '_blank')}
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Request Quote
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                  <div className="text-gray-400 mb-4">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Explore Our Products
                  </h4>
                  <p className="text-sm text-gray-600">
                    Click on any blue marker in the image to discover detailed product information, specifications, and pricing.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopTheLook;
