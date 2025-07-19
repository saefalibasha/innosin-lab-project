
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Users, MessageSquare, BarChart3, FileText, Settings } from 'lucide-react';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';
import { EnhancedAssetManager } from '@/components/admin/enhanced-asset-manager/EnhancedAssetManager';
import { AdminProductEditor } from '@/components/admin/AdminProductEditor';
import { ChatAdminDashboard } from '@/components/ChatAdminDashboard';
import { AdminRoleManager } from '@/components/AdminRoleManager';
import { PDFUploadManager } from '@/components/PDFUploadManager';
import { KnowledgeBaseManager } from '@/components/KnowledgeBaseManager';
import { ChatbotTraining } from '@/components/ChatbotTraining';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your laboratory equipment catalog and system settings</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-7 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="assets">Asset Manager</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
              <TabsTrigger value="training">Training</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">127</div>
                    <p className="text-xs text-muted-foreground">Active laboratory equipment</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">89</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">45</div>
                    <p className="text-xs text-muted-foreground">Active entries</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Health</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">Good</div>
                    <p className="text-xs text-muted-foreground">All systems operational</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Product Management</h2>
                  <Button onClick={() => setActiveTab('assets')}>
                    <Package className="h-4 w-4 mr-2" />
                    Go to Asset Manager
                  </Button>
                </div>
                <AdminProductEditor />
              </div>
            </TabsContent>

            <TabsContent value="assets">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Laboratory Equipment Manager</h2>
                  <p className="text-muted-foreground">
                    Comprehensive asset management for all laboratory equipment
                  </p>
                </div>
                <EnhancedAssetManager />
              </div>
            </TabsContent>

            <TabsContent value="chat">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Chat Management</h2>
                  <MessageSquare className="h-5 w-5" />
                </div>
                <ChatAdminDashboard />
              </div>
            </TabsContent>

            <TabsContent value="knowledge">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Knowledge Base</h2>
                  <FileText className="h-5 w-5" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>PDF Document Upload</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PDFUploadManager />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Knowledge Base Manager</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <KnowledgeBaseManager />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="training">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Chatbot Training</h2>
                  <Settings className="h-5 w-5" />
                </div>
                <ChatbotTraining />
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">User Management</h2>
                  <Users className="h-5 w-5" />
                </div>
                <AdminRoleManager />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
