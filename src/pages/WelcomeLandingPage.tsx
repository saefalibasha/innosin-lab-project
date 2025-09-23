import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import OptimizedVideo from "@/components/OptimizedVideo";
import { useIsMobile } from "@/hooks/use-mobile";

// Animated background component with mobile optimization
function AnimatedBackground({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Floating orbs - reduced on mobile */}
      <div className={`absolute top-1/4 left-1/4 bg-gradient-to-r from-sea/10 to-sea-light/10 rounded-full blur-3xl ${
        isMobile ? 'w-32 h-32 animate-float-slow' : 'w-64 h-64 animate-float-slow'
      }`}></div>
      <div className={`absolute top-3/4 right-1/4 bg-gradient-to-r from-sea-light/10 to-sea/10 rounded-full blur-3xl ${
        isMobile ? 'w-48 h-48 animate-float-slower' : 'w-96 h-96 animate-float-slower'
      }`}></div>
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-sea/5 to-sea-dark/5 rounded-full blur-3xl ${
        isMobile ? 'w-40 h-40 animate-pulse-slow' : 'w-80 h-80 animate-pulse-slow'
      }`}></div>
      
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--sea)) 1px, transparent 0)`,
        backgroundSize: isMobile ? '20px 20px' : '40px 40px'
      }}></div>
    </div>
  );
}

export default function WelcomeLandingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 200);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-white overflow-hidden flex flex-col">
      
      {/* Animated Background */}
      <AnimatedBackground isMobile={isMobile} />
      
      {/* Navigation */}
      <nav className="relative z-10 flex justify-end items-center px-4 sm:px-8 py-3 sm:py-2">
        <Button 
          variant="ghost" 
          className="text-sea/70 hover:text-sea hover:bg-sea/5 text-sm transition-all duration-300"
          onClick={() => navigate("/home")}
        >
          Skip
        </Button>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center sm:justify-start items-center px-4 sm:px-8 pt-4 sm:pt-2">
        <div className={`text-center w-full max-w-6xl transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          
          {/* Intro Video */}
          <div className={`mb-6 sm:mb-4 w-full mx-auto animate-fade-in ${
            isMobile ? 'max-w-sm' : 'max-w-4xl'
          }`}>
            <OptimizedVideo
              src="/videos/landing-intro-v4.mp4"
              className={`w-full h-auto transition-all duration-500 ${
                isMobile 
                  ? 'transform scale-100 filter brightness-100 contrast-105 saturate-100' 
                  : 'transform scale-105 filter brightness-105 contrast-110 saturate-105'
              }`}
              autoplay={true}
              muted={true}
              loop={false}
              controls={false}
              interactive={isMobile}
              startTime={0}
              blendWithBackground={true}
              mobileSizeReduction={true}
            />
          </div>

          {/* Main Tagline */}
          <p className={`text-sea/90 font-light leading-relaxed mx-auto px-2 sm:px-0 whitespace-nowrap ${
            isMobile 
              ? 'text-lg sm:text-xl max-w-sm mb-12' 
              : 'text-2xl sm:text-3xl lg:text-4xl max-w-none mb-16'
          }`}>
            Pioneering laboratory solutions designed for tomorrow's breakthroughs.
          </p>

          {/* CTA Button */}
          <Button
            size={isMobile ? "default" : "lg"}
            className={`font-medium rounded-full bg-sea hover:bg-sea-dark text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              isMobile 
                ? 'px-6 py-3 text-base w-full max-w-xs' 
                : 'px-8 py-4 text-lg'
            }`}
            onClick={() => navigate("/home")}
          >
            Explore Now
            <ArrowRight className={`${isMobile ? 'ml-1 h-4 w-4' : 'ml-2 h-5 w-5'}`} />
          </Button>
        </div>
      </div>

      {/* Scroll indicator - hidden on mobile */}
      {!isMobile && (
        <div className="relative z-10 pb-8 flex justify-center">
          <ChevronDown className="h-6 w-6 text-sea/40 animate-bounce" />
        </div>
      )}
    </div>
  );
}