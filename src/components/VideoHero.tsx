
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const VideoHero = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          {/* Placeholder for video source */}
          <source src="/placeholder-lab-video.mp4" type="video/mp4" />
        </video>
        
        {/* Fallback background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=1920&h=1080&fit=crop)'
          }}
        />
        
        {/* Enhanced gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-sea-dark/40 to-black/50" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          {/* Small heading/category label */}
          <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-6 animate-fade-in">
            <span className="text-sm font-medium text-white/90 tracking-wider uppercase">Laboratory Excellence</span>
          </div>
          
          {/* Large, bold main title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 leading-tight tracking-tight animate-fade-in animate-delay-200">
            Precision.
            <span className="block font-bold text-sand-light animate-float">Innovation.</span>
          </h1>
          
          {/* Subtext/description */}
          <p className="text-lg md:text-xl lg:text-2xl mb-12 max-w-3xl mx-auto text-white/90 font-light leading-relaxed animate-fade-in-right animate-delay-300">
            Empowering scientific breakthroughs with high-quality lab solutions.
            Transform your research environment with cutting-edge equipment and design.
          </p>
          
          {/* Two CTA buttons side by side */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-16 animate-scale-in animate-delay-500">
            <Button asChild variant="heroSolid" size="lg" className="min-w-[200px]">
              <Link to="/products">
                Explore Solutions <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            
            <Button asChild variant="hero" size="lg" className="min-w-[200px]">
              <Link to="/contact">
                Schedule Consultation
              </Link>
            </Button>
          </div>

          {/* Video Play Button (optional) */}
          <div className="flex justify-center mb-8 animate-bounce-in animate-delay-700">
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/20 rounded-full backdrop-blur-md border border-white/20 animate-pulse-slow"
            >
              <Play className="w-6 h-6 mr-2" />
              Watch Our Story
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator - hidden when scrolled */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white transition-all duration-500 ${scrolled ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0 animate-bounce'}`}>
        <div 
          className="flex flex-col items-center cursor-pointer group"
          onClick={scrollToNext}
        >
          <span className="text-sm mb-3 font-light tracking-wide opacity-90 group-hover:opacity-100 transition-opacity">
            Scroll Down
          </span>
          <div className="flex flex-col items-center">
            <ArrowDown className="w-5 h-5 mb-1 animate-float" />
            <div className="w-0.5 h-8 bg-white/60 rounded-full group-hover:bg-white/80 transition-colors"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoHero;
