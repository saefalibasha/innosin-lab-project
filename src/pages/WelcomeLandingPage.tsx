import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import OptimizedVideo from "@/components/OptimizedVideo";

// Animated background component
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-sea/10 to-sea-light/10 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-sea-light/10 to-sea/10 rounded-full blur-3xl animate-float-slower"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-sea/5 to-sea-dark/5 rounded-full blur-3xl animate-pulse-slow"></div>
      
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--sea)) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>
    </div>
  );
}

export default function WelcomeLandingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 200);
  }, []);

  return (
    <div className="relative h-screen w-full bg-white overflow-hidden flex flex-col">
      
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Navigation */}
      <nav className="relative z-10 flex justify-end items-center px-8 py-6">
        <Button 
          variant="ghost" 
          className="text-sea/70 hover:text-sea hover:bg-sea/5 text-sm transition-all duration-300"
          onClick={() => navigate("/home")}
        >
          Skip
        </Button>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-8">
        <div className={`text-center max-w-4xl transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          
          {/* Intro Video */}
          <div className="mb-16 w-full max-w-6xl mx-auto">
            <OptimizedVideo
              src="/videos/intro-video.mp4"
              className="w-full h-auto rounded-3xl shadow-2xl border border-sea/10"
              autoplay={true}
              muted={true}
              loop={true}
              controls={false}
            />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight tracking-tight">
            <span className="font-semibold text-sea">Innovation.</span>
            <br />
            <span className="font-semibold text-sea-dark">Redefined.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-sea/70 mb-8 font-light leading-relaxed max-w-2xl mx-auto">
            Pioneering laboratory solutions designed for tomorrow's breakthroughs.
          </p>

          {/* CTA Button */}
          <Button
            size="lg"
            className="px-8 py-4 text-lg font-medium rounded-full bg-sea hover:bg-sea-dark text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={() => navigate("/home")}
          >
            Explore Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="relative z-10 pb-8 flex justify-center">
        <ChevronDown className="h-6 w-6 text-sea/40 animate-bounce" />
      </div>
    </div>
  );
}