
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Company Info */}
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img 
                  src="/innosin-logo.png" 
                  alt="Innosin Lab" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white">Innosin Lab</h3>
            </div>
            <p className="text-white/90 leading-relaxed font-light">
              Leading provider of laboratory furniture, equipment, and design solutions in Singapore and beyond.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90 group-hover:text-white transition-colors">Singapore</span>
              </div>
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90 group-hover:text-white transition-colors">+65 1234 5678</span>
              </div>
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90 group-hover:text-white transition-colors">info@innosinlab.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 animate-fade-in animate-delay-200">
            <h4 className="text-xl font-serif font-semibold text-white">Quick Links</h4>
            <nav className="space-y-1">
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
                  className="block text-white/90 hover:text-white transition-all duration-300 hover:translate-x-1 group animate-fade-in"
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
          <div className="space-y-3 animate-fade-in animate-delay-300">
            <h4 className="text-xl font-serif font-semibold text-white">Services</h4>
            <nav className="space-y-1">
              {[
                'Laboratory Design',
                'Equipment Installation',
                'Safety Compliance',
                'Maintenance Support',
                'Custom Solutions'
              ].map((service, index) => (
                <div 
                  key={service}
                  className="text-white/90 hover:text-white transition-colors cursor-pointer group animate-fade-in"
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
          <div className="space-y-3 animate-fade-in animate-delay-500">
            <h4 className="text-xl font-serif font-semibold text-white">Stay Connected</h4>
            <p className="text-white/90 font-light leading-relaxed">
              Stay updated with our latest products and industry insights.
            </p>
            <div className="space-y-2">
              <div className="flex flex-col space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/20 border-white/40 text-white placeholder:text-white/70 focus:border-white/70 backdrop-blur-sm focus:bg-white/25 transition-all duration-300"
                />
                <Button className="bg-white text-slate-900 hover:bg-white/90 transition-all duration-300 hover:scale-105 font-semibold">
                  Subscribe
                </Button>
              </div>
              
              {/* Social Media Icons */}
              <div className="flex space-x-4 pt-1">
                {[
                  { icon: Facebook, label: 'Facebook' },
                  { icon: Twitter, label: 'Twitter' },
                  { icon: Linkedin, label: 'LinkedIn' },
                  { icon: Instagram, label: 'Instagram' }
                ].map(({ icon: Icon, label }, index) => (
                  <button
                    key={label}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group animate-bounce-in backdrop-blur-sm border border-white/30 hover:border-white/50"
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
        <div className="border-t border-white/20 mt-4 pt-4 animate-fade-in animate-delay-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/90 font-light">
              © 2024 Innosin Lab. All rights reserved.
            </p>
            <div className="flex space-x-8">
              <Link to="/privacy" className="text-white/90 hover:text-white transition-colors hover:underline">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-white/90 hover:text-white transition-colors hover:underline">
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
