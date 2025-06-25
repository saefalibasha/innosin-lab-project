
import React from "react";
import { Link } from "react-router-dom";
import AuthButton from "./AuthButton";
import { TubelightNavBarDemo } from "./ui/demo";

const HeaderBrand = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/branding/hero-logo.png" 
              alt="Innosin Lab" 
              className="h-8 w-auto"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            />
          </Link>
          
          <div className="hidden md:block">
            <TubelightNavBarDemo />
          </div>
        </div>
        
        <div className="flex items-center">
          <AuthButton />
        </div>
      </div>
    </div>
  );
};

export default HeaderBrand;
