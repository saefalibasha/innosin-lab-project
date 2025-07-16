
export const isLovableDevelopment = (): boolean => {
  // Production domains - these should ALWAYS show maintenance page
  const productionDomains = [
    'innosinlab.com',
    'www.innosinlab.com',
  ];
  
  // Check if we're in a server-side environment (for SEO crawlers)
  if (typeof window === 'undefined') {
    // For crawlers and server-side, always show maintenance for production domains
    // Check if we're on a production domain via environment or referrer
    const isProductionDomain = process.env.NODE_ENV === 'production' || 
                              (typeof process !== 'undefined' && process.env.DOMAIN && 
                               productionDomains.some(domain => process.env.DOMAIN?.includes(domain)));
    if (isProductionDomain) {
      console.log('🚨 Server-side production detected - showing maintenance page');
      return false;
    }
    return process.env.NODE_ENV === 'development';
  }
  
  const hostname = window.location.hostname;
  
  // CRITICAL: If we're on a production domain, we are NEVER in development
  // This ensures Google and other crawlers see the maintenance page
  if (productionDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`))) {
    console.log('🚨 Production domain detected - showing maintenance page:', hostname);
    // Force maintenance mode for production domains
    document.documentElement.setAttribute('data-maintenance-mode', 'true');
    return false;
  }
  
  // Only allow development on Lovable development domains
  const isDev = (
    hostname.includes('lovableproject.com') ||
    hostname.includes('localhost') ||
    hostname === '127.0.0.1'
  );
  
  console.log('Environment detection:', {
    hostname,
    isDevelopment: isDev,
    nodeEnv: process.env.NODE_ENV,
    isProductionDomain: productionDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`)),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
  });
  
  return isDev;
};

export const isProductionDeployment = (): boolean => {
  return !isLovableDevelopment();
};

export const getEnvironmentInfo = () => {
  if (typeof window === 'undefined') {
    return { 
      environment: 'production', // Default to production for server-side (crawlers)
      hostname: 'server',
      nodeEnv: process.env.NODE_ENV 
    };
  }
  
  return {
    environment: isLovableDevelopment() ? 'development' : 'production',
    hostname: window.location.hostname,
    nodeEnv: process.env.NODE_ENV
  };
};
