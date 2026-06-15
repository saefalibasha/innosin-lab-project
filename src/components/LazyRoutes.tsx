import { lazy, ComponentType } from 'react';

// Utility for lazy loading with retry logic
const lazyWithRetry = <T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  componentName: string,
  retries = 3,
  retryDelay = 1000
) => {
  return lazy(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`[LazyLoad] Loading ${componentName} (attempt ${i + 1}/${retries})`);
        const module = await componentImport();
        console.log(`[LazyLoad] Successfully loaded ${componentName}`);
        return module;
      } catch (error) {
        console.warn(`[LazyLoad] Failed to load ${componentName} (attempt ${i + 1}/${retries}):`, error);
        
        if (i === retries - 1) {
          console.error(`[LazyLoad] All retry attempts failed for ${componentName}`);
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, i)));
      }
    }
    throw new Error(`Failed to load ${componentName} after ${retries} attempts`);
  });
};

// Eagerly load critical landing routes to avoid chunk issues
export { default as LazyWelcomeLandingPage } from '../pages/WelcomeLandingPage';
export { default as LazyIndex } from '../pages/Index';
export { default as LazyAbout } from '../pages/About';
export { default as LazyBlog } from '../pages/Blog';
export const LazyBlogPost = lazy(() => import('../pages/BlogPost'));
export { default as LazyProductCatalog } from '../pages/ProductCatalog';
export const LazyEnhancedProductDetail = lazy(() => import('../pages/EnhancedProductDetail'));

// Floor Planner with retry logic for reliability
export const LazyFloorPlanner = lazyWithRetry(
  () => import('../pages/FloorPlanner'),
  'FloorPlanner'
);
export const LazyContact = lazy(() => import('../pages/Contact'));
export const LazyAuth = lazy(() => import('../pages/Auth'));
export const LazyRFQCart = lazy(() => import('../pages/RFQCart'));

// SEO landing pages (Singapore)
export const LazyLabFurnitureSG = lazy(() => import('../pages/seo/LabFurnitureSingapore'));
export const LazyFumeHoodsSG = lazy(() => import('../pages/seo/FumeHoodsSingapore'));
export const LazySupplierSG = lazy(() => import('../pages/seo/LaboratoryFurnitureSupplierSingapore'));

// Admin routes - separate chunk for admin functionality
export const LazyAdminAuth = lazy(() => import('../pages/admin/AdminAuth'));
export const LazyDashboard = lazy(() => import('../pages/admin/Dashboard'));
export const LazyAdminProductViewer = lazy(() => import('../pages/AdminProductViewer'));
export const LazyTestHubSpotIntegration = lazy(() => import('../pages/TestHubSpotIntegration'));
export const LazyHubSpotMonitor = lazy(() => import('../pages/admin/HubSpotMonitor'));

// Chat functionality - separate chunk as it's feature-heavy
export const LazyChatHistory = lazy(() => import('../components/ChatHistory'));
export const LazyChatAdminDashboard = lazy(() => import('../components/ChatAdminDashboard'));

// 3D and complex visualization components
export const LazyEnhanced3DViewer = lazy(() => import('../components/Enhanced3DViewer'));
export const LazyBeforeAfterComparison = lazy(() => import('../components/BeforeAfterComparison'));
export const LazyProcessInfographic = lazy(() => import('../components/ProcessInfographic'));

// PDF and document processing - heavy functionality
export const LazyPDFProcessingStatus = lazy(() => import('../components/PDFProcessingStatus'));
export const LazyKnowledgeBaseManager = lazy(() => import('../components/KnowledgeBaseManager'));

// Analytics and admin tools
export const LazySecurityDashboard = lazy(() => import('../components/SecurityDashboard'));
export const LazyAnalyticsDashboard = lazy(() => import('../components/admin/enhanced/AnalyticsDashboard'));