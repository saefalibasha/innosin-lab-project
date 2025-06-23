import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Award, Users, Globe, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Timeline } from '@/components/ui/timeline';
import LabTransformCTA from '@/components/LabTransformCTA';
import { aboutPageContent } from '@/data/aboutPageContent';

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

  const timelineData = [
    {
      title: "2024",
      content: (
        <div>
          <p className="text-muted-foreground text-sm md:text-base font-normal mb-8 leading-relaxed">
            Achieved ISO certification and expanded our digital laboratory design platform. 
            Launched innovative modular lab furniture solutions and reached 500+ completed projects milestone.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <img
              src="/page-images/about/timeline-2024-equipment.jpg"
              alt="Modern laboratory equipment 2024"
              className="rounded-lg object-cover h-32 md:h-48 w-full shadow-lg"
            />
            <img
              src="/page-images/about/timeline-2024-technology.jpg"
              alt="Laboratory technology advancement 2024"
              className="rounded-lg object-cover h-32 md:h-48 w-full shadow-lg"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <img
              src="/page-images/about/timeline-2024-research.jpg"
              alt="Research environment 2024"
              className="rounded-lg object-cover h-32 md:h-48 w-full shadow-lg"
            />
            <img
              src="/page-images/about/timeline-2024-design.jpg"
              alt="Laboratory design showcase 2024"
              className="rounded-lg object-cover h-32 md:h-48 w-full shadow-lg"
            />
          </div>
        </div>
      ),
    },
    {
      title: "2018",
      content: (
        <div>
          <p className="text-muted-foreground text-sm md:text-base font-normal mb-8 leading-relaxed">
            Major expansion year with entry into pharmaceutical laboratory design. 
            Established partnerships with leading research institutions across Southeast Asia.
          </p>
          <p className="text-muted-foreground text-sm md:text-base font-normal mb-8 leading-relaxed">
            Pioneered sustainable laboratory practices and introduced energy-efficient ventilation systems 
            that reduced operational costs by 30% for our clients.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <img
              src="/page-images/about/timeline-2018-pharmaceutical.jpg"
              alt="Pharmaceutical laboratory project 2018"
              className="rounded-lg object-cover h-32 md:h-48 w-full shadow-lg"
            />
            <img
              src="/page-images/about/timeline-2018-facility.jpg"
              alt="Research facility expansion 2018"
              className="rounded-lg object-cover h-32 md:h-48 w-full shadow-lg"
            />
          </div>
        </div>
      ),
    },
    {
      title: "2012",
      content: (
        <div>
          <p className="text-muted-foreground text-sm md:text-base font-normal mb-4 leading-relaxed">
            Achieved significant milestones in laboratory automation and safety protocols
          </p>
          <div className="mb-8">
            <div className="flex gap-2 items-center text-muted-foreground text-sm md:text-base mb-2">
              ✅ Launched automated sample handling systems
            </div>
            <div className="flex gap-2 items-center text-muted-foreground text-sm md:text-base mb-2">
              ✅ Implemented advanced safety protocols
            </div>
            <div className="flex gap-2 items-center text-muted-foreground text-sm md:text-base mb-2">
              ✅ Received Singapore Safety Excellence Award
            </div>
            <div className="flex gap-2 items-center text-muted-foreground text-sm md:text-base mb-2">
              ✅ Expanded team to 50+ specialists
            </div>
            <div className="flex gap-2 items-center text-muted-foreground text-sm md:text-base">
              ✅ Established quality management system
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <img
              src="/page-images/about/timeline-2012-automation.jpg"
              alt="Laboratory automation systems 2012"
              className="rounded-lg object-cover h-32 md:h-48 w-full shadow-lg"
            />
            <img
              src="/page-images/about/timeline-2012-safety.jpg"
              alt="Safety protocol implementation 2012"
              className="rounded-lg object-cover h-32 md:h-48 w-full shadow-lg"
            />
          </div>
        </div>
      ),
    },
    {
      title: "2009",
      content: (
        <div>
          <p className="text-muted-foreground text-sm md:text-base font-normal mb-8 leading-relaxed">
            Founded Innosin Lab with a vision to revolutionize laboratory design in Singapore. 
            Started with a small team of 5 dedicated professionals and our first major project 
            with the National University of Singapore.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <img
              src="/page-images/about/timeline-2009-founding.jpg"
              alt="Company founding 2009"
              className="rounded-lg object-cover h-32 md:h-48 w-full shadow-lg"
            />
            <img
              src="/page-images/about/timeline-2009-design.jpg"
              alt="Early laboratory design work 2009"
              className="rounded-lg object-cover h-32 md:h-48 w-full shadow-lg"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-0">
      {/* Hero Section - Updated with About Innosin content */}
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

      {/* Mission & Vision - Updated with better spacing */}
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
                <img 
                  src="/page-images/about/mission-vision.jpg" 
                  alt="Modern laboratory mission and vision" 
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

      {/* Values Section - Keep existing */}
      <section className="section bg-background py-20">
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

      {/* Company Timeline - Updated spacing */}
      <section className="section bg-gradient-to-b from-secondary/30 to-background py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-primary mb-6 animate-fade-in">
              Company <span className="text-sea">History</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in animate-delay-200">
              From humble beginnings to industry leadership - explore the key milestones that have shaped our story.
            </p>
          </div>
          <div className="animate-scale-in animate-delay-300">
            <Timeline data={timelineData} />
          </div>
        </div>
      </section>

      {/* Ready to Transform Your Laboratory CTA - Keep existing */}
      <LabTransformCTA />
    </div>
  );
};

export default About;
