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
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            {shopLookContent.title}
          </h2>
        </div>

        {/* Interactive Product Discovery Card - Full Width Extended */}
        <div className="mb-0">
          <Card className="border-0 shadow-xl rounded-b-none">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <h3 className="text-2xl font-semibold text-blue-600">
                    Interactive Product Discovery
                  </h3>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
                  Click on the blue markers to explore our laboratory equipment and get detailed product information.
                </p>
                <div className="h-8"></div> {/* Spacer to extend below photo */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Width Interactive Image */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={shopLookContent.background_image}
              alt={shopLookContent.background_alt}
              className="w-full h-[500px] lg:h-[600px] object-cover object-center rounded-lg shadow-md"
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
        </div>

        {/* Product Details Below Image */}
        {selectedHotspot && (
          <div className="mt-8">
            <div className="max-w-4xl mx-auto">
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Product Info */}
                    <div className="space-y-4">
                      <div>
                        <Badge className="mb-3 bg-blue-100 text-blue-800 hover:bg-blue-200">
                          {selectedHotspot.category}
                        </Badge>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {selectedHotspot.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {selectedHotspot.description}
                        </p>
                      </div>

                      {/* Specifications */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                        <div className="space-y-2">
                          {selectedHotspot.specifications.map((spec, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-gray-600">{spec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Product Image and Actions */}
                    <div className="space-y-4">
                      {selectedHotspot.image && (
                        <div className="relative overflow-hidden rounded-lg">
                          <img
                            src={selectedHotspot.image}
                            alt={selectedHotspot.title}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/api/placeholder/400/200';
                            }}
                          />
                        </div>
                      )}

                      {/* Price and Actions */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Price</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {selectedHotspot.price}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                            onClick={() => window.open(selectedHotspot.product_link, '_blank')}
                          >
                            <ArrowRight className="w-4 h-4 mr-1" />
                            Learn More
                          </Button>
                          <Button 
                            size="sm"
                            className="flex-1"
                            onClick={() => window.open('/contact', '_blank')}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Get Quote
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopTheLook;
