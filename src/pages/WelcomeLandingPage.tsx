import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";

export default function WelcomeLandingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 200);
  }, []);

  return (
    <div className="relative h-screen w-full bg-white overflow-hidden flex flex-col">
      
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 z-10">
        <div className="flex items-center space-x-3">
          <img 
            src="/brand-logos/innosin-lab-logo.png" 
            alt="Innosin Lab" 
            className="h-8 w-auto"
          />
          <span className="text-lg font-medium text-gray-900">Innosin Lab</span>
        </div>
        <Button 
          variant="ghost" 
          className="text-gray-600 hover:text-gray-900 hover:bg-transparent text-sm"
          onClick={() => navigate("/home")}
        >
          Skip
        </Button>
      </nav>

      {/* Hero Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-8">
        <div className={`text-center max-w-4xl transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          
          {/* Main Headline */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-light text-gray-900 mb-8 leading-tight tracking-tight">
            Innovation.
            <br />
            <span className="font-semibold text-sea">Redefined.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-12 font-light leading-relaxed max-w-2xl mx-auto">
            Pioneering laboratory solutions designed for tomorrow's breakthroughs.
          </p>

          {/* CTA Button */}
          <Button
            size="lg"
            className="px-8 py-4 text-lg font-medium rounded-full bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={() => navigate("/home")}
          >
            Explore Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="pb-8 flex justify-center">
        <ChevronDown className="h-6 w-6 text-gray-400 animate-bounce" />
      </div>
    </div>
  );
}