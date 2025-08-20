
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { siteContent } from '@/data/siteContent';

export const Footer = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const footerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Update Singapore time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const formatSingaporeTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Singapore',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const navigationLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Solutions', href: '/solutions' },
    { name: 'Floor Planner', href: '/floorplanner' },
    { name: 'RFQ Cart', href: '/rfq-cart' },
    { name: 'Blog', href: '/blog' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const officeLocations = [
    {
      city: 'Singapore',
      address: 'Innovation Drive, Research Hub',
      details: 'Singapore 138987'
    },
    {
      city: 'Johor Bahru',
      address: 'Industrial Complex, Tech Park',
      details: 'Johor Bahru, Malaysia 81100'
    },
    {
      city: 'Kuala Lumpur',
      address: 'Science Centre, Innovation District',
      details: 'Kuala Lumpur, Malaysia 50480'
    }
  ];

  return (
    <footer ref={footerRef} className="bg-slate-900 text-white relative overflow-hidden">
      {/* Large Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-[20vw] font-bold text-slate-800/5 select-none">
          INNOSIN
        </div>
      </div>

      <div className="relative z-10">
        {/* Top Section */}
        <div className={`container mx-auto px-6 pt-20 pb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Company Description */}
            <div className={`transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className="text-3xl font-bold mb-6 text-white">
                {siteContent.companyName}
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Leading provider of innovative laboratory solutions, empowering scientific advancement through cutting-edge equipment and expert consultation services across Southeast Asia.
              </p>
              <div className="flex items-center space-x-4">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-gray-300">info@innosinlab.com</span>
              </div>
              <div className="flex items-center space-x-4 mt-3">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-gray-300">+65 6123 4567</span>
              </div>
            </div>

            {/* Navigation */}
            <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h4 className="text-xl font-semibold mb-6 text-white">Navigation</h4>
              <div className="grid grid-cols-2 gap-3">
                {navigationLinks.map((link, index) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Connect & Contact */}
            <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h4 className="text-xl font-semibold mb-6 text-white">Connect</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Head Office</p>
                    <p className="text-gray-300 text-sm">Innovation Drive, Research Hub</p>
                    <p className="text-gray-300 text-sm">Singapore 138987</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Singapore Time</p>
                    <p className="text-gray-300 text-sm font-mono">
                      {formatSingaporeTime(currentTime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Office Locations Section */}
        <div className={`border-t border-gray-700 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-6 py-12">
            <h4 className="text-xl font-semibold mb-8 text-center text-white">Our Locations</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {officeLocations.map((location, index) => (
                <div 
                  key={location.city}
                  className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${500 + index * 100}ms` }}
                >
                  <h5 className="text-lg font-semibold text-white mb-2">{location.city}</h5>
                  <p className="text-gray-300 text-sm">{location.address}</p>
                  <p className="text-gray-300 text-sm">{location.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={`border-t border-gray-700 transition-all duration-700 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="text-gray-400 text-sm">
                © 2025 Innosin Lab Pte. Ltd. All rights reserved.
              </div>
              <div className="text-center">
                <div className="text-gray-300 font-mono text-lg">
                  {formatSingaporeTime(currentTime).split(',')[0]}
                </div>
                <div className="text-gray-400 text-sm">
                  {formatSingaporeTime(currentTime).split(',').slice(1).join(',').trim()}
                </div>
              </div>
              <div className="text-gray-400 text-sm text-center lg:text-right">
                Advancing Science Through Innovation
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
