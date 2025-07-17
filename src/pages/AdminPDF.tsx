
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PDFUploadManager from '@/components/PDFUploadManager';
import ProductAssetUploadManager from '@/components/ProductAssetUploadManager';
import PDFProcessingStatus from '@/components/PDFProcessingStatus';
import KnowledgeBaseManager from '@/components/KnowledgeBaseManager';
import AdminAuthGuard from '@/components/AdminAuthGuard';

const AdminPDF = () => {
  return (
    <AdminAuthGuard>
      <div className="container mx-auto py-12 pt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Asset Management System</h1>
          <p className="text-gray-600">Manage product assets, documentation and AI knowledge base</p>
        </div>
        
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">Product Assets</TabsTrigger>
            <TabsTrigger value="pdfs">PDF Upload</TabsTrigger>
            <TabsTrigger value="processing">Processing Status</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <ProductAssetUploadManager />
          </TabsContent>
          
          <TabsContent value="pdfs">
            <PDFUploadManager />
          </TabsContent>
          
          <TabsContent value="processing">
            <PDFProcessingStatus />
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
