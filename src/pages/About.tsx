import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Award, Users, Globe, Target, DollarSign, Clock, Headphones, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Timeline } from '@/components/ui/timeline';
import LabTransformCTA from '@/components/LabTransformCTA';
import { aboutPageContent } from '@/data/aboutPageContent';

const About = () => {
  // Create timeline data from content structure
  const timelineData = aboutPageContent.timeline.events.map(event => ({
    title: event.year,
    content: (
      <div>
        <h4 className="text-2xl font-serif font-bold text-primary mb-4">
          {event.title}
        </h4>
        <p className="text-muted-foreground text-sm md:text-base font-normal mb-8 leading-relaxed">
          {event.description}
        </p>
        <div className="w-full h-64 md:h-80 overflow-hidden rounded-lg shadow-lg">
          <img
            src={event.image}
            alt={event.imageAlt}
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>
    ),
  }));

  return (
    <div className="min-h-screen bg-background pt-0">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sea/10 via-background to-secondary/20 relative overflow-hidden py-8">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 tracking-tight animate-fade-in">
              {aboutPageContent.hero.title} <span className="text-sea">{aboutPageContent.hero.titleHighlight}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed font-light animate-fade-in animate-delay-200 text-justify">
              {aboutPageContent.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-scale-in animate-delay-300">
              <Button asChild variant="default" size="lg">
                <Link to="/contact">
                  Get in Touch <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/products">
                  View Our Solutions
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gradient-to-b from-secondary/30 to-background py-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="animate-fade-in space-y-6">
              <div>
                <h2 className="text-4xl font-serif font-bold text-primary mb-4">
                  {aboutPageContent.mission.title}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {aboutPageContent.mission.description}
                </p>
              </div>
              <div>
                <h2 className="text-4xl font-serif font-bold text-primary mb-4">
                  {aboutPageContent.vision.title}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {aboutPageContent.vision.description}
                </p>
              </div>
            </div>
            <div className="animate-fade-in-right animate-delay-300">
              <div className="bg-gradient-to-br from-sea/10 to-sea/5 p-8 rounded-2xl">
                <video 
                  src={aboutPageContent.mission.video} 
                  className="w-full h-80 object-cover rounded-lg"
                  controls
                  muted
                  loop
                  playsInline
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-background py-8">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-serif font-bold text-primary mb-4 animate-fade-in">
              Our Precision Advantage
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in animate-delay-200">
              Experience the strength of precision manufacturing with unmatched quality and reliability.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-2 border-transparent hover:border-sea/20 transition-all duration-300 animate-bounce-in" style={{animationDelay: '100ms'}}>
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-sea/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-sea" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-primary mb-3">
                  Direct Factory Pricing
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Eliminate middlemen costs with competitive pricing directly from our manufacturing facility
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-transparent hover:border-sea/20 transition-all duration-300 animate-bounce-in" style={{animationDelay: '200ms'}}>
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-sea/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-sea" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-primary mb-3">
                  Fast Turnaround Times
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Rapid project completion and delivery through optimized manufacturing processes
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-transparent hover:border-sea/20 transition-all duration-300 animate-bounce-in" style={{animationDelay: '300ms'}}>
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-sea/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-8 h-8 text-sea" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-primary mb-3">
                  Exceptional Support
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Comprehensive technical assistance and customer service from design to maintenance
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-transparent hover:border-sea/20 transition-all duration-300 animate-bounce-in" style={{animationDelay: '400ms'}}>
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-sea/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-sea" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-primary mb-3">
                  Precision Manufacturing
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Engineered for accuracy with advanced fabrication techniques and quality materials
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="bg-gradient-to-b from-secondary/30 to-background py-8">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-serif font-bold text-primary mb-4 animate-fade-in">
              Our <span className="text-sea">Story</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto animate-fade-in animate-delay-200 leading-relaxed">
              From humble beginnings as a stainless steel kitchen equipment fabricator in 1986 to becoming Asia's trusted partner in precision laboratory solutions today. Our journey spans nearly four decades of continuous innovation, unwavering quality commitment, and transformative growth. What began as a small workshop in Johor Bahru has evolved into a comprehensive laboratory infrastructure provider, serving research institutions, universities, and industries across Asia Pacific, Europe, and the Middle East. This is the story of passion meeting precision, of craftsmanship evolving into cutting-edge technology, and of a vision that continues to shape the future of scientific discovery.
            </p>
          </div>
          <div className="animate-scale-in animate-delay-300">
            <Timeline data={timelineData} />
          </div>
        </div>
      </section>

      {/* Ready to Transform Your Laboratory CTA */}
      <LabTransformCTA />
    </div>
  );
};

export default About;
