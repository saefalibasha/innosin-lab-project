
import React from 'react';
import Navigation from '@/components/Navigation';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import ProductPreview from '@/components/ProductPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Shield, Award, Users, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const services = [
    {
      icon: <Wrench className="w-8 h-8" />,
      title: 'Custom Fabrication',
      description: 'Tailored laboratory furniture and equipment designed to your exact specifications.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Safe Installation',
      description: 'Professional installation ensuring compliance with safety standards and regulations.'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Quality Assurance',
      description: 'ISO certified processes and materials for reliable, long-lasting laboratory solutions.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Expert Consultation',
      description: 'Professional guidance from design to implementation for optimal lab environments.'
    }
  ];

  const productCategories = [
    {
      name: 'Fume Hoods',
      image: '/placeholder.svg',
      description: 'Advanced ventilation systems for chemical safety'
    },
    {
      name: 'Lab Benches',
      image: '/placeholder.svg',
      description: 'Durable work surfaces for various laboratory applications'
    },
    {
      name: 'Safety Equipment',
      image: '/placeholder.svg',
      description: 'Eye washes, safety showers, and emergency systems'
    },
    {
      name: 'Storage Solutions',
      image: '/placeholder.svg',
      description: 'Specialized cabinets and storage for lab materials'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
              Build Your Lab
              <span className="block">Today</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Innosin Lab Pte. Ltd. specializes in the fabrication, customization, and installation 
              of laboratory equipment and furniture for research institutes, universities, and commercial labs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg">
                  Browse Products <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/floor-planner">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-black text-black hover:bg-black hover:text-white">
                  Plan Your Lab
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Before & After Slider */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Lab Transformations
            </h2>
            <p className="text-xl text-gray-600">
              See how we transform laboratory spaces with precision and safety
            </p>
          </div>
          <BeforeAfterSlider />
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive laboratory solutions from design to installation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4 text-black">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-3">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Product Categories
            </h2>
            <p className="text-xl text-gray-600">
              Explore our comprehensive range of laboratory equipment
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {productCategories.map((category, index) => (
              <ProductPreview key={index} {...category} />
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/products">
              <Button size="lg" variant="outline" className="border-black text-black hover:bg-black hover:text-white px-8 py-3">
                View All Products <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Us Snippet */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Why Choose Innosin Lab?
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            With years of experience in laboratory design and implementation, we serve research institutes, 
            universities, commercial labs, hospitals, and specialized industrial facilities across Singapore. 
            Our commitment to functionality, safety, and precision craftsmanship ensures your laboratory 
            environment meets the highest standards.
          </p>
          <Link to="/about">
            <Button variant="outline" size="lg" className="border-black text-black hover:bg-black hover:text-white">
              Learn More About Us
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Laboratory?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Get started with our interactive floor planner or request a custom quotation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/floor-planner">
              <Button size="lg" variant="secondary" className="px-8 py-3">
                Start Planning
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-3">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-black font-bold text-sm">IL</span>
                </div>
                <span className="font-bold text-xl">Innosin Lab</span>
              </div>
              <p className="text-gray-400">
                Professional laboratory solutions for research and industry.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/products" className="hover:text-white">Products</Link></li>
                <li><Link to="/floor-planner" className="hover:text-white">Floor Planner</Link></li>
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Custom Fabrication</li>
                <li>Installation</li>
                <li>Consultation</li>
                <li>Maintenance</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400">
                <p>Singapore</p>
                <p>info@innosinlab.com</p>
                <p>+65 XXXX XXXX</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Innosin Lab Pte. Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
