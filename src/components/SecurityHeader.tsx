
import { useEffect, useState } from 'react';

const SecurityHeader = () => {
  const [nonce] = useState(() => {
    // Generate a cryptographically secure nonce
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  });

  useEffect(() => {
    // Apply CSP with nonce-based security
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // Production: Strict CSP with nonce
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net https://unpkg.com;
        style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com;
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
      
      
      // Add additional security headers
      const headers = [
        ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains'],
        ['X-Frame-Options', 'DENY'],
        ['X-Content-Type-Options', 'nosniff'],
        ['Referrer-Policy', 'strict-origin-when-cross-origin'],
        ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()']
      ];

      headers.forEach(([name, value]) => {
        const headerMeta = document.createElement('meta');
        headerMeta.httpEquiv = name;
        headerMeta.content = value;
        document.head.appendChild(headerMeta);
      });
      
      document.head.appendChild(meta);
      
      return () => {
        try {
          document.head.removeChild(meta);
          // Cleanup additional headers
          headers.forEach(([name]) => {
            const headerMeta = document.querySelector(`meta[http-equiv="${name}"]`);
            if (headerMeta) document.head.removeChild(headerMeta);
          });
        } catch (e) {
          // Ignore cleanup errors
        }
      };
    } else {
      // Development: More lenient but still secure
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
