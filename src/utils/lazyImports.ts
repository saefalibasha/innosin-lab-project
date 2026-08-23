// Centralized lazy import utilities for consistent code splitting

// Utility for dynamic library imports
export const loadLibrary = {
  // Load Three.js only when 3D components are needed
  three: () => import('three'),
  
  // Load React Query only when data fetching is needed
  reactQuery: () => import('@tanstack/react-query'),
  
  // Load Framer Motion only when animations are needed
  framerMotion: () => import('framer-motion'),
  
  // Load PDF generation only when needed
  jsPDF: () => import('jspdf'),
  
  // Load form validation only when forms are used
  zod: () => import('zod'),
  
  // Load date utilities only when needed
  dateFns: () => import('date-fns'),
  
  // Load React Hook Form only when complex forms are used
  reactHookForm: () => import('react-hook-form'),
  
  // Load Recharts only when charts are needed
  recharts: () => import('recharts'),
};

// Preload critical chunks based on user interaction
export const preloadChunk = (chunkName: keyof typeof loadLibrary) => {
  return loadLibrary[chunkName]();
};

// Preload routes when user hovers over navigation
export const preloadRoute = (routeName: string) => {
  switch (routeName) {
    case 'products':
      return import('../pages/ProductCatalog');
    case 'contact':
      return import('../pages/Contact');
    case 'about':
      return import('../pages/About');
    case 'admin':
      return import('../pages/admin/Dashboard');
    case 'blog':
      return import('../pages/Blog');
    case 'floor-planner':
      return import('../pages/FloorPlanner');
    default:
      return Promise.resolve();
  }
};