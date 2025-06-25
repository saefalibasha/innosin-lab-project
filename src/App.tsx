
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProductCatalog from "./pages/ProductCatalog";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import FloorPlanner from "./pages/FloorPlanner";
import RFQCart from "./pages/RFQCart";
import AdminPDF from "./pages/AdminPDF";
import ChatbotAdmin from "./pages/ChatbotAdmin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { RFQProvider } from "./contexts/RFQContext";
import { AuthProvider } from "./contexts/AuthContext";
import { TubelightNavBarDemo } from "./components/ui/demo";
import HeaderBrand from "./components/HeaderBrand";
import EnhancedLiveChat from "./components/EnhancedLiveChat";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <RFQProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col">
              <HeaderBrand />
              <TubelightNavBarDemo />
              <main className="flex-1 pt-16">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<ProductCatalog />} />
                  <Route path="/products/:productId" element={<ProductDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/floor-planner" element={<FloorPlanner />} />
                  <Route path="/rfq-cart" element={<RFQCart />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin/pdf" element={<AdminPDF />} />
                  <Route path="/admin/chatbot" element={<ChatbotAdmin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <EnhancedLiveChat />
            </div>
          </BrowserRouter>
        </RFQProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
