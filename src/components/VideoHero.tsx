
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { heroContent } from '@/data/heroContent';
import { usePerformanceMonitoring, logComponentPerformance } from '@/hooks/usePerformanceMonitoring';
import { OptimizedImage } from './OptimizedImage';

// Simplified lazy loading without fallback components that cause type issues
const LazyCarousel = lazy(() => import('@/components/ui/carousel').then(module => ({ default: module.Carousel })));
const LazyCarouselContent = lazy(() => import('@/components/ui/carousel').then(module => ({ default: module.CarouselContent })));
const LazyCarouselItem = lazy(() => import('@/components/ui/carousel').then(module => ({ default: module.CarouselItem })));
const LazyCarouselNext = lazy(() => import('@/components/ui/carousel').then(module => ({ default: module.CarouselNext })));
const LazyCarouselPrevious = lazy(() => import('@/components/ui/carousel').then(module => ({ default: module.CarouselPrevious })));

const VideoHero = () => {
  const { startMonitoring } = usePerformanceMonitoring();
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isCarouselVisible, setIsCarouselVisible] = useState(false);
  
  const startTime = performance.now();

  useEffect(() => {
    startMonitoring();
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 100);
      setScrollY(scrollPosition);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [startMonitoring]);

  // Load carousel after initial render with performance logging
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCarouselVisible(true);
      const endTime = performance.now();
      logComponentPerformance('VideoHero', endTime - startTime);
    }, 100);
    return () => clearTimeout(timer);
  }, [startTime]);

  const CarouselFallback = () => (
    <div className="w-full h-[65vh] min-h-[500px] rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading hero content...</p>
      </div>
    </div>
  );

  return (
    <>
      {/* White region at top for header */}
      <div className="h-8 bg-white"></div>
      
      <section className="relative overflow-hidden">
        {/* Hero Carousel with Enhanced Design */}
        <div className="px-4 sm:px-6 lg:px-8 pt-6">
          <div className="max-w-7xl mx-auto">
            {isCarouselVisible ? (
              <Suspense fallback={<CarouselFallback />}>
                <LazyCarousel 
                  className="w-full h-[65vh] min-h-[500px] rounded-2xl overflow-hidden shadow-2xl"
                  opts={{
                    align: "center",
                    loop: true,
                  }}
                >
                  <LazyCarouselContent className="-ml-2 md:-ml-4">
                    {heroContent.slides.map((slide) => (
                      <LazyCarouselItem key={slide.id} className="pl-2 md:pl-4 basis-full md:basis-[85%] lg:basis-[90%]">
                        <div className="relative w-full h-[65vh] min-h-[500px] rounded-2xl overflow-hidden">
                          {/* Optimized Background Image */}
                          <OptimizedImage
                            src={slide.image}
                            alt={`Hero slide ${slide.id}`}
                            className="absolute inset-0"
                            priority={slide.id === 1}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 85vw, 90vw"
                          />
                          
                          {/* Dark Overlay for better text readability */}
                          <div className="absolute inset-0 bg-black/40" />

                          {/* Content Overlay - Slide-specific content */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                              {/* Large, bold main title - Slide specific */}
                              <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-1 leading-[0.9] tracking-tight animate-fade-in animate-delay-200">
                                <span className="block text-sand-light animate-float">{slide.titles.title1}</span>
                              </h2>
                              
                              {/* Subtext/description - Slide specific */}
                              <p className="text-base md:text-lg lg:text-xl mb-2 max-w-4xl mx-auto text-white/90 font-light leading-relaxed animate-fade-in-right animate-delay-400">
                                {slide.description.line1}
                                <span className="block mt-1">{slide.description.line2}</span>
                              </p>
                              
                              {/* Two CTA buttons side by side - Slide specific */}
                              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 animate-scale-in animate-delay-500">
                                <Button asChild variant="heroSolid" size="lg" className="min-w-[200px] h-12 text-base">
                                  <Link to={slide.buttons.primary.link}>
                                    {slide.buttons.primary.text} <ArrowRight className="ml-2 w-5 h-5" />
                                  </Link>
                                </Button>
                                
                                <Button asChild variant="hero" size="lg" className="min-w-[200px] h-12 text-base">
                                  <Link to={slide.buttons.secondary.link}>
                                    {slide.buttons.secondary.text}
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </LazyCarouselItem>
                    ))}
                  </LazyCarouselContent>
                  
                  {/* Carousel Navigation */}
                  <LazyCarouselPrevious className="left-4 bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-300" />
                  <LazyCarouselNext className="right-4 bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-300" />
                </LazyCarousel>
              </Suspense>
            ) : (
              <CarouselFallback />
            )}
          </div>
        </div>
      </section>

      {/* Our Story Section - Increased padding */}
      <section className="py-6 bg-gradient-to-b from-background to-secondary/30 relative">
        <div className="container-custom text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-2 tracking-tight animate-fade-in">
              {heroContent.ourStory.title} <span className="text-sea">{heroContent.ourStory.titleHighlight}</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed animate-fade-in animate-delay-200">
              {heroContent.ourStory.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div className="animate-fade-in animate-delay-300">
                <div className="text-xl font-bold text-sea mb-1">{heroContent.ourStory.stats.projectsCompleted.number}</div>
                <p className="text-muted-foreground text-sm">{heroContent.ourStory.stats.projectsCompleted.label}</p>
              </div>
              <div className="animate-fade-in animate-delay-500">
                <div className="text-xl font-bold text-sea mb-1">{heroContent.ourStory.stats.yearsOfExcellence.number}</div>
                <p className="text-muted-foreground text-sm">{heroContent.ourStory.stats.yearsOfExcellence.label}</p>
              </div>
              <div className="animate-fade-in animate-delay-700">
                <div className="text-xl font-bold text-sea mb-1">{heroContent.ourStory.stats.researchInstitutions.number}</div>
                <p className="text-muted-foreground text-sm">{heroContent.ourStory.stats.researchInstitutions.label}</p>
              </div>
            </div>
            
            <div className="animate-scale-in animate-delay-500">
              <Button asChild variant="outline" size="default" className="glass-card border-sea/20 hover:bg-sea/10 hover:border-sea transition-all duration-300 hover:scale-105">
                <Link to="/about">
                  <Play className="w-4 h-4 mr-2" />
                  {heroContent.ourStory.videoButton}
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
