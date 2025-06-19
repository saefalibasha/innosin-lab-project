
import React from 'react';
import { Award, Users, Lightbulb, Heart } from 'lucide-react';
import CompanyTimeline from '@/components/CompanyTimeline';
import ProcessInfographic from '@/components/ProcessInfographic';
import CertificationBadges from '@/components/CertificationBadges';
import AnimatedSection from '@/components/AnimatedSection';

const About = () => {
  const values = [
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: 'Innovation',
      description: 'We constantly push the boundaries of design and technology to create products that inspire.'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Quality',
      description: 'Every product is crafted with meticulous attention to detail and the highest standards.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community',
      description: 'We believe in building lasting relationships with our customers and partners.'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Passion',
      description: 'Our love for design and craftsmanship drives everything we do.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      description: 'Visionary leader with 15+ years in design and technology.'
    },
    {
      name: 'Michael Chen',
      role: 'Head of Design',
      description: 'Award-winning designer specializing in 3D modeling and visualization.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Technology Director',
      description: 'Expert in web technologies and 3D rendering systems.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="wave-bg py-20">
        <div className="max-w-4xl mx-auto text-center container-custom">
          <AnimatedSection animation="fade-in" delay={100}>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              About Innosin Lab
            </h1>
          </AnimatedSection>
          <AnimatedSection animation="fade-in" delay={300}>
            <p className="text-xl text-blue-100 leading-relaxed">
              We're passionate about creating innovative laboratory solutions that advance scientific discovery. 
              Our mission is to design and manufacture world-class laboratory furniture and safety equipment.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Story Section */}
      <section className="section">
        <div className="max-w-4xl mx-auto container-custom">
          <div className="prose prose-lg max-w-none">
            <AnimatedSection animation="slide-up" delay={100}>
              <h2 className="text-3xl font-serif font-bold text-primary mb-8 text-center">Our Story</h2>
            </AnimatedSection>
            <div className="text-muted-foreground space-y-6">
              <AnimatedSection animation="fade-in-left" delay={200}>
                <p>
                  Founded in 2010, Innosin Lab emerged from a simple idea: what if laboratories could be designed 
                  to truly enhance scientific productivity and safety? Our founders, experienced engineers and 
                  scientists, set out to revolutionize laboratory environments.
                </p>
              </AnimatedSection>
              <AnimatedSection animation="fade-in-right" delay={400}>
                <p>
                  Starting with a focus on fume hoods and safety equipment, we quickly expanded our expertise to 
                  include comprehensive laboratory planning and custom furniture solutions. We believed that every 
                  researcher deserved a workspace designed for both safety and efficiency.
                </p>
              </AnimatedSection>
              <AnimatedSection animation="fade-in-left" delay={600}>
                <p>
                  Today, we're proud to serve research institutions, universities, and industrial laboratories 
                  worldwide, helping them create environments where breakthrough discoveries happen. Our commitment 
                  to innovation, quality, and safety continues to drive us forward.
                </p>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="section bg-gradient-to-b from-secondary/30 to-background">
        <div className="container-custom">
          <AnimatedSection animation="scale-in" delay={100}>
            <CompanyTimeline />
          </AnimatedSection>
        </div>
      </section>

      {/* Process Infographic */}
      <section className="section">
        <div className="container-custom">
          <AnimatedSection animation="bounce-in" delay={200}>
            <ProcessInfographic />
          </AnimatedSection>
        </div>
      </section>

      {/* Certifications */}
      <section className="section bg-gradient-to-b from-secondary/30 to-background">
        <div className="container-custom">
          <AnimatedSection animation="rotate-in" delay={100}>
            <CertificationBadges />
          </AnimatedSection>
        </div>
      </section>

      {/* Values Section */}
      <section className="section">
        <div className="container-custom">
          <AnimatedSection animation="fade-in" delay={100}>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold text-primary mb-4">Our Values</h2>
              <p className="text-xl text-muted-foreground">The principles that guide everything we do</p>
            </div>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <AnimatedSection key={index} animation="slide-up" delay={200 + index * 100}>
                <div className="text-center glass-card p-6 rounded-lg hover:shadow-xl transition-all duration-300 animate-float" style={{animationDelay: `${index * 0.5}s`}}>
                  <div className="flex justify-center mb-4 text-sea">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-primary mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section bg-gradient-to-b from-secondary/30 to-background">
        <div className="container-custom">
          <AnimatedSection animation="fade-in" delay={100}>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold text-primary mb-4">Meet Our Team</h2>
              <p className="text-xl text-muted-foreground">The talented people behind Innosin Lab</p>
            </div>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <AnimatedSection key={index} animation="bounce-in" delay={200 + index * 150}>
                <div className="text-center glass-card p-6 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-sea to-sea-dark rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-primary mb-2">{member.name}</h3>
                  <p className="text-sea font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground">{member.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="wave-bg py-16">
        <div className="max-w-4xl mx-auto text-center container-custom">
          <AnimatedSection animation="scale-in" delay={100}>
            <h2 className="text-3xl font-serif font-bold text-white mb-4">
              Ready to Transform Your Laboratory?
            </h2>
            <p className="text-xl text-blue-100">
              Discover how our innovative solutions can enhance your research environment.
            </p>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default About;
