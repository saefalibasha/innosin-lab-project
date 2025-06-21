
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart, Menu } from 'lucide-react';
import { useRFQ } from '@/contexts/RFQContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const HeroNavigation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount } = useRFQ();

  const searchData = [
    'Broen-Lab', 'Hamilton Laboratory Solutions', 'Oriental Giken Inc.', 'Innosin Lab',
    'Floor Planner', 'About Us', 'Contact', 'Chemical Fume Hood',
    'Biological Safety Cabinet', 'Laboratory Workbench', 'Eye Wash Station',
    'Epoxy Resin Lab Bench', 'Emergency Eye Wash Station', 'Safety Shower', 'Storage Cabinet'
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const suggestions = searchData.filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group animate-fade-in">
            <div className="w-12 h-12 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <img 
                src="/branding/hero-logo.png" 
                alt="Innosin Lab" 
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
            <span className="font-serif font-bold text-xl lg:text-2xl text-primary group-hover:text-sea transition-colors duration-300">Innosin Lab</span>
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-64 border-gray-300 focus:border-sea transition-all duration-300"
                />
              </div>
              {searchSuggestions.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 animate-fade-in">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm transition-colors duration-200"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setSearchSuggestions([]);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Button */}
            <Link to="/rfq-cart">
              <Button variant="outline" size="sm" className="relative border-gray-300 hover:border-sea hover:bg-sea/10 transition-all duration-300">
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-sea hover:bg-sea-dark border-0">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="border-gray-300">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 border-gray-300 focus:border-sea"
                    />
                  </div>
                  
                  {/* Mobile Cart */}
                  <Link to="/rfq-cart" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full relative border-gray-300">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      RFQ Cart
                      {itemCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-sea hover:bg-sea-dark">
                          {itemCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroNavigation;
