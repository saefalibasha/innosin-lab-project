// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { Suspense } from "react";
import * as React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { RFQProvider } from "@/contexts/RFQContext";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";

// Layout
import SiteLayout from "@/components/SiteLayout";

// Lazy-loaded pages for code splitting
import {
  LazyWelcomeLandingPage,
  LazyIndex,
  LazyAuth,
  LazyAbout,
  LazyBlog,
  LazyBlogPost,
  LazyProductCatalog,
  LazyEnhancedProductDetail,
  LazyFloorPlanner,
  LazyContact,
  LazyRFQCart,
  LazyQuoteReceived,
  LazyLabFurnitureSG,
  LazyFumeHoodsSG,
  LazySupplierSG,
  LazyLabCabinetsSG,
  LazyLabBenchesSG,
  LazyBiosafetySG,
  LazyLabFurnitureMY,
  LazyLabDesignSG,
  LazyGuideLabBenches,
  LazyGuideFumeVsBSC,
  LazyGuideDuctedVsDuctless,
  LazyGuideLabCabinets,
  LazyGuideStandardsSG,
  LazyAdminAuth,
  LazyDashboard,
  LazyAdminProductViewer,
  LazyTestHubSpotIntegration,
  LazyHubSpotMonitor,
} from "./components/LazyRoutes";

// Loading fallback component with watchdog timer
const PageLoader = ({ timeout = 10000 }: { timeout?: number }) => {
  const [showRetry, setShowRetry] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      console.warn('[PageLoader] Component taking longer than expected to load');
      setShowRetry(true);
    }, timeout);
    
    return () => clearTimeout(timer);
  }, [timeout]);
  
  if (showRetry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Loading Taking Longer Than Expected</h2>
          <p className="text-muted-foreground mb-6">
            The page is taking longer than usual to load. This might be due to a slow connection or a temporary issue.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry Load
            </button>
            <a
              href="/home"
              className="px-4 py-2 border border-border rounded-md hover:bg-accent"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading Innosin Lab...</p>
      </div>
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes — dedupes Supabase fetches across remounts
      gcTime: 30 * 60 * 1000,   // keep cache 30 min
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RFQProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppErrorBoundary>
              <BrowserRouter>
            <Routes>
              {/* ✅ Redirect / to /home */}
              <Route path="/" element={<Navigate to="/home" replace />} />

              {/* ✅ Redirect /welcome to /home */}
              <Route path="/welcome" element={<Navigate to="/home" replace />} />

              {/* ✅ Public routes with layout */}
              <Route element={<SiteLayout />}>
                <Route path="/home" element={
                  <Suspense fallback={<PageLoader />}>
                    <LazyIndex />
                  </Suspense>
                } />
                <Route path="/auth" element={
                  <Suspense fallback={<PageLoader />}>
                    <LazyAuth />
                  </Suspense>
                } />
                <Route path="/about" element={
                  <Suspense fallback={<PageLoader />}>
                    <LazyAbout />
                  </Suspense>
                } />
                <Route path="/blog" element={
                  <Suspense fallback={<PageLoader />}>
                    <LazyBlog />
                  </Suspense>
                } />
                <Route path="/blog/:id" element={
                  <Suspense fallback={<PageLoader />}>
                    <LazyBlogPost />
                  </Suspense>
                } />
                <Route path="/products" element={
                  <Suspense fallback={<PageLoader />}>
                    <LazyProductCatalog />
                  </Suspense>
                } />
                <Route path="/products/:id" element={
                  <Suspense fallback={<PageLoader />}>
                    <LazyEnhancedProductDetail />
                  </Suspense>
                } />
                <Route path="/floor-planner" element={
                  <Suspense fallback={<PageLoader />}>
                    <LazyFloorPlanner />
                  </Suspense>
                } />
                <Route path="/contact" element={
                  <Suspense fallback={<PageLoader />}>
                    <LazyContact />
                  </Suspense>
                } />
                <Route path="/rfq-cart" element={
                  <Suspense fallback={<PageLoader />}>
                    <LazyRFQCart />
                  </Suspense>
                } />
                <Route path="/quote-received" element={
                  <Suspense fallback={<PageLoader />}>
                    <LazyQuoteReceived />
                  </Suspense>
                } />
                <Route path="/lab-furniture-singapore" element={
                  <Suspense fallback={<PageLoader />}>
                    <LazyLabFurnitureSG />
                  </Suspense>
                } />
                <Route path="/fume-hoods-singapore" element={
                  <Suspense fallback={<PageLoader />}>
                    <LazyFumeHoodsSG />
                  </Suspense>
                } />
                <Route path="/laboratory-furniture-supplier-singapore" element={
                  <Suspense fallback={<PageLoader />}>
                    <LazySupplierSG />
                  </Suspense>
                } />
                <Route path="/lab-cabinets-singapore" element={
                  <Suspense fallback={<PageLoader />}><LazyLabCabinetsSG /></Suspense>
                } />
                <Route path="/lab-benches-singapore" element={
                  <Suspense fallback={<PageLoader />}><LazyLabBenchesSG /></Suspense>
                } />
                <Route path="/biosafety-cabinets-singapore" element={
                  <Suspense fallback={<PageLoader />}><LazyBiosafetySG /></Suspense>
                } />
                <Route path="/laboratory-furniture-malaysia" element={
                  <Suspense fallback={<PageLoader />}><LazyLabFurnitureMY /></Suspense>
                } />
                <Route path="/laboratory-design-singapore" element={
                  <Suspense fallback={<PageLoader />}><LazyLabDesignSG /></Suspense>
                } />
                <Route path="/guides/choosing-lab-benches" element={
                  <Suspense fallback={<PageLoader />}><LazyGuideLabBenches /></Suspense>
                } />
                <Route path="/guides/fume-hood-vs-biosafety-cabinet" element={
                  <Suspense fallback={<PageLoader />}><LazyGuideFumeVsBSC /></Suspense>
                } />
                <Route path="/guides/ducted-vs-ductless-fume-hoods" element={
                  <Suspense fallback={<PageLoader />}><LazyGuideDuctedVsDuctless /></Suspense>
                } />
                <Route path="/guides/lab-cabinets-buying-guide" element={
                  <Suspense fallback={<PageLoader />}><LazyGuideLabCabinets /></Suspense>
                } />
                <Route path="/guides/lab-furniture-standards-singapore" element={
                  <Suspense fallback={<PageLoader />}><LazyGuideStandardsSG /></Suspense>
                } />
              </Route>

              {/* ✅ Admin routes (protected and without layout) */}
              <Route path="/admin/auth" element={
                <Suspense fallback={<PageLoader />}>
                  <LazyAdminAuth />
                </Suspense>
              } />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminAuthGuard>
                    <Suspense fallback={<PageLoader />}>
                      <LazyDashboard />
                    </Suspense>
                  </AdminAuthGuard>
                }
              />
              <Route path="/admin/products" element={
                <Suspense fallback={<PageLoader />}>
                  <LazyAdminProductViewer />
                </Suspense>
              } />
              <Route
                path="/admin/test-hubspot"
                element={
                  <AdminAuthGuard>
                    <Navigate to="/admin/dashboard?tab=hubspot-test" replace />
                  </AdminAuthGuard>
                }
              />
              <Route
                path="/admin/hubspot-monitor"
                element={
                  <AdminAuthGuard>
                    <Navigate to="/admin/dashboard?tab=hubspot-monitor" replace />
                  </AdminAuthGuard>
                }
              />
            </Routes>
              </BrowserRouter>
            </AppErrorBoundary>
          </TooltipProvider>
        </RFQProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
