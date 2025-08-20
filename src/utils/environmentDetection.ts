
export const isLovableDevelopment = (): boolean => {
  // Server-side detection (for crawlers like Google)
  if (typeof window === 'undefined') {
    console.log('🤖 Server-side request detected - allowing full site access');
    return true; // Allow full site access for crawlers
  }
  
  const hostname = window.location.hostname;
  
  // Allow full site access for all domains now that the site is ready
  const isDevelopment = (
    hostname.includes('lovableproject.com') ||
    hostname.includes('lovable.app') ||
    hostname.includes('localhost') ||
    hostname === '127.0.0.1' ||
    hostname.includes('192.168.') ||
    hostname.includes('10.0.') ||
    hostname.includes('172.') ||
    hostname.includes('innosinlab.com') || // Allow production domain
    true // Allow any other domain to access full site
  );
  
  if (isDevelopment) {
    console.log('✅ FULL SITE ACCESS GRANTED:', hostname);
    document.documentElement.setAttribute('data-environment', 'production');
  }
  
  console.log('🔍 Environment Detection Summary:', {
    hostname,
    isDevelopment,
    finalDecision: 'FULL_SITE',
    userAgent: navigator?.userAgent?.substring(0, 100)
  });
  
  return true; // Always return true to show full site
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
