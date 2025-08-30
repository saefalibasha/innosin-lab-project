import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import HeroNavigation from "@/components/HeroNavigation";
import Footer from "@/components/Footer";

const About = () => {
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
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  About Innosin Lab
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Leading the future of laboratory solutions with innovative designs and cutting-edge technology
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                <AnimatedSection animation="slide-in-left" delay={200}>
                  <div>
                    <h2 className="text-3xl font-bold mb-6 text-primary">Our Vision</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                      At Innosin Lab, we envision a world where laboratory environments are not just functional, 
                      but inspiring spaces that foster innovation and discovery. Our commitment to excellence 
                      drives us to create products that enhance productivity while maintaining the highest 
                      standards of safety and reliability.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      We believe that the right laboratory furniture and equipment can transform the way 
                      scientists work, enabling breakthrough discoveries that benefit humanity.
                    </p>
                  </div>
                </AnimatedSection>

                <AnimatedSection animation="slide-in-right" delay={400}>
                  <div className="bg-gradient-to-br from-primary/5 to-secondary/10 p-8 rounded-2xl">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">25+</div>
                        <div className="text-sm text-muted-foreground">Years of Excellence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">500+</div>
                        <div className="text-sm text-muted-foreground">Products Available</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                        <div className="text-sm text-muted-foreground">Labs Equipped</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">50+</div>
                        <div className="text-sm text-muted-foreground">Countries Served</div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              </div>

              <AnimatedSection animation="fade-in" delay={600}>
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                  <div className="text-center p-6 rounded-xl bg-card border">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔬</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Innovation</h3>
                    <p className="text-muted-foreground">
                      Continuously pushing the boundaries of laboratory furniture design with cutting-edge solutions.
                    </p>
                  </div>

                  <div className="text-center p-6 rounded-xl bg-card border">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🛡️</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Quality</h3>
                    <p className="text-muted-foreground">
                      Uncompromising quality standards ensure our products meet the highest laboratory requirements.
                    </p>
                  </div>

                  <div className="text-center p-6 rounded-xl bg-card border">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🌍</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Sustainability</h3>
                    <p className="text-muted-foreground">
                      Committed to environmentally responsible manufacturing and sustainable laboratory solutions.
                    </p>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="slide-in-up" delay={800}>
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-2xl text-center">
                  <h2 className="text-3xl font-bold mb-4 text-primary">Ready to Transform Your Lab?</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Discover how our innovative solutions can enhance your laboratory environment.
                  </p>
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Explore Our Products
                  </Button>
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

export default About;
