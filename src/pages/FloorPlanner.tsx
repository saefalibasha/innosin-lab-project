
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import HeroNavigation from "@/components/HeroNavigation";
import Footer from "@/components/Footer";

const FloorPlanner = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      {!isFullscreen && <HeroNavigation />}
      <div className={`${isFullscreen ? 'h-screen' : 'min-h-screen'} bg-background`}>
        <div className="container py-8">
          {!isFullscreen && (
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)} 
              className="mb-6 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          )}

          <AnimatedSection animation="fade-in">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Laboratory Floor Planner
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Design and visualize your ideal laboratory layout with our interactive 3D planner
              </p>
              
              <Button 
                onClick={toggleFullscreen}
                variant="outline"
                size="lg"
                className="mb-8"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-4 h-4 mr-2" />
                    Exit Fullscreen
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Enter Fullscreen
                  </>
                )}
              </Button>
            </div>

            <div className={`bg-card border rounded-lg ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'} flex items-center justify-center transition-all duration-300`}>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏗️</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">3D Floor Planner</h3>
                <p className="text-muted-foreground">
                  Interactive floor planning tool coming soon...
                </p>
              </div>
            </div>

            {!isFullscreen && (
              <div className="mt-12 grid md:grid-cols-3 gap-8">
                <div className="text-center p-6 rounded-xl bg-card border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">📐</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Precision Design</h3>
                  <p className="text-muted-foreground text-sm">
                    Create accurate floor plans with precise measurements and specifications.
                  </p>
                </div>

                <div className="text-center p-6 rounded-xl bg-card border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">🔄</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Real-time Preview</h3>
                  <p className="text-muted-foreground text-sm">
                    See changes instantly with our real-time 3D visualization technology.
                  </p>
                </div>

                <div className="text-center p-6 rounded-xl bg-card border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">💾</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Save & Share</h3>
                  <p className="text-muted-foreground text-sm">
                    Save your designs and share them with colleagues for collaboration.
                  </p>
                </div>
              </div>
            )}
          </AnimatedSection>
        </div>
      </div>
      {!isFullscreen && <Footer />}
    </>
  );
};

export default FloorPlanner;
