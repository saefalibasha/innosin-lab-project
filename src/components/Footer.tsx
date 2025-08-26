import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, ExternalLink } from 'lucide-react';

export const Footer = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const footerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  const formatSingaporeTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Singapore',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  };

  const navigationLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Solutions', href: '/solutions' },
    { name: 'Floor Planner', href: '/floorplanner' },
    { name: 'Blog', href: '/blog' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <footer ref={footerRef} className="bg-sea text-white relative overflow-hidden">
      <div className="relative z-10">
        {/* Main Content */}
        <div
          className={`container mx-auto px-6 pt-12 pb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Company Description & Contact */}
            <div
              className={`transition-all duration-700 delay-100 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <p className="text-white text-lg leading-relaxed mb-8 max-w-md">
                Innosin Lab is a leading provider of innovative laboratory solutions, 
                empowering scientific advancement through cutting-edge equipment and 
                expert consultation services across Southeast Asia.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-white/70" />
                  <span className="text-lg text-white/90">info@innosinlab.com</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-white/70 mt-0.5" />
                  <div className="text-lg text-white/90">
                    <div>Industrial Complex, Tech Park</div>
                    <div>Johor Bahru, Malaysia 81100</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div
              className={`transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <h4 className="text-base font-bold mb-8 text-white uppercase tracking-wide">
                Navigation
              </h4>
              <div className="space-y-4">
                {navigationLinks.map((link) => (
                  <div key={link.name}>
                    <Link
                      to={link.href}
                      className="text-3xl lg:text-4xl font-bold text-white hover:text-white/80 transition-colors duration-200 block"
                    >
                      {link.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Connect & Social */}
            <div
              className={`transition-all duration-700 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <h4 className="text-base font-bold mb-8 text-white uppercase tracking-wide">
                Connect
              </h4>
              <div className="space-y-6">
                {['LinkedIn', 'Facebook', 'Instagram'].map((platform) => (
                  <a
                    key={platform}
                    href="#"
                    className="text-3xl lg:text-4xl font-bold text-white hover:text-white/80 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span>{platform}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          className={`transition-all duration-700 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="container mx-auto px-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-0 items-center">
              <div className="text-center lg:text-left text-sm text-white/60 uppercase">
                ©2025 INNOSIN LAB PTE LTD
              </div>
              <div className="text-center text-sm text-white/60 uppercase underline underline-offset-2">
                SINGAPORE REGISTERED COMPANY
              </div>
              <div className="text-center text-sm text-white/60 uppercase">
                {formatSingaporeTime(currentTime).toUpperCase()}
              </div>
              <div className="text-center lg:text-right text-sm text-white/60 uppercase whitespace-nowrap">
                INNOVATION IN LABORATORY SOLUTIONS
              </div>
            </div>
          </div>
        </div>

        {/* Large Logo at the Very Bottom */}
        <div className="relative w-full bg-sea py-6 flex items-center justify-center">
          <h1
            className="text-white text-[10vw] lg:text-[6vw] font-extrabold tracking-widest opacity-90"
          >
            INNOSINLAB
          </h1>
        </div>
      </div>
    </footer>
  );
};
