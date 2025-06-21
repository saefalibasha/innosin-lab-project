
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WavyBackground } from '@/components/ui/wavy-background';

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
      <section className="relative overflow-hidden">
        {/* Simplified Wavy Background */}
        <WavyBackground
          colors={["hsl(200, 85%, 32%)", "hsl(200, 85%, 28%)", "hsl(200, 85%, 25%)", "hsl(200, 85%, 22%)"]}
          waveWidth={60}
          backgroundFill="hsl(200, 85%, 30%)"
          blur={2}
          speed="slow"
          waveOpacity={0.8}
          pushWavesUp={true}
          containerClassName="min-h-[50vh]"
          className="flex items-center justify-center w-full h-full"
        >
          {/* REPLACEABLE ASSET: Company Logo in Hero Section */}
          {/* Location: /public/branding/hero-logo.png */}
          {/* Purpose: Company branding in hero section that aligns with navigation */}
          {/* Dimensions: 40x40px recommended (w-10 h-10) to match navigation logo */}
          {/* Instructions: Upload your logo to /public/branding/hero-logo.png and update the src below */}
          <div className="absolute top-7 left-12 z-20 animate-fade-in">
            <div className="w-30 h-30 bg-white rounded-lg p-1 shadow-lg">
              <img 
                src="/branding/hero-logo.png" 
                alt="Company Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.log('Logo failed to load, using fallback');
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
                onLoad={() => console.log('Logo loaded successfully')}
              />
            </div>
          </div>

          {/* Content Overlay - Increased top padding to move content lower */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white pt-28 pb-16">
            {/* Large, bold main title */}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-1 leading-[0.9] tracking-tight animate-fade-in animate-delay-200">
              <span className="block">Precision.</span>
              <span className="block text-sand-light animate-float">Innovation.</span>
              <span className="block text-white/90">Excellence.</span>
            </h2>
            
            {/* Subtext/description */}
            <p className="text-base md:text-lg lg:text-xl mb-2 max-w-4xl mx-auto text-white/90 font-light leading-relaxed animate-fade-in-right animate-delay-400">
              Empowering scientific breakthroughs with high-quality lab solutions.
              <span className="block mt-1">Transform your research environment with cutting-edge equipment and design.</span>
            </p>
            
            {/* Two CTA buttons side by side */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 animate-scale-in animate-delay-500">
              <Button asChild variant="heroSolid" size="lg" className="min-w-[200px] h-12 text-base">
                <Link to="/products">
                  Explore Solutions <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              
              <Button asChild variant="hero" size="lg" className="min-w-[200px] h-12 text-base">
                <Link to="/contact">
                  Schedule Consultation
                </Link>
              </Button>
            </div>
          </div>
        </WavyBackground>
      </section>

      {/* Our Story Section */}
      <section className="py-3 bg-gradient-to-b from-background to-secondary/30 relative">
        <div className="container-custom text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-2 tracking-tight animate-fade-in">
              Our <span className="text-sea">Story</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed animate-fade-in animate-delay-200">
              For over a decade, Innosin Lab has been at the forefront of laboratory innovation, 
              transforming research environments across Singapore and beyond. Our journey began with 
              a simple mission: to provide world-class laboratory solutions that empower scientific discovery.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div className="animate-fade-in animate-delay-300">
                <div className="text-xl font-bold text-sea mb-1">500+</div>
                <p className="text-muted-foreground text-sm">Projects Completed</p>
              </div>
              <div className="animate-fade-in animate-delay-500">
                <div className="text-xl font-bold text-sea mb-1">15+</div>
                <p className="text-muted-foreground text-sm">Years of Excellence</p>
              </div>
              <div className="animate-fade-in animate-delay-700">
                <div className="text-xl font-bold text-sea mb-1">50+</div>
                <p className="text-muted-foreground text-sm">Research Institutions</p>
              </div>
            </div>
            
            {/* REPLACEABLE ASSET: Company Story Video */}
            {/* Location: /public/hero-section/company-story-video.mp4 */}
            {/* Purpose: Background or featured video for company story */}
            {/* Dimensions: 1920x1080px recommended, MP4 format */}
            <div className="animate-scale-in animate-delay-500">
              <Button asChild variant="outline" size="default" className="glass-card border-sea/20 hover:bg-sea/10 hover:border-sea transition-all duration-300 hover:scale-105">
                <Link to="/about">
                  <Play className="w-4 h-4 mr-2" />
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
