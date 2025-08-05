
import React from 'react';
import { ProductTableViewer } from '@/components/admin/ProductTableViewer';

const AdminProductViewer = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Product Database Viewer</h1>
        <ProductTableViewer />
      </div>
    </div>
  );
};

export default AdminProductViewer;
