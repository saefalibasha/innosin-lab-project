
import React from 'react';
import HeroNavigation from '@/components/HeroNavigation';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroNavigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">About Innosin Lab</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Leading the way in innovative laboratory solutions across Southeast Asia
            </p>
          </div>
        </section>

        {/* Company Overview */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-primary">Our Story</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Founded with a vision to revolutionize laboratory environments, Innosin Lab has been at the forefront of providing cutting-edge laboratory solutions for over a decade.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  We specialize in comprehensive laboratory design, equipment supply, and installation services, ensuring that research facilities across Southeast Asia have access to world-class laboratory infrastructure.
                </p>
              </div>
              <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Company Image Placeholder</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔬</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Innovation</h3>
                <p className="text-muted-foreground">
                  Continuously pushing the boundaries of laboratory technology and design.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Excellence</h3>
                <p className="text-muted-foreground">
                  Delivering the highest quality products and services to our clients.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Partnership</h3>
                <p className="text-muted-foreground">
                  Building lasting relationships with clients and suppliers worldwide.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary">Our Leadership Team</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gray-200 w-32 h-32 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold">Dr. Sarah Chen</h3>
                <p className="text-primary mb-2">Chief Executive Officer</p>
                <p className="text-sm text-muted-foreground">20+ years in laboratory design and management</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-200 w-32 h-32 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold">Michael Wong</h3>
                <p className="text-primary mb-2">Chief Technology Officer</p>
                <p className="text-sm text-muted-foreground">Expert in laboratory equipment and automation</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-200 w-32 h-32 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold">Dr. Raj Patel</h3>
                <p className="text-primary mb-2">Head of Design</p>
                <p className="text-sm text-muted-foreground">Specialist in laboratory space optimization</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
