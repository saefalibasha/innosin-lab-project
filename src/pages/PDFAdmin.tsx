
import React from 'react';
import PDFManagement from '@/components/PDFManagement';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const PDFAdmin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sea-light to-white">
      <Navigation />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-sea mb-4">
              PDF Knowledge Management
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload and manage product catalogs to enhance the AI chat system's knowledge base. 
              The AI will learn from uploaded PDFs to provide more accurate and detailed responses.
            </p>
          </div>
          <PDFManagement />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PDFAdmin;
