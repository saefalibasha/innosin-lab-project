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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-sm">IL</span>
            </div>
            <span className="font-bold text-xl text-black">Innosin Lab</span>
          </Link>

          {/* Desktop Navigation with Dropdowns */}
          <div className="hidden md:flex items-center space-x-6">
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    {item.dropdown ? (
                      <>
                        <NavigationMenuTrigger className={`font-medium transition-colors ${
                          isActive(item.path)
                            ? 'text-black border-b-2 border-black'
                            : 'text-gray-600 hover:text-black'
                        }`}>
                          {item.name}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                            {item.dropdown.map((dropdownItem) => (
                              <Link
                                key={dropdownItem.name}
                                to={dropdownItem.path}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 hover:text-black"
                              >
                                <div className="text-sm font-medium leading-none">{dropdownItem.name}</div>
                              </Link>
                            ))}
                          </div>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <Link
                        to={item.path}
                        className={`font-medium transition-colors px-3 py-2 ${
                          isActive(item.path)
                            ? 'text-black border-b-2 border-black pb-1'
                            : 'text-gray-600 hover:text-black'
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
            <div className="relative hidden lg:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              {searchSuggestions.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
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

            <Link to="/rfq-cart">
              <Button variant="outline" size="sm" className="relative">
                <ShoppingCart className="w-4 h-4 mr-2" />
                RFQ Cart
                {itemCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile menu trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="sm">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      className="pl-10"
                    />
                  </div>
                  
                  {navItems.map((item) => (
                    <div key={item.name}>
                      <Link
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`font-medium py-2 px-4 rounded transition-colors block ${
                          isActive(item.path)
                            ? 'bg-black text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {item.name}
                      </Link>
                      {item.dropdown && (
                        <div className="ml-4 mt-2 space-y-1">
                          {item.dropdown.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              to={dropdownItem.path}
                              onClick={() => setIsOpen(false)}
                              className="block py-1 px-2 text-sm text-gray-500 hover:text-black"
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
