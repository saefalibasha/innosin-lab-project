
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PDFUploadManager from '@/components/PDFUploadManager';
import PDFProcessingStatus from '@/components/PDFProcessingStatus';
import KnowledgeBaseManager from '@/components/KnowledgeBaseManager';
import AdminAuthGuard from '@/components/AdminAuthGuard';

const AdminPDF = () => {
  return (
    <AdminAuthGuard>
      <div className="container mx-auto py-12 pt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Management System</h1>
          <p className="text-gray-600">Manage product documentation and AI knowledge base</p>
        </div>
        
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">PDF Upload</TabsTrigger>
            <TabsTrigger value="processing">Processing Status</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
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
