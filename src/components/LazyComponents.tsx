import { lazy, Suspense, ComponentType } from 'react';

// Simplified lazy wrapper - fix type issues
export const withLazyLoading = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFn);
  
  return (props: any) => (
    <Suspense fallback={fallback || <div className="animate-pulse bg-muted h-32 rounded-lg" />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Heavy components with loading states
export const LazyVideoHero = withLazyLoading(
  () => import('../components/VideoHero'),
  <div className="h-screen bg-gradient-to-br from-blue-900 to-blue-700 animate-pulse" />
);

export const LazyCompanyTimeline = withLazyLoading(
  () => import('../components/CompanyTimeline'),
  <div className="h-96 bg-muted animate-pulse rounded-lg" />
);

export const LazyCertificationBadges = withLazyLoading(
  () => import('../components/CertificationBadges'),
  <div className="h-64 bg-muted animate-pulse rounded-lg" />
);

export const LazyNewsletterSubscription = withLazyLoading(
  () => import('../components/NewsletterSubscription'),
  <div className="h-48 bg-muted animate-pulse rounded-lg" />
);

export const LazyLabTransformCTA = withLazyLoading(
  () => import('../components/LabTransformCTA'),
  <div className="h-64 bg-muted animate-pulse rounded-lg" />
);

// Map component with loading
export const LazyMap = withLazyLoading(
  () => import('../components/Map/GoogleMap'),
  <div className="h-96 bg-muted animate-pulse rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  </div>
);

// Admin components with loading
export const LazyAdminRoleManager = withLazyLoading(
  () => import('../components/AdminRoleManager'),
  <div className="h-96 bg-muted animate-pulse rounded-lg" />
);

export const LazyChatbotTraining = withLazyLoading(
  () => import('../components/ChatbotTraining'),
  <div className="h-96 bg-muted animate-pulse rounded-lg" />
);

// Contact-related components  
export const LazyContactGateModal = withLazyLoading(
  () => import('../components/ContactGateModal').then(module => ({ default: module.ContactGateModal })),
  <div className="h-64 bg-muted animate-pulse rounded-lg" />
);