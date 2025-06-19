
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
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

  return (
    <>
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

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            {/* Small heading/category label - moved down slightly */}
            <div className="inline-block px-6 py-3 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 mb-12 mt-8 animate-fade-in">
              <span className="text-sm font-medium text-white/95 tracking-widest uppercase">Laboratory Excellence</span>
            </div>
            
            {/* Large, bold main title */}
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
          </div>
        </div>

        {/* Enhanced Wave Animation with better shape and movement */}
        <div className="absolute bottom-6 left-0 w-full overflow-hidden z-15">
          {/* Main wave with thicker sides, thinner middle */}
          <svg 
            className="relative block w-full h-20 animate-enhanced-wave-motion" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0,60 C150,20 300,40 400,50 C500,60 600,65 700,60 C800,55 900,45 1050,20 C1100,10 1150,30 1200,50 L1200,120 L0,120 Z" 
              fill="#ffffff"
              fillOpacity="0.9"
            />
          </svg>
          
          {/* Translucent trailing wave */}
          <svg 
            className="absolute top-0 block w-full h-20 animate-enhanced-wave-motion-delayed" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0,70 C150,30 300,50 400,60 C500,70 600,75 700,70 C800,65 900,55 1050,30 C1100,20 1150,40 1200,60 L1200,120 L0,120 Z" 
              fill="#ffffff"
              fillOpacity="0.3"
            />
          </svg>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="section bg-gradient-to-b from-background to-secondary/30 relative">
        <div className="container-custom text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-8 tracking-tight animate-fade-in">
              Our <span className="text-sea">Story</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-12 leading-relaxed animate-fade-in animate-delay-200">
              For over a decade, Innosin Lab has been at the forefront of laboratory innovation, 
              transforming research environments across Singapore and beyond. Our journey began with 
              a simple mission: to provide world-class laboratory solutions that empower scientific discovery.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="animate-fade-in animate-delay-300">
                <div className="text-3xl font-bold text-sea mb-2">500+</div>
                <p className="text-muted-foreground">Projects Completed</p>
              </div>
              <div className="animate-fade-in animate-delay-500">
                <div className="text-3xl font-bold text-sea mb-2">15+</div>
                <p className="text-muted-foreground">Years of Excellence</p>
              </div>
              <div className="animate-fade-in animate-delay-700">
                <div className="text-3xl font-bold text-sea mb-2">50+</div>
                <p className="text-muted-foreground">Research Institutions</p>
              </div>
            </div>
            <div className="animate-scale-in animate-delay-500">
              <Button asChild variant="outline" size="lg" className="glass-card border-sea/20 hover:bg-sea/10 hover:border-sea transition-all duration-300 hover:scale-105">
                <Link to="/about">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Our Story
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default VideoHero;
