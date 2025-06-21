
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useRFQ } from '@/contexts/RFQContext';

const HeroNavigation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { itemCount } = useRFQ();

  const navItems = [
    { name: 'Home', path: '/' },
    { 
      name: 'Products', 
      path: '/products',
      dropdown: [
        { name: 'Broen-Lab', path: '/products?category=Broen-Lab' },
        { name: 'Hamilton Laboratory Solutions', path: '/products?category=Hamilton%20Laboratory%20Solutions' },
        { name: 'Oriental Giken Inc.', path: '/products?category=Oriental%20Giken%20Inc.' },
        { name: 'Innosin Lab', path: '/products?category=Innosin%20Lab' },
        { name: 'All Products', path: '/products' },
      ]
    },
    { name: 'Floor Planner', path: '/floor-planner' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

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

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left side */}
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

          {/* Center Navigation Menu - Desktop Only */}
          <div className="hidden lg:flex items-center">
            <NavigationMenu>
              <NavigationMenuList className="space-x-2">
                {navItems.map((item, index) => (
                  <NavigationMenuItem key={item.name} className="animate-fade-in" style={{animationDelay: `${100 + index * 100}ms`}}>
                    {item.dropdown ? (
                      <>
                        <NavigationMenuTrigger className="font-medium text-sm transition-all duration-300 hover:text-sea bg-transparent hover:bg-transparent data-[state=open]:bg-transparent data-[active]:bg-transparent text-muted-foreground hover:text-sea px-3 py-2 whitespace-nowrap">
                          {item.name}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="grid w-[400px] gap-2 p-6 md:w-[500px] md:grid-cols-2 lg:w-[600px] glass-card border border-sea/20 shadow-xl rounded-lg">
                            {item.dropdown.map((dropdownItem, dropIndex) => (
                              <Link
                                key={dropdownItem.name}
                                to={dropdownItem.path}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-sea/10 hover:text-sea text-muted-foreground animate-fade-in group"
                                style={{animationDelay: `${dropIndex * 50}ms`}}
                              >
                                <div className="text-sm font-medium leading-none group-hover:text-sea transition-colors">
                                  {dropdownItem.name}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <Link
                        to={item.path}
                        className={`font-medium text-sm transition-all duration-300 px-3 py-2 rounded-md hover:bg-sea/10 whitespace-nowrap ${
                          isActive(item.path)
                            ? 'text-sea bg-sea/10'
                            : 'text-muted-foreground hover:text-sea'
                        }`}
                      >
                        {item.name}
                      </Link>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side: Search Bar, RFQ Cart, and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Search Bar - Desktop */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-80 border-gray-300 focus:border-sea transition-all duration-300"
              />
              {searchSuggestions.length > 0 && (
                <div className="absolute top-full mt-1 w-full glass-card border border-sea/20 rounded-md shadow-lg z-50 animate-fade-in">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-sea/10 cursor-pointer text-sm transition-colors duration-200 animate-fade-in"
                      style={{animationDelay: `${index * 50}ms`}}
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

            {/* Mobile menu trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" size="sm" className="border-gray-300 hover:border-sea transition-all duration-300">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] glass-card">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Mobile Search */}
                  <div className="relative animate-fade-in">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 glass-card border-sea/20 focus:border-sea"
                    />
                  </div>
                  
                  {navItems.map((item, index) => (
                    <div key={item.name} className="animate-fade-in" style={{animationDelay: `${100 + index * 100}ms`}}>
                      <Link
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`font-medium py-2 px-4 rounded-md transition-all duration-300 block hover:bg-sea/10 ${
                          isActive(item.path)
                            ? 'bg-sea text-white shadow-lg'
                            : 'text-muted-foreground hover:text-sea'
                        }`}
                      >
                        {item.name}
                      </Link>
                      {item.dropdown && (
                        <div className="ml-4 mt-2 space-y-1">
                          {item.dropdown.map((dropdownItem, dropIndex) => (
                            <Link
                              key={dropdownItem.name}
                              to={dropdownItem.path}
                              onClick={() => setIsOpen(false)}
                              className="block py-1 px-2 text-sm text-muted-foreground hover:text-sea transition-colors duration-200 rounded animate-fade-in"
                              style={{animationDelay: `${200 + dropIndex * 50}ms`}}
                            >
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
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
