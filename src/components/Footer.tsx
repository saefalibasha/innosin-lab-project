
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { siteContent } from '@/data/siteContent';

export const Footer = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const footerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  console.log('Footer component rendered', { isVisible });

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
    const options = {
      timeZone: 'Asia/Singapore',
      weekday: 'long' as const,
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      second: '2-digit' as const,
      timeZoneName: 'short' as const,
    };
    return new Intl.DateTimeFormat('en-GB', options).format(date);
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
        <div className={`container mx-auto px-6 pt-12 pb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            {/* Company Description & Contact */}
            <div className={`transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <p
                className="text-white text-lg leading-relaxed mb-8 max-w-md"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
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
            <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h4 className="text-base font-bold mb-8 text-white uppercase tracking-wide">
                Navigation
              </h4>
              <div className="space-y-4">
                {navigationLinks.map((link) => (
                  <div key={link.name}>
                    <Link
                      to={link.href}
                      className="text-3xl lg:text-4xl font-bold text-white hover:text-white/80 transition-colors duration-200 block"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {link.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Connect & Social */}
            <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h4 className="text-base font-bold mb-8 text-white uppercase tracking-wide">
                Connect
              </h4>
              <div className="space-y-6">
                <div>
                  <a 
                    href="#" 
                    className="text-3xl lg:text-4xl font-bold text-white hover:text-white/80 transition-colors duration-200 flex items-center space-x-2"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <span>LinkedIn</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div>
                  <a 
                    href="#" 
                    className="text-3xl lg:text-4xl font-bold text-white hover:text-white/80 transition-colors duration-200 flex items-center space-x-2"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <span>Facebook</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div>
                  <a 
                    href="#" 
                    className="text-3xl lg:text-4xl font-bold text-white hover:text-white/80 transition-colors duration-200 flex items-center space-x-2"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <span>Instagram</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={`transition-all duration-700 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-6 py-2">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-0 items-baseline">
              
              {/* Left - Copyright */}
              <div className="text-center lg:text-left">
                <div 
                  className="text-sm text-white/60 uppercase leading-none"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  ©2025 INNOSIN LAB PTE LTD
                </div>
              </div>

              {/* Left-Center - Singapore Company */}
              <div className="text-center lg:text-left">
                <button 
                  className="text-sm text-white/60 hover:text-white/80 transition-colors duration-200 underline underline-offset-2 uppercase leading-none"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  SINGAPORE REGISTERED COMPANY
                </button>
              </div>

              {/* Center - Time */}
              <div className="text-center">
                <div 
                  className="text-sm text-white/60 uppercase leading-none"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {formatSingaporeTime(currentTime).toUpperCase()}
                </div>
              </div>

              {/* Right-Center - Empty for spacing */}
              <div></div>

              {/* Right - Company Slogan */}
              <div className="text-center lg:text-right">
                <div 
                  className="text-sm text-white/60 uppercase leading-none whitespace-nowrap"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  INNOVATION IN LABORATORY SOLUTIONS
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Large Stacked Logo at Very Bottom */}
      <div className="relative w-full overflow-hidden bg-sea">
        <div className="relative h-20 lg:h-24 flex items-end justify-center pb-2">
          
          {/* Three layers for pronounced stacking effect - contained within boundaries */}
          <div 
            className="relative text-[14vw] lg:text-[8vw] font-black text-white/90 select-none leading-none text-center w-full px-4"
            style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '0.1em' }}
          >
            INNOSINLAB
          </div>
          <div 
            className="absolute bottom-2 left-0 right-0 text-[14vw] lg:text-[8vw] font-black text-white/60 select-none leading-none text-center w-full px-4"
            style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '0.1em', transform: 'translate(3px, 3px)' }}
          >
            INNOSINLAB
          </div>
          <div 
            className="absolute bottom-2 left-0 right-0 text-[14vw] lg:text-[8vw] font-black text-white/30 select-none leading-none text-center w-full px-4"
            style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '0.1em', transform: 'translate(6px, 6px)' }}
          >
            INNOSINLAB
          </div>
        </div>
      </div>
    </footer>
  );
};
