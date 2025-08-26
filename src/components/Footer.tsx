import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, ExternalLink } from 'lucide-react';

const SEA_BLUE = '#108CCF'; // your footer color

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
      {/* top grid with thin separators */}
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

            {/* dotted rows */}
            <div className="mt-6 space-y-3">
              {navigationLinks.slice(0, 3).map((l) => (
                <div
                  key={`dot-${l.name}`}
                  className="border-t-2 border-dotted border-white/30"
                />
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
                { label: 'LinkedIn', href: '#' },
                { label: 'Facebook', href: '#' },
                { label: 'Instagram', href: '#' },
              ].map((s) => (
                <a key={s.label} href={s.href} className="flex items-center justify-between group">
                  <span className="text-2xl lg:text-3xl font-extrabold tracking-tight">
                    {s.label}
                  </span>
                  <ExternalLink className="w-4 h-4 text-white/90 group-hover:rotate-6 transition-transform" />
                </a>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={`soc-${i}`} className="border-t-2 border-dotted border-white/30" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* bottom bar – improved fit in boxes */}
      <div
        className={[
          'transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        ].join(' ')}
      >
        <div className="container mx-auto px-6 py-3">
          {/* 4 equal columns on large screens; consistent padding; safe text sizing */}
          <div className="grid grid-cols-1 lg:grid-cols-4 border border-white/25 rounded-md">
            {/* left */}
            <div className="px-4 py-3 border-b lg:border-b-0 lg:border-r border-white/25 flex items-center justify-center lg:justify-start">
              <div className="text-[12px] md:text-sm text-white/80 uppercase tracking-wide">
                ©2025 INNOSIN LAB PTE LTD
              </div>
            </div>

            {/* left-center */}
            <div className="px-4 py-3 border-b lg:border-b-0 lg:border-r border-white/25 flex items-center justify-center lg:justify-start">
              <button className="text-[12px] md:text-sm text-white/80 hover:text-white/95 underline underline-offset-2 uppercase tracking-wide">
                Singapore Registered Company
              </button>
            </div>

            {/* center time */}
            <div className="px-4 py-3 border-b lg:border-b-0 lg:border-r border-white/25 flex items-center justify-center">
              <div className="text-[12px] md:text-sm text-white/80 uppercase tracking-wide text-center">
                {formatSingaporeTime(currentTime).toUpperCase()}
              </div>
            </div>

            {/* right slogan – no clipping; wraps on small, single line on lg */}
            <div className="px-4 py-3 flex items-center justify-center lg:justify-end lg:pr-6">
              <div className="text-[12px] md:text-sm text-white/80 uppercase tracking-wide text-center lg:text-right sm:whitespace-normal lg:whitespace-nowrap">
                Innovation in Laboratory Solutions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* large wordmark – bigger, white, centered */}
      <div className="w-full flex items-center justify-center py-8 select-none">
        <h1 className="text-white font-black leading-none tracking-[0.08em] text-[14vw] md:text-[10vw] lg:text-[7vw] drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
          INNOSINLAB
        </h1>
      </div>
    </footer>
  );
};

export default Footer;
