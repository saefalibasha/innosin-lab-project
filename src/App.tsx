// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RFQProvider } from "@/contexts/RFQContext";
import AdminAuthGuard from "@/components/AdminAuthGuard";

// Layout
import SiteLayout from "@/components/layout/SiteLayout";

// Public pages
import WelcomeLandingPage from "./pages/WelcomeLandingPage";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ProductCatalog from "./pages/ProductCatalog";
import EnhancedProductDetail from "./pages/EnhancedProductDetail";
import FloorPlanner from "./pages/FloorPlanner";
import Contact from "./pages/Contact";
import RFQCart from "./pages/RFQCart";

// Admin pages
import AdminAuth from "./pages/admin/AdminAuth";
import Dashboard from "./pages/admin/Dashboard";
import AdminProductViewer from "./pages/AdminProductViewer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RFQProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* ✅ Redirect / to /welcome */}
              <Route path="/" element={<Navigate to="/welcome" replace />} />

              {/* ✅ Welcome landing page (no layout) */}
              <Route path="/welcome" element={<WelcomeLandingPage />} />

              {/* ✅ Public routes with layout */}
              <Route element={<SiteLayout />}>
                <Route path="/home" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/products" element={<ProductCatalog />} />
                <Route path="/products/:id" element={<EnhancedProductDetail />} />
                <Route path="/floor-planner" element={<FloorPlanner />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/rfq-cart" element={<RFQCart />} />
              </Route>

              {/* ✅ Admin routes (protected and without layout) */}
              <Route path="/admin/auth" element={<AdminAuth />} />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminAuthGuard>
                    <Dashboard />
                  </AdminAuthGuard>
                }
              />
              <Route path="/admin/products" element={<AdminProductViewer />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RFQProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
