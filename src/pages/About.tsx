import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Award, Users, Globe, Target } from 'lucide-react';
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
      <section className="section bg-gradient-to-br from-sea/10 via-background to-secondary/20 relative overflow-hidden">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-primary mb-6 tracking-tight animate-fade-in">
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
      <section className="section bg-gradient-to-b from-secondary/30 to-background py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            <div className="animate-fade-in space-y-12">
              <div>
                <h2 className="text-4xl font-serif font-bold text-primary mb-6">
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
                  className="w-full h-64 object-cover rounded-lg mb-6"
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
      <section className="section bg-background py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-primary mb-6 animate-fade-in">
              {aboutPageContent.values.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in animate-delay-200">
              These fundamental principles guide everything we do and shape our commitment to excellence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aboutPageContent.values.items.map((value, index) => {
              const IconComponent = value.icon === 'trophy' ? Award : 
                                  value.icon === 'star' ? Award :
                                  value.icon === 'lightbulb' ? Globe :
                                  Target;
              
              return (
                <Card key={index} className="text-center border-2 border-transparent hover:border-sea/20 transition-all duration-300 animate-bounce-in" style={{animationDelay: `${100 + index * 100}ms`}}>
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-sea/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-sea" />
                    </div>
                    <h3 className="text-xl font-serif font-semibold text-primary mb-3">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="section bg-gradient-to-b from-secondary/30 to-background py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-primary mb-6 animate-fade-in">
              {aboutPageContent.timeline.title} <span className="text-sea">{aboutPageContent.timeline.titleHighlight}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in animate-delay-200">
              {aboutPageContent.timeline.description}
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
