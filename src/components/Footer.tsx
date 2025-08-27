import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, ExternalLink } from 'lucide-react';

const SEA_BLUE = '#108CCF'; // footer background color

export const Footer = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const footerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // tick clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // simple reveal on view
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 }
    );
    if (footerRef.current) io.observe(footerRef.current);
    return () => io.disconnect();
  }, []);

  const formatSingaporeTime = (date: Date) =>
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Singapore',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    }).format(date);

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
    <footer
      ref={footerRef}
      className="relative overflow-hidden text-white"
      style={{ backgroundColor: SEA_BLUE }}
    >
      {/* Top grid */}
      <div
        className={[
          'container mx-auto px-6 pt-12 pb-16',
          'transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        ].join(' ')}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 border border-white/25 rounded-md">
          {/* Company / About / Contact */}
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-white/25">
            <p className="text-white/95 text-lg leading-relaxed mb-8 tracking-wide">
              Innosin Lab is a leading provider of innovative laboratory solutions,
              empowering scientific advancement through cutting-edge equipment and
              expert consultation services across Southeast Asia.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-white/80" />
                <span className="text-white/90 text-base">info@innosinlab.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-white/80 mt-1" />
                <div className="text-white/90 text-base">
                  <div>Industrial Complex, Tech Park</div>
                  <div>Johor Bahru, Malaysia 81100</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-white/25">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/80 mb-6">
              Website
            </h4>
            <div className="space-y-4">
              {navigationLinks.map((link) => (
                <div key={link.name} className="flex items-center justify-between group">
                  <Link
                    to={link.href}
                    className="text-2xl lg:text-3xl font-extrabold tracking-tight"
                  >
                    {link.name}
                  </Link>
                  <span className="text-white/90 text-sm group-hover:opacity-100 opacity-70">
                    <ExternalLink className="w-4 h-4" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Social */}
          <div className="p-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/80 mb-6">
              Connect
            </h4>
            <div className="space-y-6">
              {[
                { label: 'LinkedIn', href: 'https://linkedin.com/company/innosin-lab-pte-ltd' },
                { label: 'Facebook', href: 'https://www.facebook.com/InnosinTecLab/' },
                { label: 'Instagram', href: 'https://www.instagram.com/innosin_techlab/?hl=en' },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between group">
                  <span className="text-2xl lg:text-3xl font-extrabold tracking-tight">
                    {s.label}
                  </span>
                  <ExternalLink className="w-4 h-4 text-white/90 group-hover:rotate-6 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className={[
          'transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        ].join(' ')}
      >
        <div className="container mx-auto px-6 py-3">
          <div className="grid grid-cols-1 lg:grid-cols-4 border border-white/25 rounded-md">
            {/* left */}
            <div className="px-4 py-6 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-white/25">
              <div className="text-sm text-white/80 uppercase tracking-wide text-center">
                ©2025 INNOSIN LAB PTE LTD
              </div>
            </div>

            {/* left-center */}
            <div className="px-4 py-6 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-white/25">
              <button className="text-sm text-white/80 hover:text-white/95 underline underline-offset-2 uppercase tracking-wide">
                Singapore Registered Company
              </button>
            </div>

            {/* center time */}
            <div className="px-4 py-6 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-white/25">
              <div className="text-sm text-white/80 uppercase tracking-wide text-center">
                {formatSingaporeTime(currentTime).toUpperCase()}
              </div>
            </div>

            {/* right slogan */}
            <div className="px-4 py-6 flex items-center justify-center lg:justify-end lg:pr-6">
              <div className="text-sm text-white/80 uppercase tracking-wide text-center lg:text-right whitespace-nowrap">
                Innovation in Laboratory Solutions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INNOSINLAB logo stretched with 3D shadow */}
      <div className="w-full flex items-center justify-center py-12 select-none">
        <h1
          className="font-black leading-none text-center w-full"
          style={{
            color: 'white',
            fontSize: '12vw',
            letterSpacing: '0.1em',
            textShadow:
              '3px 3px 0px rgba(0,0,0,0.25), 6px 6px 0px rgba(0,0,0,0.15), 9px 9px 0px rgba(0,0,0,0.1)',
          }}
        >
          INNOSINLAB
        </h1>
      </div>
    </footer>
  );
};

export default Footer;
