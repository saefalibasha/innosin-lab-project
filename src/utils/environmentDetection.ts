
export const isLovableDevelopment = (): boolean => {
  // Check if we're in the Lovable development environment
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  
  // Production domains - add your actual production domain here
  const productionDomains = [
    'innosinlab.com',
    'www.innosinlab.com',
    // Add any other production domains you plan to use
  ];
  
  // If we're on a production domain, we're NOT in development
  if (productionDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`))) {
    console.log('Production domain detected:', hostname);
    return false;
  }
  
  // Lovable development environment indicators
  const isDev = (
    hostname.includes('lovableproject.com') ||
    hostname.includes('localhost') ||
    hostname === '127.0.0.1' ||
    hostname.includes('preview') ||
    hostname.includes('staging') ||
    process.env.NODE_ENV === 'development'
  );
  
  console.log('Environment detection:', {
    hostname,
    isDevelopment: isDev,
    nodeEnv: process.env.NODE_ENV
  });
  
  return isDev;
};

export const isProductionDeployment = (): boolean => {
  return !isLovableDevelopment();
};

export const getEnvironmentInfo = () => {
  if (typeof window === 'undefined') {
    return { environment: 'server', hostname: 'server' };
  }
  
  return {
    environment: isLovableDevelopment() ? 'development' : 'production',
    hostname: window.location.hostname,
    nodeEnv: process.env.NODE_ENV
  };
};
