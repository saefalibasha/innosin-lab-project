
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
        {/* Compact Wavy Background */}
        <WavyBackground
          colors={["#0891b2", "#0e7490", "#155e75", "#164e63", "#083344"]}
          waveWidth={40}
          backgroundFill="#0c4a6e"
          blur={8}
          speed="slow"
          waveOpacity={0.7}
          containerClassName="min-h-[70vh]"
          className="flex items-center justify-center w-full h-full"
        >
          {/* Company Name in Top Left */}
          <div className="absolute top-8 left-8 z-20 animate-fade-in">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white/95 tracking-wider">
              INNOSIN LAB
            </h1>
          </div>

          {/* Content Overlay */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            {/* Large, bold main title */}
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-4 leading-[0.9] tracking-tight animate-fade-in animate-delay-200">
              <span className="block">Precision.</span>
              <span className="block text-sand-light animate-float">Innovation.</span>
              <span className="block text-white/90">Excellence.</span>
            </h2>
            
            {/* Subtext/description */}
            <p className="text-xl md:text-2xl lg:text-3xl mb-8 max-w-4xl mx-auto text-white/90 font-light leading-relaxed animate-fade-in-right animate-delay-400">
              Empowering scientific breakthroughs with high-quality lab solutions.
              <span className="block mt-2">Transform your research environment with cutting-edge equipment and design.</span>
            </p>
            
            {/* Two CTA buttons side by side */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-center mb-8 animate-scale-in animate-delay-500">
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
        </WavyBackground>
      </section>

      {/* Our Story Section */}
      <section className="py-12 bg-gradient-to-b from-background to-secondary/30 relative">
        <div className="container-custom text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6 tracking-tight animate-fade-in">
              Our <span className="text-sea">Story</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed animate-fade-in animate-delay-200">
              For over a decade, Innosin Lab has been at the forefront of laboratory innovation, 
              transforming research environments across Singapore and beyond. Our journey began with 
              a simple mission: to provide world-class laboratory solutions that empower scientific discovery.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
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
