import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";

export default function WelcomeLandingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const scrollToContent = () => {
    document.getElementById('content-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-white overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white pointer-events-none" />
      
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-8">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="text-xl font-medium text-gray-900">
            Innosin Lab
          </div>
          <Button 
            variant="ghost" 
            className="text-gray-600 hover:text-gray-900 hover:bg-transparent"
            onClick={() => navigate("/home")}
          >
            Skip
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6">
        <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          
          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 mb-6 leading-tight tracking-tight">
            Innovation.
            <br />
            <span className="font-medium">Redefined.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-12 font-light leading-relaxed max-w-2xl mx-auto">
            Pioneering laboratory solutions designed for tomorrow's breakthroughs.
          </p>

          {/* Primary CTA */}
          <div className="mb-16">
            <Button
              size="lg"
              className="px-8 py-4 text-lg font-medium rounded-full bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => navigate("/home")}
            >
              Explore Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Scroll indicator */}
          <button 
            onClick={scrollToContent}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
            aria-label="Scroll to learn more"
          >
            <ChevronDown className="h-6 w-6 mx-auto animate-bounce" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div id="content-section" className="relative z-10 py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          
          {/* Section 1 */}
          <div className="mb-32">
            <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-8 leading-tight">
              Precision by design.
            </h2>
            <p className="text-xl text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
              Every piece of equipment is meticulously crafted to meet the exacting standards of modern scientific research.
            </p>
          </div>

          {/* Section 2 */}
          <div className="mb-32">
            <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-8 leading-tight">
              Built for discovery.
            </h2>
            <p className="text-xl text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
              From concept to completion, our laboratory solutions empower researchers to push the boundaries of what's possible.
            </p>
          </div>

          {/* Section 3 */}
          <div className="mb-32">
            <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-8 leading-tight">
              The future of labs.
            </h2>
            <p className="text-xl text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
              Advanced materials, intelligent design, and uncompromising quality create environments where innovation thrives.
            </p>
          </div>

          {/* Final CTA */}
          <div className="py-16">
            <h3 className="text-3xl sm:text-4xl font-light text-gray-900 mb-8">
              Ready to transform your lab?
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="px-8 py-4 text-lg font-medium rounded-full bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300"
                onClick={() => navigate("/home")}
              >
                Get Started
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="px-8 py-4 text-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-transparent transition-all duration-300"
                onClick={() => navigate("/products")}
              >
                View Products
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500 mb-4">
            © 2024 Innosin Lab. All rights reserved.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <button 
              onClick={() => navigate("/about")}
              className="hover:text-gray-900 transition-colors"
            >
              About
            </button>
            <button 
              onClick={() => navigate("/contact")}
              className="hover:text-gray-900 transition-colors"
            >
              Contact
            </button>
            <button 
              onClick={() => navigate("/products")}
              className="hover:text-gray-900 transition-colors"
            >
              Products
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}