
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRFQ } from '@/contexts/RFQContext';

const HeroNavigation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount } = useRFQ();

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Bigger and without text */}
          <Link to="/" className="flex items-center group animate-fade-in">
            <div className="w-16 h-16 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <img 
                src="/branding/hero-logo.png" 
                alt="Innosin Lab" 
                className="w-14 h-14 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
          </Link>

          {/* Right side: Search Bar and RFQ Cart */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80 border-gray-300 focus:border-sea transition-all duration-300"
              />
            </div>

            {/* RFQ Cart Icon */}
            <Link to="/rfq-cart">
              <Button variant="outline" size="sm" className="relative border-gray-300 hover:border-sea transition-all duration-300">
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse-slow bg-sea hover:bg-sea-dark">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroNavigation;
