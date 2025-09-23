// src/App.tsx
import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/contexts/AuthContext";
import { RFQProvider } from "@/contexts/RFQContext";
import AdminAuthGuard from "@/components/AdminAuthGuard";

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
  LazyAdminAuth,
  LazyDashboard,
  LazyAdminProductViewer,
  LazyTestHubSpotIntegration,
  LazyHubSpotMonitor,
} from "./components/LazyRoutes";

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RFQProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* ✅ Redirect / to /welcome */}
                <Route path="/" element={<Navigate to="/welcome" replace />} />

                {/* ✅ Welcome landing page (no layout) */}
                <Route path="/welcome" element={
                  <Suspense fallback={<PageLoader />}>
                    <LazyWelcomeLandingPage />
                  </Suspense>
                } />

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
            </TooltipProvider>
          </RFQProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </HelmetProvider>
);

export default App;
