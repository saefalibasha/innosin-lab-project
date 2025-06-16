
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProductCatalog from "./pages/ProductCatalog";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FloorPlanner from "./pages/FloorPlanner";
import RFQCart from "./pages/RFQCart";
import NotFound from "./pages/NotFound";
import { RFQProvider } from "./contexts/RFQContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RFQProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<ProductCatalog />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/floor-planner" element={<FloorPlanner />} />
            <Route path="/rfq-cart" element={<RFQCart />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RFQProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
