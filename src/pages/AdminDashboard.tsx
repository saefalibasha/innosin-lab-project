import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploadManager } from '@/components/admin/FileUploadManager';
import AssetManager from '@/components/admin/AssetManager';
import AITrainingCenter from '@/components/admin/AITrainingCenter';
import ProductSeriesManager from '@/components/admin/ProductSeriesManager';
import {
  Users,
  MessageSquare,
  FileText,
  Upload,
  TrendingUp,
  Activity,
  Database,
  Brain,
  Package,
  Grid3X3
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your system and monitor performance</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Training
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Dashboard Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Active Users</span>
                      </div>
                      <div className="text-3xl font-bold text-blue-900">1,234</div>
                      <div className="text-sm text-blue-700">+12% from last month</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Chat Sessions</span>
                      </div>
                      <div className="text-3xl font-bold text-green-900">5,678</div>
                      <div className="text-sm text-green-700">+8% from last month</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">Documents</span>
                      </div>
                      <div className="text-3xl font-bold text-purple-900">892</div>
                      <div className="text-sm text-purple-700">+15% from last month</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="h-5 w-5 text-orange-600" />
                        <span className="text-sm font-medium text-orange-900">Storage Used</span>
                      </div>
                      <div className="text-3xl font-bold text-orange-900">2.4GB</div>
                      <div className="text-sm text-orange-700">68% of quota</div>
                    </div>
                  </div>
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
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('products')}>
                    <CardContent className="p-4 text-center">
                      <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-semibold">Manage Products</h3>
                      <p className="text-sm text-muted-foreground">Add series and variants</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('upload')}>
                    <CardContent className="p-4 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-semibold">Upload Files</h3>
                      <p className="text-sm text-muted-foreground">Bulk upload documents</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('ai')}>
                    <CardContent className="p-4 text-center">
                      <Brain className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-semibold">AI Training</h3>
                      <p className="text-sm text-muted-foreground">Train AI models</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <ProductSeriesManager />
          </TabsContent>

          <TabsContent value="assets">
            <AssetManager />
          </TabsContent>

          <TabsContent value="upload">
            <FileUploadManager />
          </TabsContent>

          <TabsContent value="ai">
            <AITrainingCenter />
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Advanced analytics and reporting features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
