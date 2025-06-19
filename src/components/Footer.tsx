
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-sea-dark to-primary text-white relative overflow-hidden">
      {/* Decorative wave pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,0 C30,20 70,0 100,20 L100,100 L0,100 Z" fill="currentColor" />
        </svg>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">IL</span>
              </div>
              <h3 className="text-2xl font-serif font-bold">Innosin Lab</h3>
            </div>
            <p className="text-blue-100 leading-relaxed font-light">
              Leading provider of laboratory furniture, equipment, and design solutions in Singapore and beyond.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-blue-100 group-hover:text-white transition-colors">Singapore</span>
              </div>
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-blue-100 group-hover:text-white transition-colors">+65 1234 5678</span>
              </div>
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-blue-100 group-hover:text-white transition-colors">info@innosinlab.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6 animate-fade-in animate-delay-200">
            <h4 className="text-xl font-serif font-semibold">Quick Links</h4>
            <nav className="space-y-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'Products', path: '/products' },
                { name: 'Floor Planner', path: '/floor-planner' },
                { name: 'About Us', path: '/about' },
                { name: 'Blog', path: '/blog' },
                { name: 'Contact', path: '/contact' }
              ].map((link, index) => (
                <Link 
                  key={link.name}
                  to={link.path} 
                  className="block text-blue-100 hover:text-white transition-all duration-300 hover:translate-x-1 group animate-fade-in"
                  style={{animationDelay: `${300 + index * 50}ms`}}
                >
                  <span className="border-b border-transparent group-hover:border-white/50 transition-colors">
                    {link.name}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-6 animate-fade-in animate-delay-300">
            <h4 className="text-xl font-serif font-semibold">Services</h4>
            <nav className="space-y-3">
              {[
                'Laboratory Design',
                'Equipment Installation',
                'Safety Compliance',
                'Maintenance Support',
                'Custom Solutions'
              ].map((service, index) => (
                <div 
                  key={service}
                  className="text-blue-100 hover:text-white transition-colors cursor-pointer group animate-fade-in"
                  style={{animationDelay: `${400 + index * 50}ms`}}
                >
                  <span className="border-b border-transparent group-hover:border-white/50 transition-colors">
                    {service}
                  </span>
                </div>
              ))}
            </nav>
          </div>

          {/* Newsletter & Social */}
          <div className="space-y-6 animate-fade-in animate-delay-500">
            <h4 className="text-xl font-serif font-semibold">Stay Connected</h4>
            <p className="text-blue-100 font-light leading-relaxed">
              Stay updated with our latest products and industry insights.
            </p>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/20 text-white placeholder-blue-200 focus:border-white/40 backdrop-blur-sm"
                />
                <Button className="bg-white text-sea hover:bg-white/90 hover:scale-105 transition-all duration-300 font-semibold px-6">
                  Subscribe
                </Button>
              </div>
              
              {/* Social Media Icons */}
              <div className="flex space-x-4 pt-4">
                {[
                  { icon: Facebook, label: 'Facebook' },
                  { icon: Twitter, label: 'Twitter' },
                  { icon: Linkedin, label: 'LinkedIn' },
                  { icon: Instagram, label: 'Instagram' }
                ].map(({ icon: Icon, label }, index) => (
                  <button
                    key={label}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group animate-bounce-in"
                    style={{animationDelay: `${600 + index * 100}ms`}}
                    aria-label={label}
                  >
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8 animate-fade-in animate-delay-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-blue-200 font-light">
              © 2024 Innosin Lab. All rights reserved.
            </p>
            <div className="flex space-x-8">
              <Link to="/privacy" className="text-blue-200 hover:text-white transition-colors hover:underline">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-blue-200 hover:text-white transition-colors hover:underline">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
