import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home, LayoutDashboard, ShoppingBag, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const companyLinks = [
    { name: 'Broen-Lab', href: '/products?company=Broen-Lab' },
    { name: 'Hamilton Laboratory Solutions', href: '/products?company=Hamilton Laboratory Solutions' },
    { name: 'Oriental Giken Inc.', href: '/products?company=Oriental Giken Inc.' },
    { name: 'Innosin Lab', href: '/products?company=Innosin Lab' }
  ];

  return (
    <header className="bg-background border-b border-border h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <Link to="/" className="text-lg font-semibold">
        Lab Inventory
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden sm:flex items-center space-x-6">
        <Link to="/" className="hover:text-primary">
          <Home className="h-4 w-4 mr-2 inline-block align-middle" />
          Home
        </Link>
        <Link to="/products" className="hover:text-primary">
          <ShoppingBag className="h-4 w-4 mr-2 inline-block align-middle" />
          Products
        </Link>
        <Link to="/floor-planner" className="hover:text-primary">
          <LayoutDashboard className="h-4 w-4 mr-2 inline-block align-middle" />
          Floor Planner
        </Link>
        <div className="relative group">
          <Button variant="ghost">
            Companies
          </Button>
          <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex={-1}>
            <div className="py-1" role="none">
              {companyLinks.map(company => (
                <a
                  key={company.name}
                  href={company.href}
                  className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                  role="menuitem"
                  tabIndex={-1}
                >{company.name}</a>
              ))}
            </div>
          </div>
        </div>
        <Link to="/admin" className="hover:text-primary">
          <Settings className="h-4 w-4 mr-2 inline-block align-middle" />
          Admin
        </Link>
      </nav>

      {/* Mobile Navigation */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild className="sm:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:hidden">
          <SheetHeader className="text-left">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="grid gap-4 text-lg">
            <Link to="/" className="flex items-center hover:text-primary">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
            <Link to="/products" className="flex items-center hover:text-primary">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Products
            </Link>
            <Link to="/floor-planner" className="flex items-center hover:text-primary">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Floor Planner
            </Link>
            <div>
              <div className="font-semibold mb-1">Companies</div>
              <div className="grid gap-2">
                {companyLinks.map(company => (
                  <Link
                    key={company.name}
                    to={company.href}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >{company.name}</Link>
                ))}
              </div>
            </div>
            <Link to="/admin" className="flex items-center hover:text-primary">
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Link>
          </nav>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Navigation;
