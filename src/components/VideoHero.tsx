
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const VideoHero = () => {
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
          {/* Fallback image if video doesn't load */}
        </video>
        
        {/* Fallback background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=1920&h=1080&fit=crop)'
          }}
        />
        
        {/* Ocean gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-sea/70 via-sea-dark/50 to-sea/60" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-6xl md:text-8xl font-serif font-light mb-4 leading-tight tracking-wide animate-fade-in">
            Precision.
            <span className="block font-bold animate-float">Innovation.</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-blue-100 font-light animate-fade-in-right animate-delay-300">
            Empowering scientific breakthroughs with high-quality lab solutions.
            Transform your research environment with cutting-edge equipment and design.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 animate-scale-in animate-delay-500">
            <Button asChild variant="hero" size="lg">
              <Link to="/products">
                Explore Solutions <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
              <Link to="/contact">
                Schedule Consultation
              </Link>
            </Button>
          </div>

          {/* Video Play Button (optional) */}
          <div className="flex justify-center animate-bounce-in animate-delay-700">
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/20 rounded-full glass-card animate-pulse-slow"
            >
              <Play className="w-6 h-6 mr-2" />
              Watch Our Story
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <div className="flex flex-col items-center">
          <span className="text-sm mb-2 font-light">Scroll Down</span>
          <div className="w-0.5 h-8 bg-white/75 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default VideoHero;
