
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
import LabTransformCTA from "@/components/LabTransformCTA";

const Index = () => {
  const collections = [
    {
      title: "Broen-Lab",
      description: "Advanced fume hoods and ventilation systems designed for chemical safety and efficiency",
      logoPath: "/brand-logos/broen-lab-logo.png",
      category: "Broen-Lab"
    },
    {
      title: "Hamilton Laboratory Solutions", 
      description: "Premium laboratory furniture and benches with chemical-resistant surfaces",
      logoPath: "/brand-logos/hamilton-laboratory-logo.png",
      category: "Hamilton Laboratory Solutions"
    },
    {
      title: "Oriental Giken Inc.",
      description: "Emergency safety equipment including eye wash stations and safety showers",
      logoPath: "/brand-logos/oriental-giken-logo.png",
      category: "Oriental Giken Inc."
    },
    {
      title: "Innosin Lab",
      description: "Comprehensive storage solutions and laboratory equipment for modern research facilities",
      logoPath: "/brand-logos/innosin-lab-logo.png",
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
                    {/* REPLACEABLE ASSET: Brand Logo */}
                    {/* Location: {collection.logoPath} */}
                    {/* Purpose: {collection.title} brand representation */}
                    {/* Dimensions: 80x80px recommended */}
                    <div className="flex justify-center mb-6 animate-float" style={{animationDelay: `${index * 0.5}s`}}>
                      <img 
                        src={collection.logoPath}
                        alt={`${collection.title} Logo`}
                        className="w-20 h-20 object-contain transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          // Fallback to emoji if logo not found
                          const fallbackEmojis = ["💨", "🧪", "🛡️", "📦"];
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="text-4xl">${fallbackEmojis[index] || "🔬"}</div>`;
                          }
                        }}
                      />
                    </div>
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
            <Button asChild variant="outline" size="lg" className="animate-pulse-subtle">
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

      {/* Build This Lab Section */}
      <section className="section bg-background">
        <div className="container-custom">
          <div className="animate-fade-in-right animate-delay-300">
            <ShopTheLook />
          </div>
        </div>
      </section>

      {/* Ready to Transform Your Laboratory CTA Section */}
      <LabTransformCTA />
    </div>
  );
};

export default Index;
