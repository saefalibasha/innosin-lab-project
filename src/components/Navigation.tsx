import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Menu, ShoppingCart, Search } from 'lucide-react';
import { useRFQ } from '@/contexts/RFQContext';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
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
    <nav className="glass-card border-b border-sea/10 fixed top-0 w-full z-50 shadow-lg backdrop-blur-16 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group animate-fade-in">
            <div className="w-8 h-8 bg-gradient-to-br from-sea to-sea-dark rounded-sm flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
              <span className="text-white font-bold text-sm">IL</span>
            </div>
            <span className="font-serif font-bold text-xl text-primary group-hover:text-sea transition-colors duration-300">Innosin Lab</span>
          </Link>

          {/* Desktop Navigation with Dropdowns */}
          <div className="hidden md:flex items-center space-x-6">
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item, index) => (
                  <NavigationMenuItem key={item.name} className="animate-fade-in" style={{animationDelay: `${100 + index * 100}ms`}}>
                    {item.dropdown ? (
                      <>
                        <NavigationMenuTrigger className={`font-medium transition-all duration-300 hover:text-sea ${
                          isActive(item.path)
                            ? 'text-sea border-b-2 border-sea'
                            : 'text-muted-foreground hover:text-sea'
                        }`}>
                          {item.name}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="grid w-[400px] gap-2 p-6 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white/95 backdrop-blur-lg border border-sea/20 shadow-xl rounded-lg">
                            {item.dropdown.map((dropdownItem, dropIndex) => (
                              <Link
                                key={dropdownItem.name}
                                to={dropdownItem.path}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-sea/10 hover:text-sea text-sea-dark animate-fade-in group"
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
                        className={`font-medium transition-all duration-300 px-3 py-2 rounded-md hover:bg-sea/10 ${
                          isActive(item.path)
                            ? 'text-sea bg-sea/10 border-b-2 border-sea'
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

          {/* Search Bar & RFQ Cart */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative hidden lg:block animate-fade-in-right animate-delay-300">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-64 glass-card border-sea/20 focus:border-sea transition-all duration-300"
                />
              </div>
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

            <Link to="/rfq-cart" className="animate-fade-in animate-delay-500">
              <Button variant="outline" size="sm" className="relative glass-card border-sea/20 hover:bg-sea/10 hover:border-sea transition-all duration-300 hover:scale-105">
                <ShoppingCart className="w-4 h-4 mr-2" />
                RFQ Cart
                {itemCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse-slow bg-sea hover:bg-sea-dark">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile menu trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="sm" className="glass-card border-sea/20 hover:bg-sea/10 transition-all duration-300">
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
    </nav>
  );
};

export default Navigation;
