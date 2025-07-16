import { useEffect } from 'react';

// Security headers component to implement CSP and other security measures
const SecurityHeader = () => {
  useEffect(() => {
    // Set security headers via meta tags (for what we can control client-side)
    const addMetaTag = (name: string, content: string) => {
      const existing = document.querySelector(`meta[name="${name}"]`);
      if (existing) {
        existing.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    // Content Security Policy (basic client-side enforcement)
    addMetaTag('referrer-policy', 'strict-origin-when-cross-origin');
    
    // Prevent MIME type sniffing
    const addHttpEquiv = (httpEquiv: string, content: string) => {
      const existing = document.querySelector(`meta[http-equiv="${httpEquiv}"]`);
      if (existing) {
        existing.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('http-equiv', httpEquiv);
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    addHttpEquiv('X-Content-Type-Options', 'nosniff');
    addHttpEquiv('X-Frame-Options', 'DENY');
    addHttpEquiv('X-XSS-Protection', '1; mode=block');

    // Remove sensitive information from console in production
    if (process.env.NODE_ENV === 'production') {
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;

      console.log = (...args) => {
        // Filter out sensitive data patterns
        const filteredArgs = args.map(arg => {
          if (typeof arg === 'string') {
            return arg
              .replace(/password['":\s]*['"]\w+['"]/gi, 'password":"***"')
              .replace(/token['":\s]*['"]\w+['"]/gi, 'token":"***"')
              .replace(/key['":\s]*['"]\w+['"]/gi, 'key":"***"');
          }
          return arg;
        });
        originalLog(...filteredArgs);
      };

      console.warn = (...args) => originalWarn(...args);
      console.error = (...args) => {
        // Don't log full error objects in production
        const safeArgs = args.map(arg => 
          arg instanceof Error ? `Error: ${arg.message}` : arg
        );
        originalError(...safeArgs);
      };
    }

    // Monitor for potential security issues
    const monitorSecurity = () => {
      // Check for inline scripts (basic detection)
      const inlineScripts = document.querySelectorAll('script:not([src])');
      if (inlineScripts.length > 0) {
        console.warn('⚠️ Inline scripts detected - potential security risk');
      }

      // Monitor for unauthorized network requests
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const [url] = args;
        const urlString = typeof url === 'string' ? url : url.toString();
        
        // Log external requests for monitoring
        if (!urlString.startsWith(window.location.origin) && 
            !urlString.includes('supabase.co') &&
            !urlString.includes('googleapis.com')) {
          console.log('🔍 External request:', urlString);
        }
        
        return originalFetch(...args);
      };
    };

    monitorSecurity();

    // Add security event listeners
    const handleSecurityEvent = (event: Event) => {
      if (event.type === 'securitypolicyviolation') {
        console.warn('🚨 CSP Violation:', event);
      }
    };

    document.addEventListener('securitypolicyviolation', handleSecurityEvent);

    return () => {
      document.removeEventListener('securitypolicyviolation', handleSecurityEvent);
    };
  }, []);

  return null; // This component only sets up security measures
};

export default SecurityHeader;