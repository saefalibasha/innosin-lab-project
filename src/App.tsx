
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Index from '@/pages/Index';
import ProductCatalog from '@/pages/ProductCatalog';
import EnhancedProductDetail from '@/pages/EnhancedProductDetail';
import RFQCart from '@/pages/RFQCart';
import { RFQProvider } from '@/contexts/RFQContext';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RFQProvider>
          <Router>
            <div className="min-h-screen bg-background flex flex-col">
              <Navigation />
              <main className="flex-1 pt-28">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<ProductCatalog />} />
                  <Route path="/products/:seriesSlug" element={<EnhancedProductDetail />} />
                  <Route path="/quote" element={<RFQCart />} />
                </Routes>
              </main>
              <Footer />
            </div>
            <Toaster />
          </Router>
        </RFQProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
