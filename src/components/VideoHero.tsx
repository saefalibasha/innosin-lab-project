
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const VideoHero = () => {
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 100);
      setScrollY(scrollPosition);
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
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-sea-dark/50 to-black/60" />
      </div>

      {/* Content Overlay - Updated layout to match reference */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          {/* Small heading/category label */}
          <div className="inline-block px-6 py-3 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 mb-8 animate-fade-in">
            <span className="text-sm font-medium text-white/95 tracking-widest uppercase">Laboratory Excellence</span>
          </div>
          
          {/* Large, bold main title - Improved typography */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold mb-8 leading-[0.9] tracking-tight animate-fade-in animate-delay-200">
            <span className="block">Precision.</span>
            <span className="block text-sand-light animate-float">Innovation.</span>
            <span className="block text-white/90">Excellence.</span>
          </h1>
          
          {/* Subtext/description */}
          <p className="text-xl md:text-2xl lg:text-3xl mb-16 max-w-4xl mx-auto text-white/90 font-light leading-relaxed animate-fade-in-right animate-delay-300">
            Empowering scientific breakthroughs with high-quality lab solutions.
            <span className="block mt-2">Transform your research environment with cutting-edge equipment and design.</span>
          </p>
          
          {/* Two CTA buttons side by side */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-center mb-20 animate-scale-in animate-delay-500">
            <Button asChild variant="heroSolid" size="lg" className="min-w-[240px] h-14 text-lg">
              <Link to="/products">
                Explore Solutions <ArrowRight className="ml-2 w-6 h-6" />
              </Link>
            </Button>
            
            <Button asChild variant="hero" size="lg" className="min-w-[240px] h-14 text-lg">
              <Link to="/contact">
                Schedule Consultation
              </Link>
            </Button>
          </div>

          {/* Updated "Our Story" Button */}
          <div className="flex justify-center mb-12 animate-bounce-in animate-delay-700">
            <Button asChild variant="ghost" size="lg" className="text-white hover:bg-white/20 rounded-full backdrop-blur-md border border-white/20 px-8 py-4">
              <Link to="/about">
                <Play className="w-6 h-6 mr-3" />
                Our Story
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <div 
        className={`fixed bottom-12 left-1/2 transform -translate-x-1/2 text-white transition-all duration-500 z-20 ${
          scrollY > window.innerHeight * 0.8 ? 'opacity-0 translate-y-8 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
        style={{ transform: `translateX(-50%) translateY(${Math.min(scrollY * 0.3, 30)}px)` }}
      >
        <div 
          className="flex flex-col items-center cursor-pointer group animate-bounce"
          onClick={scrollToNext}
        >
          <span className="text-sm mb-4 font-light tracking-wide opacity-90 group-hover:opacity-100 transition-opacity">
            Scroll Down
          </span>
          <div className="flex flex-col items-center">
            <ArrowDown className="w-6 h-6 mb-2 animate-float" />
            <div className="w-0.5 h-10 bg-white/60 rounded-full group-hover:bg-white/80 transition-colors"></div>
          </div>
        </div>
      </div>

      {/* Animated Wave Bottom Edge - Repositioned higher */}
      <div className="absolute bottom-16 left-0 w-full overflow-hidden z-15">
        <svg 
          className="relative block w-full h-24 animate-enhanced-wave-motion" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" 
            fill="#ffffff"
            fillOpacity="0.9"
          />
        </svg>
      </div>
    </section>
  );
};

export default VideoHero;
