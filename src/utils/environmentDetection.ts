
export const isLovableDevelopment = (): boolean => {
  // PRODUCTION DOMAINS - These will ALWAYS show maintenance page to public
  const productionDomains = [
    'innosinlab.com',
    'www.innosinlab.com',
  ];
  
  // Server-side detection (for crawlers like Google)
  if (typeof window === 'undefined') {
    console.log('🤖 Server-side request detected - forcing maintenance for crawlers');
    return false; // Always show maintenance to crawlers
  }
  
  const hostname = window.location.hostname;
  
  // ABSOLUTE RULE: Production domains = maintenance page only
  const isProductionDomain = productionDomains.some(domain => 
    hostname === domain || hostname.endsWith(`.${domain}`)
  );
  
  if (isProductionDomain) {
    console.log('🚨 PRODUCTION DOMAIN DETECTED - MAINTENANCE MODE ENFORCED:', hostname);
    document.documentElement.setAttribute('data-maintenance-mode', 'true');
    document.documentElement.setAttribute('data-environment', 'production');
    return false;
  }
  
  // Development access - only on Lovable domains and localhost
  const isDevelopment = (
    hostname.includes('lovableproject.com') ||
    hostname.includes('lovable.app') ||
    hostname.includes('localhost') ||
    hostname === '127.0.0.1' ||
    hostname.includes('192.168.') ||
    hostname.includes('10.0.') ||
    hostname.includes('172.')
  );
  
  if (isDevelopment) {
    console.log('✅ DEVELOPMENT ACCESS GRANTED:', hostname);
    document.documentElement.setAttribute('data-environment', 'development');
  } else {
    console.log('⚠️ UNKNOWN DOMAIN - DEFAULTING TO MAINTENANCE:', hostname);
  }
  
  console.log('🔍 Environment Detection Summary:', {
    hostname,
    isDevelopment,
    isProductionDomain,
    finalDecision: isDevelopment ? 'FULL_SITE' : 'MAINTENANCE_ONLY',
    userAgent: navigator?.userAgent?.substring(0, 100)
  });
  
  return isDevelopment;
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
