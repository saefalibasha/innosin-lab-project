
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RFQProvider } from "@/contexts/RFQContext";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductCatalog from "./pages/ProductCatalog";
import ProductDetail from "./pages/ProductDetail";
import RFQCart from "./pages/RFQCart";
import FloorPlanner from "./pages/FloorPlanner";
import Blog from "./pages/Blog";
import Catalog from "./pages/Catalog";
import NotFound from "./pages/NotFound";
import ChatbotAdmin from "./pages/ChatbotAdmin";
import PDFAdmin from "./pages/PDFAdmin";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RFQProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/products" element={<ProductCatalog />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/rfq-cart" element={<RFQCart />} />
              <Route path="/floor-planner" element={<FloorPlanner />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/admin/chatbot" element={<ChatbotAdmin />} />
              <Route path="/admin/pdf" element={<PDFAdmin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RFQProvider>
    </QueryClientProvider>
  );
}

export default App;
