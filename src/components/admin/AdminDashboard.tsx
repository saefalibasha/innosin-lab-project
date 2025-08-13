
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Package, 
  MessageSquare, 
  Users, 
  FileText, 
  Upload,
  Settings,
  Database,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { ProductSeriesManager } from './ProductSeriesManager';
import KnowledgeBaseManager from './KnowledgeBaseManager';
import ChatAnalytics from './ChatAnalytics';
import DocumentManager from './DocumentManager';
import TrainingDataManager from './TrainingDataManager';
import BulkProductUpload from './BulkProductUpload';

interface AdminStats {
  totalProducts: number;
  activeSeries: number;
  totalChats: number;
  knowledgeEntries: number;
}

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock stats - in a real app, these would come from API calls
  const stats: AdminStats = {
    totalProducts: 156,
    activeSeries: 8,
    totalChats: 1247,
    knowledgeEntries: 89
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your product catalog and system settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat Analytics
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Training Data
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Bulk Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all series
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Series</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeSeries}</div>
                  <p className="text-xs text-muted-foreground">
                    Product series
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalChats}</div>
                  <p className="text-xs text-muted-foreground">
                    Total conversations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Knowledge Entries</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.knowledgeEntries}</div>
                  <p className="text-xs text-muted-foreground">
                    KB articles
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50" 
                       onClick={() => setActiveTab('products')}>
                    <Package className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-medium">Manage Products</h3>
                    <p className="text-sm text-muted-foreground">Add, edit, and organize your product catalog</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                       onClick={() => setActiveTab('knowledge')}>
                    <BookOpen className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-medium">Update Knowledge Base</h3>
                    <p className="text-sm text-muted-foreground">Manage AI training data and responses</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                       onClick={() => setActiveTab('upload')}>
                    <Upload className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-medium">Bulk Upload</h3>
                    <p className="text-sm text-muted-foreground">Upload multiple products at once</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <ProductSeriesManager />
          </TabsContent>

          <TabsContent value="chat">
            <ChatAnalytics />
          </TabsContent>

          <TabsContent value="knowledge">
            <KnowledgeBaseManager />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentManager />
          </TabsContent>

          <TabsContent value="training">
            <TrainingDataManager />
          </TabsContent>

          <TabsContent value="upload">
            <BulkProductUpload />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
