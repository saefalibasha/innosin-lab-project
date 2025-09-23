import { lazy } from 'react';

// Route-based code splitting - load components only when routes are visited
export const LazyWelcomeLandingPage = lazy(() => import('../pages/WelcomeLandingPage'));
export const LazyIndex = lazy(() => import('../pages/Index'));
export const LazyAbout = lazy(() => import('../pages/About'));
export const LazyBlog = lazy(() => import('../pages/Blog'));
export const LazyBlogPost = lazy(() => import('../pages/BlogPost'));
export const LazyProductCatalog = lazy(() => import('../pages/ProductCatalog'));
export const LazyEnhancedProductDetail = lazy(() => import('../pages/EnhancedProductDetail'));
export const LazyFloorPlanner = lazy(() => import('../pages/FloorPlanner'));
export const LazyContact = lazy(() => import('../pages/Contact'));
export const LazyAuth = lazy(() => import('../pages/Auth'));
export const LazyRFQCart = lazy(() => import('../pages/RFQCart'));

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