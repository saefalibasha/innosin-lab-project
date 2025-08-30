
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { RFQProvider } from '@/contexts/RFQContext';
import EnhancedProductDetail from '@/pages/EnhancedProductDetail';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RFQProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<div>Home Page</div>} />
              <Route path="/products/:id" element={<EnhancedProductDetail />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </RFQProvider>
    </QueryClientProvider>
  );
}

export default App;
