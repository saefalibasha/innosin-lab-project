
export const isLovableDevelopment = (): boolean => {
  // Check if we're in the Lovable development environment
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  
  // Lovable development environment indicators
  return (
    hostname.includes('lovableproject.com') ||
    hostname.includes('localhost') ||
    hostname === '127.0.0.1' ||
    hostname.includes('preview') ||
    hostname.includes('staging') ||
    process.env.NODE_ENV === 'development'
  );
};

export const isProductionDeployment = (): boolean => {
  return !isLovableDevelopment();
};
