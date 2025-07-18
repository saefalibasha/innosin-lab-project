
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as UIToaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { RFQProvider } from "@/contexts/RFQContext";
import ScrollToTop from "@/components/ScrollToTop";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import About from "./pages/About";
import ProductCatalog from "./pages/ProductCatalog";
import ProductDetail from "./pages/ProductDetail";
import FloorPlanner from "./pages/FloorPlanner";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import RFQCart from "./pages/RFQCart";
import Auth from "./pages/Auth";
import AdminProducts from "./pages/AdminProducts";
import AdminPDF from "./pages/AdminPDF";
import AdminSecurity from "./pages/AdminSecurity";
import ChatbotAdmin from "./pages/ChatbotAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <RFQProvider>
              <Toaster />
              <UIToaster />
              <BrowserRouter>
                <ScrollToTop />
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/products" element={<ProductCatalog />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/floor-planner" element={<FloorPlanner />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/quote" element={<RFQCart />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/admin/products" element={<AdminProducts />} />
                      <Route path="/admin/pdfs" element={<AdminPDF />} />
                      <Route path="/admin/security" element={<AdminSecurity />} />
                      <Route path="/admin/chatbot" element={<ChatbotAdmin />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </BrowserRouter>
            </RFQProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
