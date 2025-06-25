
import React from "react";
import { Link } from "react-router-dom";
import AuthButton from "./AuthButton";
import { TubelightNavBarDemo } from "./ui/demo";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRFQ } from "@/contexts/RFQContext";
import { Badge } from "@/components/ui/badge";

const HeaderBrand = () => {
  const { itemCount } = useRFQ();

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/branding/hero-logo.png?v=2" 
              alt="Innosin Lab" 
              className="h-8 w-auto"
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                backgroundColor: 'transparent',
                mixBlendMode: 'multiply'
              }}
            />
          </Link>
          
          <div className="hidden md:block">
            <TubelightNavBarDemo />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/rfq-cart">
            <Button variant="outline" size="sm" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-sea hover:bg-sea-dark border-0"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>
          <AuthButton />
        </div>
      </div>
    </div>
  );
};

export default HeaderBrand;
