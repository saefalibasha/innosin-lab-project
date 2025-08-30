import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import HeroNavigation from "@/components/HeroNavigation";
import Footer from "@/components/Footer";

const Blog = () => {
  const navigate = useNavigate();

  return (
    <>
      <HeroNavigation />
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <AnimatedSection animation="fade-in">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Laboratory Insights
              </h1>
              <p className="text-xl text-muted-foreground">
                Latest trends, innovations, and best practices in laboratory design and management
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatedSection animation="slide-in-up" delay={200}>
                <div className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
                  <div className="p-6">
                    <div className="text-sm text-muted-foreground mb-2">March 15, 2024</div>
                    <h3 className="text-xl font-semibold mb-3">Future of Laboratory Automation</h3>
                    <p className="text-muted-foreground mb-4">
                      Exploring how automation is revolutionizing laboratory workflows and increasing efficiency...
                    </p>
                    <Button variant="outline" size="sm">Read More</Button>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="slide-in-up" delay={400}>
                <div className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-secondary/20 to-accent/20"></div>
                  <div className="p-6">
                    <div className="text-sm text-muted-foreground mb-2">March 10, 2024</div>
                    <h3 className="text-xl font-semibold mb-3">Sustainable Laboratory Design</h3>
                    <p className="text-muted-foreground mb-4">
                      How modern laboratories are adopting eco-friendly practices and sustainable materials...
                    </p>
                    <Button variant="outline" size="sm">Read More</Button>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="slide-in-up" delay={600}>
                <div className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-accent/20 to-primary/20"></div>
                  <div className="p-6">
                    <div className="text-sm text-muted-foreground mb-2">March 5, 2024</div>
                    <h3 className="text-xl font-semibold mb-3">Safety Standards in Modern Labs</h3>
                    <p className="text-muted-foreground mb-4">
                      Essential safety protocols and equipment for maintaining secure laboratory environments...
                    </p>
                    <Button variant="outline" size="sm">Read More</Button>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            <div className="mt-16 text-center">
              <AnimatedSection animation="fade-in" delay={800}>
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-2xl">
                  <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
                  <p className="text-muted-foreground mb-6">
                    Subscribe to our newsletter for the latest laboratory insights and product updates.
                  </p>
                  <Button size="lg">Subscribe Now</Button>
                </div>
              </AnimatedSection>
            </div>
          </AnimatedSection>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Blog;
