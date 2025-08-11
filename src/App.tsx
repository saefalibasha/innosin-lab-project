import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from "@/components/ui/tooltip"
import Index from '@/pages/Index';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import BlogList from '@/pages/BlogList';
import BlogPost from '@/pages/BlogPost';
import FloorplanDesigner from '@/pages/FloorplanDesigner';
import AdminDashboard from '@/pages/AdminDashboard';
import ProductCatalog from '@/pages/ProductCatalog';
import EnhancedProductDetail from '@/pages/EnhancedProductDetail';
import ChatInterface from '@/pages/ChatInterface';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<ProductCatalog />} />
              <Route path="/products/:seriesName" element={<EnhancedProductDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/floorplan" element={<FloorplanDesigner />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/chat" element={<ChatInterface />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
