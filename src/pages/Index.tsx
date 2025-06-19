
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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
  const heroImages = [
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&h=800&fit=crop",
    "https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=1920&h=800&fit=crop",
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1920&h=800&fit=crop"
  ];

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
      {/* Hero Section with Carousel */}
      <section className="relative h-[80vh] overflow-hidden wave-bg">
        <Carousel className="w-full h-full">
          <CarouselContent>
            {heroImages.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[80vh]">
                  <img 
                    src={image} 
                    alt={`Laboratory ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-sea/80 via-sea/60 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white max-w-4xl px-4 animate-fade-in">
                      <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight animate-slide-in-bottom animate-delay-200">
                        Precision in Every
                        <span className="block font-bold text-sand-light animate-float">Product</span>
                      </h1>
                      <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto animate-fade-in-right animate-delay-500">
                        Professional laboratory solutions designed for excellence and innovation
                      </p>
                      <div className="mt-8 animate-scale-in animate-delay-700">
                        <Button asChild variant="hero" size="lg">
                          <Link to="/products">
                            Explore Solutions <ArrowRight className="ml-2 w-5 h-5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-8 glass-card" />
          <CarouselNext className="right-8 glass-card" />
        </Carousel>
      </section>

      {/* Company Introduction Section */}
      <section className="section bg-gradient-to-b from-background to-secondary/30">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-left">
              <h2 className="text-4xl font-serif font-bold text-primary mb-6 tracking-tight">
                Leading the Way in <span className="text-sea">Lab Solutions</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed font-light">
                For over 15 years, Innosin Lab has been at the forefront of laboratory innovation, 
                providing comprehensive solutions that enhance research capabilities and ensure 
                optimal safety standards. From cutting-edge furniture to complete facility design, 
                we deliver unparalleled quality and precision in every project.
              </p>
              <Button asChild variant="heroSolid" className="animate-float">
                <Link to="/about">
                  Our Story <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
            <div className="relative animate-fade-in-right animate-delay-300">
              <img 
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop"
                alt="Modern Laboratory"
                className="w-full h-96 object-cover rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sea/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Collections Section */}
      <section className="section bg-background">
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
            <Button asChild variant="outline" size="lg" className="btn-glow">
              <Link to="/products">
                View All Products
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Video Hero Section */}
      <VideoHero />

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

      {/* CTA Section */}
      <section className="section wave-bg">
        <div className="container-custom text-center">
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
