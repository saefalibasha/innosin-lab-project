
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { WavyBackground } from '@/components/ui/wavy-background';

const Footer = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* Enhanced Wavy Background with Sea Colors */}
      <WavyBackground
        colors={["hsl(200, 85%, 45%)", "hsl(200, 85%, 40%)", "hsl(200, 85%, 50%)", "hsl(200, 85%, 35%)", "hsl(200, 85%, 55%)", "hsl(200, 85%, 60%)"]}
        waveWidth={70}
        backgroundFill="hsl(200, 85%, 45%)"
        blur={5}
        speed="slow"
        waveOpacity={0.9}
        containerClassName="h-auto min-h-0"
        className="flex items-start w-full h-full"
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {/* Company Info - Logo Removed */}
            <div className="space-y-1 animate-fade-in">
              <h3 className="text-lg font-serif font-bold text-white mb-1">Innosin Lab</h3>
              <p className="text-white/90 leading-relaxed font-light text-xs">
                Leading provider of laboratory furniture, equipment, and design solutions in Singapore and beyond.
              </p>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1 group cursor-pointer">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <MapPin className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-white/90 group-hover:text-white transition-colors text-xs">Singapore</span>
                </div>
                <div className="flex items-center space-x-1 group cursor-pointer">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Phone className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-white/90 group-hover:text-white transition-colors text-xs">+65 1234 5678</span>
                </div>
                <div className="flex items-center space-x-1 group cursor-pointer">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Mail className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-white/90 group-hover:text-white transition-colors text-xs">info@innosinlab.com</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-1 animate-fade-in animate-delay-200">
              <h4 className="text-base font-serif font-semibold text-white">Quick Links</h4>
              <nav className="space-y-0">
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
                    className="block text-white/90 hover:text-white transition-all duration-300 hover:translate-x-1 group animate-fade-in text-xs"
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
            <div className="space-y-1 animate-fade-in animate-delay-300">
              <h4 className="text-base font-serif font-semibold text-white">Services</h4>
              <nav className="space-y-0">
                {[
                  'Laboratory Design',
                  'Equipment Installation',
                  'Safety Compliance',
                  'Maintenance Support',
                  'Custom Solutions'
                ].map((service, index) => (
                  <div 
                    key={service}
                    className="text-white/90 hover:text-white transition-colors cursor-pointer group animate-fade-in text-xs"
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
            <div className="space-y-1 animate-fade-in animate-delay-500">
              <h4 className="text-base font-serif font-semibold text-white">Stay Connected</h4>
              <p className="text-white/90 font-light leading-relaxed text-xs">
                Stay updated with our latest products and industry insights.
              </p>
              <div className="space-y-1">
                <div className="flex flex-col space-y-1">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-white/20 border-white/40 text-white placeholder:text-white/70 focus:border-white/70 backdrop-blur-sm focus:bg-white/25 transition-all duration-300 text-xs h-8"
                  />
                  <Button className="bg-white text-sea hover:bg-white/90 transition-all duration-300 hover:scale-105 font-semibold text-xs h-8">
                    Subscribe
                  </Button>
                </div>
                
                {/* Social Media Icons */}
                <div className="flex space-x-2 pt-0.5">
                  {[
                    { icon: Facebook, label: 'Facebook' },
                    { icon: Twitter, label: 'Twitter' },
                    { icon: Linkedin, label: 'LinkedIn' },
                    { icon: Instagram, label: 'Instagram' }
                  ].map(({ icon: Icon, label }, index) => (
                    <button
                      key={label}
                      className="w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group animate-bounce-in backdrop-blur-sm border border-white/30 hover:border-white/50"
                      style={{animationDelay: `${600 + index * 100}ms`}}
                      aria-label={label}
                    >
                      <Icon className="w-3 h-3 group-hover:scale-110 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 mt-1 pt-1 animate-fade-in animate-delay-700">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-1 md:space-y-0">
              <p className="text-white/90 font-light text-xs">
                © 2024 Innosin Lab. All rights reserved.
              </p>
              <div className="flex space-x-4">
                <Link to="/privacy" className="text-white/90 hover:text-white transition-colors hover:underline text-xs">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-white/90 hover:text-white transition-colors hover:underline text-xs">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </WavyBackground>
    </footer>
  );
};

export default Footer;
