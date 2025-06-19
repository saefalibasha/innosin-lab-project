
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Award, Users, Globe, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import CompanyTimeline from '@/components/CompanyTimeline';
import CertificationBadges from '@/components/CertificationBadges';
import GoogleMapsLocation from '@/components/GoogleMapsLocation';
import LabTransformCTA from '@/components/LabTransformCTA';

const About = () => {
  const values = [
    {
      icon: Award,
      title: "Excellence",
      description: "We maintain the highest standards in every aspect of our work, from design to implementation and beyond."
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "We work closely with our clients to understand their unique needs and deliver tailored solutions."
    },
    {
      icon: Globe,
      title: "Innovation",
      description: "We continuously evolve our offerings to incorporate the latest technologies and industry best practices."
    },
    {
      icon: Target,
      title: "Precision",
      description: "Every detail matters in laboratory environments. We ensure accuracy and precision in all our deliverables."
    }
  ];

  const stats = [
    { number: "500+", label: "Projects Completed" },
    { number: "15+", label: "Years of Experience" },
    { number: "50+", label: "Research Institutions" },
    { number: "95%", label: "Client Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Section */}
      <section className="section bg-gradient-to-br from-sea/10 via-background to-secondary/20 relative overflow-hidden">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-primary mb-6 tracking-tight animate-fade-in">
              Pioneering Laboratory <span className="text-sea">Excellence</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed font-light animate-fade-in animate-delay-200">
              For over 15 years, Innosin Lab has been transforming research environments across Singapore and beyond, 
              delivering world-class laboratory solutions that empower scientific discovery and innovation.
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

      {/* Stats Section */}
      <section className="section bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{animationDelay: `${100 + index * 100}ms`}}>
                <div className="text-4xl md:text-5xl font-serif font-bold text-sea mb-2">
                  {stat.number}
                </div>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section bg-gradient-to-b from-secondary/30 to-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl font-serif font-bold text-primary mb-6">
                Our <span className="text-sea">Mission</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                To empower scientific advancement by providing innovative, high-quality laboratory solutions 
                that enable researchers to focus on what matters most - their groundbreaking discoveries.
              </p>
              <h3 className="text-2xl font-serif font-semibold text-primary mb-4">
                Our <span className="text-sea">Vision</span>
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To be the leading laboratory solutions provider in Southeast Asia, recognized for our 
                commitment to excellence, innovation, and customer satisfaction.
              </p>
            </div>
            <div className="animate-fade-in-right animate-delay-300">
              <div className="bg-gradient-to-br from-sea/10 to-sea/5 p-8 rounded-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=600&h=400&fit=crop" 
                  alt="Modern laboratory" 
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
                <blockquote className="text-lg italic text-muted-foreground">
                  "Innovation distinguishes between a leader and a follower. At Innosin Lab, 
                  we choose to lead through excellence and innovation."
                </blockquote>
                <cite className="block mt-4 text-sea font-semibold">- Innosin Lab Leadership Team</cite>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section bg-background">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-primary mb-6 animate-fade-in">
              Our Core <span className="text-sea">Values</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in animate-delay-200">
              These fundamental principles guide everything we do and shape our commitment to excellence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center border-2 border-transparent hover:border-sea/20 transition-all duration-300 animate-bounce-in" style={{animationDelay: `${100 + index * 100}ms`}}>
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-sea/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-sea" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-primary mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="section bg-gradient-to-b from-secondary/30 to-background">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-primary mb-6 animate-fade-in">
              Our <span className="text-sea">Journey</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in animate-delay-200">
              From humble beginnings to industry leadership - explore the milestones that have shaped our story.
            </p>
          </div>
          <div className="animate-scale-in animate-delay-300">
            <CompanyTimeline />
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="section bg-background">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-primary mb-6 animate-fade-in">
              Quality <span className="text-sea">Assurance</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in animate-delay-200">
              Our certifications and partnerships demonstrate our commitment to the highest industry standards.
            </p>
          </div>
          <div className="animate-fade-in animate-delay-300">
            <CertificationBadges />
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section bg-gradient-to-b from-secondary/30 to-background">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-primary mb-6 animate-fade-in">
              Visit Our <span className="text-sea">Location</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in animate-delay-200">
              Located in the heart of Singapore, we're easily accessible and ready to serve your laboratory needs.
            </p>
          </div>
          <div className="animate-scale-in animate-delay-300">
            <GoogleMapsLocation />
          </div>
        </div>
      </section>

      {/* Ready to Transform Your Laboratory CTA */}
      <LabTransformCTA />
    </div>
  );
};

export default About;
