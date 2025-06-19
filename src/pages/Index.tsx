
import { ArrowRight, ChevronLeft, ChevronRight, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import { useState } from "react";
import VideoHero from "@/components/VideoHero";
import BeforeAfterComparison from "@/components/BeforeAfterComparison";
import ShopTheLook from "@/components/ShopTheLook";

const Index = () => {
  const collections = [
    {
      title: "Broen-Lab",
      description: "Advanced fume hoods and ventilation systems designed for chemical safety and efficiency",
      icon: "💨",
      category: "Broen-Lab"
    },
    {
      title: "Hamilton Laboratory Solutions", 
      description: "Premium laboratory furniture and benches with chemical-resistant surfaces",
      icon: "🧪",
      category: "Hamilton Laboratory Solutions"
    },
    {
      title: "Oriental Giken Inc.",
      description: "Emergency safety equipment including eye wash stations and safety showers",
      icon: "🛡️",
      category: "Oriental Giken Inc."
    },
    {
      title: "Innosin Lab",
      description: "Comprehensive storage solutions and laboratory equipment for modern research facilities",
      icon: "📦",
      category: "Innosin Lab"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Video Hero Section */}
      <VideoHero />

      {/* Product Collections Section */}
      <section className="section bg-background relative">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-primary mb-6 tracking-tight animate-fade-in">
              Product <span className="text-sea">Collections</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light animate-fade-in animate-delay-200">
              Explore our comprehensive range of laboratory solutions from leading manufacturers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {collections.map((collection, index) => (
              <Link key={index} to={`/products?category=${encodeURIComponent(collection.category)}`}>
                <Card className={`group hover:shadow-xl transition-all duration-500 border-2 border-transparent hover:border-sea/20 h-full glass-card hover:scale-105 animate-bounce-in`} style={{animationDelay: `${100 + index * 100}ms`}}>
                  <CardContent className="p-8 text-center">
                    <div className="text-4xl mb-6 animate-float" style={{animationDelay: `${index * 0.5}s`}}>{collection.icon}</div>
                    <h3 className="text-xl font-serif font-semibold text-primary mb-4 group-hover:text-sea transition-colors">
                      {collection.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-light">
                      {collection.description}
                    </p>
                    <div className="flex justify-center">
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-sea group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="btn-pulse">
              <Link to="/products">
                View All Products
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Before/After Comparison Section */}
      <section className="section bg-gradient-to-b from-secondary/30 to-background">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-primary mb-6 tracking-tight animate-fade-in">
              Transforming <span className="text-sea">Laboratories</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light animate-fade-in animate-delay-200">
              See how we've revolutionized research environments across Singapore and beyond
            </p>
          </div>
          <div className="animate-scale-in animate-delay-300">
            <BeforeAfterComparison />
          </div>
        </div>
      </section>

      {/* Shop the Look Section */}
      <section className="section bg-background">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-primary mb-6 tracking-tight animate-fade-in">
              Shop the <span className="text-sea">Look</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light animate-fade-in animate-delay-200">
              Click on the equipment in this laboratory to discover our products and their specifications
            </p>
          </div>
          <div className="animate-fade-in-right animate-delay-300">
            <ShopTheLook />
          </div>
        </div>
      </section>

      {/* Improved CTA Section with better transition */}
      <section className="section bg-gradient-to-br from-sea-light via-sea to-sea-dark relative overflow-hidden">
        {/* Decorative elements for better transition */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,20 C30,10 70,30 100,20 L100,100 L0,100 Z" fill="currentColor" />
          </svg>
        </div>
        
        <div className="container-custom text-center relative z-10">
          <h2 className="text-4xl font-serif font-bold text-white mb-6 tracking-tight animate-fade-in">
            Ready to Transform Your <span className="text-sand-light">Laboratory?</span>
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in animate-delay-200">
            Let's collaborate to create a laboratory solution that exceeds your expectations 
            and elevates your research capabilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-scale-in animate-delay-500">
            <Button asChild variant="hero" size="lg" className="animate-float">
              <Link to="/contact">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
              <Link to="/floor-planner">
                Try Floor Planner
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
