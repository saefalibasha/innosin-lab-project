
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const HeroNavigation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

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

          {/* Desktop Search Bar - Optimized layout */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-80 border-gray-300 focus:border-sea transition-all duration-300"
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
