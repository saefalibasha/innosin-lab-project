
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Upload,
  Database,
  Users,
  Activity
} from 'lucide-react';
import { EnhancedAssetManager } from '@/components/admin/enhanced-asset-manager';
import { AdminPDFManager } from '@/components/admin/AdminPDFManager';
import { AdminChatManager } from '@/components/admin/AdminChatManager';
import { AdminProductEditor } from '@/components/admin/AdminProductEditor';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('assets');

  // Fetch admin statistics
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [productsResult, sessionsResult, documentsResult] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('chat_sessions').select('id', { count: 'exact' }),
        supabase.from('pdf_documents').select('id', { count: 'exact' })
      ]);

      return {
        products: productsResult.count || 0,
        sessions: sessionsResult.count || 0,
        documents: documentsResult.count || 0
      };
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage Innosin Lab products, assets, and system configuration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            System Status
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.products || 0}</div>
            <p className="text-xs text-muted-foreground">
              Innosin Lab catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Customer interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.documents || 0}</div>
            <p className="text-xs text-muted-foreground">
              PDF knowledge base
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asset Coverage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15%</div>
            <p className="text-xs text-muted-foreground">
              Products with full assets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full lg:w-fit">
          <TabsTrigger value="assets" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Asset Manager
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Product Editor
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            PDF Manager
          </TabsTrigger>
          <TabsTrigger value="chats" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat Manager
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-6">
          <EnhancedAssetManager />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <AdminProductEditor />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <AdminPDFManager />
        </TabsContent>

        <TabsContent value="chats" className="space-y-6">
          <AdminChatManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
