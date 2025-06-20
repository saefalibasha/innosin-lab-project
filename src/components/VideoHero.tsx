import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const VideoHero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* HERO BACKGROUND VIDEO - Replace with: public/hero-section/lab-background-video.mp4 */}
      {/* Current: Placeholder background, should show modern laboratory environment */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-sea/70">
        {/* Video element would go here - currently using gradient background */}
        {/* <video className="w-full h-full object-cover" autoPlay muted loop>
          <source src="/hero-section/lab-background-video.mp4" type="video/mp4" />
        </video> */}
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight animate-fade-in">
          Transform Your <span className="text-sea-light">Laboratory</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 font-light leading-relaxed max-w-3xl mx-auto animate-fade-in animate-delay-200">
          Cutting-edge equipment and innovative solutions for modern research environments
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center animate-scale-in animate-delay-500">
          <Button asChild size="lg" className="bg-sea hover:bg-sea-dark text-white transition-all duration-300 hover:scale-105">
            <Link to="/products">
              Explore Products <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-primary transition-all duration-300 hover:scale-105">
            <Link to="/floor-planner">
              <Play className="mr-2 w-5 h-5" />
              Plan Your Lab
            </Link>
          </Button>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoHero;
