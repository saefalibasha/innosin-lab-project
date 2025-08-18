
import { useEffect } from 'react';

const SecurityHeader = () => {
  useEffect(() => {
    // Only apply strict CSP in production
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // Strict CSP for production
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' data: https: blob:;
        connect-src 'self' https://wfdbqfbodppniqzoxnyf.supabase.co wss://wfdbqfbodppniqzoxnyf.supabase.co https://api.hubspot.com;
        frame-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        upgrade-insecure-requests;
        block-all-mixed-content;
      `.replace(/\s+/g, ' ').trim();
      
      document.head.appendChild(meta);
      
      // Add additional security headers via meta tags
      const headers = [
        { name: 'X-Content-Type-Options', content: 'nosniff' },
        { name: 'X-Frame-Options', content: 'DENY' },
        { name: 'X-XSS-Protection', content: '1; mode=block' },
        { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
        { name: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=(), payment=()' }
      ];
      
      headers.forEach(header => {
        const metaTag = document.createElement('meta');
        metaTag.httpEquiv = header.name;
        metaTag.content = header.content;
        document.head.appendChild(metaTag);
      });
      
      return () => {
        // Cleanup function to remove meta tags
        const metaTags = document.querySelectorAll('meta[http-equiv]');
        metaTags.forEach(tag => {
          if (tag.getAttribute('http-equiv')?.includes('Content-Security-Policy') ||
              tag.getAttribute('http-equiv')?.includes('X-')) {
            document.head.removeChild(tag);
          }
        });
      };
    } else {
      // More lenient CSP for development
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: localhost:* 127.0.0.1:*;
        style-src 'self' 'unsafe-inline' https: http:;
        font-src 'self' 'unsafe-inline' https: http: data:;
        img-src 'self' data: https: http: blob:;
        connect-src 'self' https: http: ws: wss: localhost:* 127.0.0.1:*;
        frame-src 'self' https: http:;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
      `.replace(/\s+/g, ' ').trim();
      
      document.head.appendChild(meta);
      
      return () => {
        document.head.removeChild(meta);
      };
    }
  }, []);

  return null;
};

export default SecurityHeader;
