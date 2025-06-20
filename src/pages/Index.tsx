
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
import { brandCollections } from "@/data/brandCollections";
import { homePageContent } from "@/data/homePageContent";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Video Hero Section */}
      <VideoHero />

      {/* Product Collections Section */}
      <section className="section bg-background relative">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-primary mb-6 tracking-tight animate-fade-in">
              {homePageContent.productCollections.title} <span className="text-sea">{homePageContent.productCollections.titleHighlight}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light animate-fade-in animate-delay-200">
              {homePageContent.productCollections.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {brandCollections.map((collection, index) => (
              <Link key={index} to={`/products?category=${encodeURIComponent(collection.category)}`}>
                <Card className={`group hover:shadow-xl transition-all duration-500 border-2 border-transparent hover:border-sea/20 h-full glass-card hover:scale-105 animate-bounce-in`} style={{animationDelay: `${100 + index * 100}ms`}}>
                  <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                    {/* REPLACEABLE ASSET: Brand Logo */}
                    {/* Location: {collection.logoPath} */}
                    {/* Purpose: {collection.title} brand representation */}
                    {/* Dimensions: 144x144px recommended */}
                    <div className="flex justify-center mb-2 animate-float" style={{animationDelay: `${index * 0.5}s`}}>
                      <img 
                        src={collection.logoPath}
                        alt={`${collection.title} Logo`}
                        className="w-36 h-36 object-contain object-center transition-transform duration-300 group-hover:scale-110"
                        style={{ filter: 'contrast(1.1) brightness(1.05)' }}
                      />
                    </div>
                    <p className="text-muted-foreground text-base leading-relaxed mb-4 font-light text-center">
                      {collection.description}
                    </p>
                    <div className="flex justify-center mt-auto">
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
                {homePageContent.productCollections.viewAllButton}
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
              {homePageContent.transformingLabs.title} <span className="text-sea">{homePageContent.transformingLabs.titleHighlight}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light animate-fade-in animate-delay-200">
              {homePageContent.transformingLabs.description}
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
