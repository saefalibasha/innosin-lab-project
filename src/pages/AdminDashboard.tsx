
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  MessageSquare, 
  Shield, 
  Settings,
  Database,
  Activity,
  Users,
  FileText,
  BarChart3,
  Wrench
} from 'lucide-react';
import { EnhancedAssetManager } from '@/components/admin/enhanced-asset-manager';
import ChatbotTraining from '@/components/ChatbotTraining';
import ChatAdminDashboard from '@/components/ChatAdminDashboard';
import AdminRoleManager from '@/components/AdminRoleManager';
import AdminAuthGuard from '@/components/AdminAuthGuard';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('assets');

  // Fetch admin statistics
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [productsResult, sessionsResult, documentsResult, usersResult] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('chat_sessions').select('id', { count: 'exact' }),
        supabase.from('pdf_documents').select('id', { count: 'exact' }),
        supabase.from('admin_roles').select('id', { count: 'exact' })
      ]);

      return {
        products: productsResult.count || 0,
        sessions: sessionsResult.count || 0,
        documents: documentsResult.count || 0,
        users: usersResult.count || 0
      };
    }
  });

  return (
    <AdminAuthGuard>
      <div className="container mx-auto py-12 pt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive management system for products, chatbot, security, and maintenance</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.products || 0}</div>
              <p className="text-xs text-muted-foreground">Product catalog</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.sessions || 0}</div>
              <p className="text-xs text-muted-foreground">Customer interactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.users || 0}</div>
              <p className="text-xs text-muted-foreground">System administrators</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Good</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Asset Manager
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chatbot
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">Product Asset Management</h2>
              <p className="text-muted-foreground">Manage all product assets including KS Series and other product lines</p>
            </div>
            <EnhancedAssetManager />
          </TabsContent>

          <TabsContent value="chatbot" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">Chatbot Management</h2>
              <p className="text-muted-foreground">Train and monitor the AI chatbot system</p>
            </div>
            <Tabs defaultValue="training" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="training">Bot Training</TabsTrigger>
                <TabsTrigger value="dashboard">Chat Dashboard</TabsTrigger>
              </TabsList>
              
              <TabsContent value="training">
                <ChatbotTraining />
              </TabsContent>
              
              <TabsContent value="dashboard">
                <ChatAdminDashboard />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">Security Management</h2>
              <p className="text-muted-foreground">Manage user roles, permissions, and security settings</p>
            </div>
            <AdminRoleManager />
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">System Maintenance</h2>
              <p className="text-muted-foreground">Monitor system health and perform maintenance tasks</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Database Status</span>
                    <span className="text-green-600 font-medium">Healthy</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Storage Usage</span>
                    <span>2.3 GB / 10 GB</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Database className="h-4 w-4 mr-2" />
                    Optimize Database
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Asset Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Missing Assets</span>
                    <span className="text-yellow-600 font-medium">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Broken Links</span>
                    <span className="text-red-600 font-medium">3</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Activity className="h-4 w-4 mr-2" />
                    Scan Assets
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Page Load Time</span>
                    <span className="text-green-600 font-medium">1.2s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>API Response</span>
                    <span className="text-green-600 font-medium">245ms</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Activity className="h-4 w-4 mr-2" />
                    Run Performance Test
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Maintenance Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    Clear Cache
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Rebuild Search Index
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Export System Logs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">System Settings</h2>
              <p className="text-muted-foreground">Configure general system settings and preferences</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Site Name</label>
                    <input 
                      type="text" 
                      defaultValue="Laboratory Equipment Store" 
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Maintenance Mode</label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="off">Off</option>
                      <option value="on">On</option>
                    </select>
                  </div>
                  <Button className="w-full">Save Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Backup & Recovery</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Last Backup</span>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Auto Backup</span>
                    <span className="text-green-600 font-medium">Enabled</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    Create Backup Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminAuthGuard>
  );
};

export default AdminDashboard;
