
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductAssetUploadManager from '@/components/ProductAssetUploadManager';
import KnowledgeBaseManager from '@/components/KnowledgeBaseManager';
import AdminAuthGuard from '@/components/AdminAuthGuard';

const AdminPDF = () => {
  return (
    <AdminAuthGuard>
      <div className="container mx-auto py-12 pt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management System</h1>
          <p className="text-gray-600">Manage product assets and AI knowledge base</p>
        </div>
        
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Product Assets</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <ProductAssetUploadManager />
          </TabsContent>
          
          <TabsContent value="knowledge">
            <KnowledgeBaseManager />
          </TabsContent>
        </Tabs>
      </div>
    </AdminAuthGuard>
  );
};

export default AdminPDF;
