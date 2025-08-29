// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RFQProvider } from "@/contexts/RFQContext"; // ✅ add
import AdminAuthGuard from "@/components/AdminAuthGuard";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminAuth from "./pages/admin/AdminAuth";
import Dashboard from "./pages/admin/Dashboard";
import AdminProductViewer from "./pages/AdminProductViewer";

// New public pages you said should exist
import Blog from "./pages/Blog";
import ProductCatalog from "./pages/ProductCatalog";
import FloorPlanner from "./pages/FloorPlanner";
import Contact from "./pages/Contact";
import RFQCart from "./pages/RFQCart"; // ✅ add this route

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RFQProvider>{/* ✅ now HeroNavigation/useRFQ is safe everywhere */}
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/products" element={<ProductCatalog />} />
              <Route path="/floor-planner" element={<FloorPlanner />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/rfq-cart" element={<RFQCart />} /> {/* ✅ */}

              {/* Admin */}
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

              {/* Optional 404 */}
              {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RFQProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
