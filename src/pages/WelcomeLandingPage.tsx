import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Beaker, Microscope, FlaskConical, Building2, Globe, ChevronDown } from "lucide-react";

// Enhanced RetroGrid Component
function RetroGrid({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lightLineColor = "#E2E8F0",
  darkLineColor = "#334155",
}: {
  angle?: number;
  cellSize?: number;
  opacity?: number;
  lightLineColor?: string;
  darkLineColor?: string;
}) {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--light-line": lightLineColor,
    "--dark-line": darkLineColor,
  } as React.CSSProperties;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden [perspective:200px] opacity-[var(--opacity)]"
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent to-90% dark:from-black" />
    </div>
  );
}

// Animated Counter Component
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev + step >= target) {
          clearInterval(timer);
          return target;
        }
        return prev + step;
      });
    }, 16);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{Math.floor(count)}{suffix}</span>;
}

// Floating Icons Component
function FloatingIcons() {
  const icons = [
    { Icon: Beaker, delay: 0 },
    { Icon: Microscope, delay: 1 },
    { Icon: FlaskConical, delay: 2 },
    { Icon: Building2, delay: 3 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map(({ Icon, delay }, index) => (
        <Icon
          key={index}
          className={`absolute text-primary/10 h-24 w-24 animate-float`}
          style={{
            left: `${20 + index * 20}%`,
            top: `${30 + index * 15}%`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function WelcomeLandingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToContent = () => {
    document.getElementById('content-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Elements */}
      <RetroGrid angle={75} cellSize={80} opacity={0.08} />
      <FloatingIcons />
      
      {/* Main Hero Section */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation Header */}
        <header className="absolute top-0 left-0 right-0 z-20 p-6">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Beaker className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">Innosin Lab</span>
            </div>
            <Button 
              variant="outline" 
              className="bg-white/80 backdrop-blur-sm hover:bg-white"
              onClick={() => navigate("/home")}
            >
              Skip Intro
            </Button>
          </div>
        </header>

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {/* Badge */}
            <Badge 
              variant="secondary" 
              className="mb-6 px-4 py-2 text-sm bg-white/80 backdrop-blur-sm shadow-lg border-0"
            >
              <Globe className="h-4 w-4 mr-2" />
              Leading Laboratory Solutions Provider
            </Badge>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="text-transparent bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-700 bg-clip-text">
                Innovative
              </span>
              <br />
              <span className="text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text">
                Laboratory
              </span>
              <br />
              <span className="text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text">
                Solutions
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Empowering research and industry with cutting-edge design and advanced fabrication.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12 max-w-2xl mx-auto">
              {[
                { label: "Products", value: 500, suffix: "+" },
                { label: "Countries", value: 25, suffix: "+" },
                { label: "Labs Equipped", value: 1000, suffix: "+" },
                { label: "Years Experience", value: 15, suffix: "+" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                className="px-8 py-4 text-lg rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                onClick={() => navigate("/home")}
              >
                Explore Solutions
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg rounded-full bg-white/80 backdrop-blur-sm hover:bg-white border-slate-200 hover:border-blue-300 transition-all duration-300"
                onClick={() => navigate("/products")}
              >
                View Products
              </Button>
            </div>

            {/* Scroll Indicator */}
            <button 
              onClick={scrollToContent}
              className="animate-bounce text-slate-400 hover:text-blue-600 transition-colors"
            >
              <ChevronDown className="h-8 w-8 mx-auto" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div id="content-section" className="relative z-10 py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6">
              Discover Our Excellence
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From concept to completion, we provide comprehensive laboratory solutions
              that drive innovation and scientific breakthroughs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Building2,
                title: "Custom Design",
                description: "Tailored laboratory spaces designed to meet your specific research requirements and workflow needs."
              },
              {
                icon: Beaker,
                title: "Premium Equipment",
                description: "State-of-the-art laboratory furniture and equipment from leading manufacturers worldwide."
              },
              {
                icon: Globe,
                title: "Global Reach",
                description: "Serving laboratories across 25+ countries with reliable installation and support services."
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="px-8 py-4 text-lg rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl"
              onClick={() => navigate("/home")}
            >
              Enter Innosin Lab
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}