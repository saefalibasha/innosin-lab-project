
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { WavyBackground } from '@/components/ui/wavy-background';
import { siteContent } from '@/data/siteContent';

const Footer = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* Simplified Wavy Background */}
      <WavyBackground
        colors={["hsl(200, 85%, 32%)", "hsl(200, 85%, 28%)", "hsl(200, 85%, 25%)", "hsl(200, 85%, 22%)"]}
        waveWidth={60}
        backgroundFill="hsl(200, 85%, 30%)"
        blur={2}
        speed="slow"
        waveOpacity={0.8}
        containerClassName="h-auto min-h-0"
        className="flex items-start w-full h-full"
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Company Info */}
            <div className="space-y-3 animate-fade-in">
              <h3 className="text-xl font-serif font-bold text-white mb-2">{siteContent.company.name}</h3>
              <p className="text-white/90 leading-relaxed font-light text-sm">
                {siteContent.footer.companyDescription}
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 group cursor-pointer">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white/90 group-hover:text-white transition-colors text-sm">{siteContent.company.location}</span>
                </div>
                <div className="flex items-center space-x-2 group cursor-pointer">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Phone className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white/90 group-hover:text-white transition-colors text-sm">{siteContent.company.phone}</span>
                </div>
                <div className="flex items-center space-x-2 group cursor-pointer">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Mail className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white/90 group-hover:text-white transition-colors text-sm">{siteContent.company.email}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3 animate-fade-in animate-delay-200">
              <h4 className="text-lg font-serif font-semibold text-white">{siteContent.footer.quickLinksTitle}</h4>
              <nav className="space-y-1">
                {[
                  { name: siteContent.navigation.home, path: '/' },
                  { name: siteContent.navigation.products, path: '/products' },
                  { name: siteContent.navigation.floorPlanner, path: '/floor-planner' },
                  { name: siteContent.navigation.about, path: '/about' },
                  { name: siteContent.navigation.blog, path: '/blog' },
                  { name: siteContent.navigation.contact, path: '/contact' }
                ].map((link, index) => (
                  <Link 
                    key={link.name}
                    to={link.path} 
                    className="block text-white/90 hover:text-white transition-all duration-300 hover:translate-x-1 group animate-fade-in text-sm"
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
              <h4 className="text-lg font-serif font-semibold text-white">{siteContent.footer.servicesTitle}</h4>
              <nav className="space-y-1">
                {siteContent.footer.services.map((service, index) => (
                  <div 
                    key={service}
                    className="text-white/90 hover:text-white transition-colors cursor-pointer group animate-fade-in text-sm"
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
              <h4 className="text-lg font-serif font-semibold text-white">{siteContent.footer.stayConnectedTitle}</h4>
              <p className="text-white/90 font-light leading-relaxed text-sm">
                {siteContent.footer.newsletterDescription}
              </p>
              <div className="space-y-3">
                <div className="flex flex-col space-y-2">
                  <Input
                    type="email"
                    placeholder={siteContent.footer.emailPlaceholder}
                    className="bg-white/20 border-white/40 text-white placeholder:text-white/70 focus:border-white/70 backdrop-blur-sm focus:bg-white/25 transition-all duration-300 text-sm h-10"
                  />
                  <Button className="bg-white text-sea hover:bg-white/90 transition-all duration-300 hover:scale-105 font-semibold text-sm h-10">
                    {siteContent.footer.subscribeButton}
                  </Button>
                </div>
                
                {/* Social Media Icons */}
                <div className="flex space-x-3 pt-2">
                  {[
                    { icon: Facebook, label: 'Facebook' },
                    { icon: Twitter, label: 'Twitter' },
                    { icon: Linkedin, label: 'LinkedIn' },
                    { icon: Instagram, label: 'Instagram' }
                  ].map(({ icon: Icon, label }, index) => (
                    <button
                      key={label}
                      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group animate-bounce-in backdrop-blur-sm border border-white/30 hover:border-white/50"
                      style={{animationDelay: `${600 + index * 100}ms`}}
                      aria-label={label}
                    >
                      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 mt-6 pt-4 animate-fade-in animate-delay-700">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <p className="text-white/90 font-light text-sm">
                {siteContent.footer.copyrightText}
              </p>
              <div className="flex space-x-6">
                <Link to="/privacy" className="text-white/90 hover:text-white transition-colors hover:underline text-sm">
                  {siteContent.footer.privacyPolicy}
                </Link>
                <Link to="/terms" className="text-white/90 hover:text-white transition-colors hover:underline text-sm">
                  {siteContent.footer.termsOfService}
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
