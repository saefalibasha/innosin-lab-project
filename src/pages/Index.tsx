
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
    <div className="min-h-screen bg-white">
      {/* Hero Section with Carousel */}
      <section className="relative h-[80vh] overflow-hidden">
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
                  <div className="absolute inset-0 bg-black bg-opacity-40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white max-w-4xl px-4">
                      <h1 className="text-5xl md:text-7xl font-light mb-6 tracking-tight">
                        Precision in Every
                        <span className="block font-bold">Product</span>
                      </h1>
                      <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto">
                        Professional laboratory solutions designed for excellence and innovation
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-8" />
          <CarouselNext className="right-8" />
        </Carousel>
      </section>

      {/* Company Introduction Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-light text-black mb-6 tracking-tight">
                Leading the Way in <span className="font-bold">Lab Solutions</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed font-light">
                For over 15 years, Innosin Lab has been at the forefront of laboratory innovation, 
                providing comprehensive solutions that enhance research capabilities and ensure 
                optimal safety standards. From cutting-edge furniture to complete facility design, 
                we deliver unparalleled quality and precision in every project.
              </p>
              <Button asChild size="lg" className="bg-black text-white hover:bg-gray-800 rounded-full px-8 py-3">
                <Link to="/about">
                  Our Story <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop"
                alt="Modern Laboratory"
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product Collections Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-black mb-6 tracking-tight">
              Product <span className="font-bold">Collections</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              Explore our comprehensive range of laboratory solutions from leading manufacturers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {collections.map((collection, index) => (
              <Link key={index} to={`/products?category=${encodeURIComponent(collection.category)}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-gray-300 h-full">
                  <CardContent className="p-8 text-center">
                    <div className="text-4xl mb-6">{collection.icon}</div>
                    <h3 className="text-xl font-semibold text-black mb-4 group-hover:text-gray-800 transition-colors">
                      {collection.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 font-light">
                      {collection.description}
                    </p>
                    <div className="flex justify-center">
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline" className="border-2 border-gray-300 text-black hover:bg-gray-50 rounded-full px-8 py-3">
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
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-black mb-6 tracking-tight">
              Transforming <span className="font-bold">Laboratories</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              See how we've revolutionized research environments across Singapore and beyond
            </p>
          </div>
          <BeforeAfterComparison />
        </div>
      </section>

      {/* Shop the Look Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-black mb-6 tracking-tight">
              Shop the <span className="font-bold">Look</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              Click on the equipment in this laboratory to discover our products and their specifications
            </p>
          </div>
          <ShopTheLook />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-light text-white mb-6 tracking-tight">
            Ready to Transform Your <span className="font-bold">Laboratory?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Let's collaborate to create a laboratory solution that exceeds your expectations 
            and elevates your research capabilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100 rounded-full px-8 py-3 font-medium">
              <Link to="/contact">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 rounded-full px-8 py-3 font-medium">
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
