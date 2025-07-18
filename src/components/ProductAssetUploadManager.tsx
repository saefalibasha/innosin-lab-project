
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PDFUploadManager from './PDFUploadManager';
import PDFProcessingStatus from './PDFProcessingStatus';
import EnhancedAssetManager from './EnhancedAssetManager';
import { FileText, Package2, Settings } from 'lucide-react';

const ProductAssetUploadManager = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package2 className="w-5 h-5" />
            <span>Product Asset Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="assets" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="assets" className="flex items-center space-x-2">
                <Package2 className="w-4 h-4" />
                <span>Asset Manager</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>PDF Upload</span>
              </TabsTrigger>
              <TabsTrigger value="processing" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Processing Status</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="assets" className="mt-6">
              <EnhancedAssetManager />
            </TabsContent>
            
            <TabsContent value="upload" className="mt-6">
              <PDFUploadManager />
            </TabsContent>
            
            <TabsContent value="processing" className="mt-6">
              <PDFProcessingStatus />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductAssetUploadManager;
