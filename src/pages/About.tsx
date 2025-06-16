
import React from 'react';
import Navigation from '@/components/Navigation';
import { Award, Users, Lightbulb, Heart } from 'lucide-react';

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
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About 3D Showcase
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            We're passionate about bringing products to life through cutting-edge 3D technology. 
            Our mission is to revolutionize how people experience and interact with products online.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
            <div className="text-gray-600 space-y-6">
              <p>
                Founded in 2020, 3D Showcase emerged from a simple idea: what if customers could truly 
                experience products before purchasing them? Our founders, frustrated by the limitations 
                of traditional product photography, set out to create something revolutionary.
              </p>
              <p>
                Starting in a small garage, our team of designers and developers worked tirelessly to 
                perfect the art of 3D product visualization. We believed that every customer deserved 
                to see, rotate, and explore products in detail, just as they would in a physical store.
              </p>
              <p>
                Today, we're proud to serve thousands of customers worldwide, helping them make confident 
                purchasing decisions through our immersive 3D experiences. Our commitment to innovation 
                and quality continues to drive us forward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4 text-blue-600">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">The talented people behind 3D Showcase</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Experience the Difference?
          </h2>
          <p className="text-xl text-blue-100">
            Discover how our 3D technology can transform your product experience.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
