
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import CompanyThemeProvider from "./components/CompanyThemeProvider";
import { isLovableDevelopment } from "./utils/environmentDetection";

// Import all pages
import Index from "./pages/Index";
import ProductCatalog from "./pages/ProductCatalog";
import EnhancedProductDetail from "./pages/EnhancedProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import FloorPlanner from "./pages/FloorPlanner";
import RFQCart from "./pages/RFQCart";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import Maintenance from "./pages/Maintenance";
import NotFound from "./pages/NotFound";

// Import layout components
import { RFQProvider } from "./contexts/RFQContext";
import HeaderBrand from "./components/HeaderBrand";
import EnhancedLiveChat from "./components/EnhancedLiveChat";
import { Footer } from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import SecurityHeader from "./components/SecurityHeader";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  const isDevelopment = isLovableDevelopment();
  
  console.log('Environment Detection:', {
    isDevelopment,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
    nodeEnv: process.env.NODE_ENV
  });

  // Production maintenance mode effect
  useEffect(() => {
    if (!isDevelopment) {
      // Set maintenance mode indicators for crawlers
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-maintenance-mode', 'true');
        document.documentElement.setAttribute('data-status', '503');
        
        // Force immediate cache invalidation
        const cacheHeaders = [
          { name: 'Cache-Control', content: 'no-cache, no-store, must-revalidate, max-age=0' },
          { name: 'Pragma', content: 'no-cache' },
          { name: 'Expires', content: '0' }
        ];
        
        cacheHeaders.forEach(header => {
          const meta = document.createElement('meta');
          meta.setAttribute('http-equiv', header.name);
          meta.setAttribute('content', header.content);
          document.head.appendChild(meta);
        });
      }
    }
  }, [isDevelopment]);

  if (!isDevelopment) {
    // Production - maintenance mode only
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <CompanyThemeProvider>
                <Routes>
                  <Route path="*" element={<Maintenance />} />
                </Routes>
              </CompanyThemeProvider>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Development - full functionality
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <RFQProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <CompanyThemeProvider>
                <SecurityHeader />
                <ScrollToTop />
                <div className="min-h-screen flex flex-col">
                  <HeaderBrand />
                  <main className="flex-1 pt-16">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/products" element={<ProductCatalog />} />
                      <Route path="/products/:productId" element={<EnhancedProductDetail />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/floor-planner" element={<FloorPlanner />} />
                      <Route path="/rfq-cart" element={<RFQCart />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/maintenance" element={<Maintenance />} />
                      <Route path="/admin/dashboard" element={<AdminDashboard />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                  <EnhancedLiveChat />
                </div>
              </CompanyThemeProvider>
            </BrowserRouter>
          </RFQProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
