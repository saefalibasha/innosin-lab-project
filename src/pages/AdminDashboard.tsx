
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  FileText, 
  Bot,
  Database,
  Package,
  Settings,
  BarChart3,
  Brain,
  Workflow,
  Plus,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ChatbotTraining from '@/components/ChatbotTraining';
import EnhancedAssetManager from '@/components/admin/EnhancedAssetManager';

interface DashboardStats {
  totalSessions: number;
  totalMessages: number;
  activeTrainingEntries: number;
  totalProducts: number;
  activeProducts: number;
  totalDocuments: number;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    totalMessages: 0,
    activeTrainingEntries: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalDocuments: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    console.log('Fetching dashboard stats...');
    try {
      setLoading(true);

      const [sessionsResult, messagesResult, trainingResult, productsResult, documentsResult] = await Promise.all([
        supabase.from('chat_sessions').select('id', { count: 'exact', head: true }),
        supabase.from('chat_messages').select('id', { count: 'exact', head: true }),
        supabase.from('chatbot_training_data').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('products').select('id, is_active', { count: 'exact' }),
        supabase.from('pdf_documents').select('id', { count: 'exact', head: true })
      ]);

      const activeProductsCount = productsResult.data?.filter(p => p.is_active).length || 0;

      setStats({
        totalSessions: sessionsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        activeTrainingEntries: trainingResult.count || 0,
        totalProducts: productsResult.count || 0,
        activeProducts: activeProductsCount,
        totalDocuments: documentsResult.count || 0
      });

      console.log('Dashboard stats fetched successfully');
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "View Chat Sessions",
      description: "Monitor active conversations",
      icon: Eye,
      action: () => setActiveTab('sessions'),
      color: "bg-blue-500"
    },
    {
      title: "Add Training Data",
      description: "Improve AI responses",
      icon: Brain,
      action: () => setActiveTab('ai-training'),
      color: "bg-green-500"
    },
    {
      title: "Add Product",
      description: "Expand product catalog",
      icon: Plus,
      action: () => setActiveTab('products'),
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your AI assistant and product catalog</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-training">AI Training Center</TabsTrigger>
            <TabsTrigger value="products">Products & Assets</TabsTrigger>
            <TabsTrigger value="sessions">Chat Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Chat Sessions</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : stats.totalSessions}</div>
                  <p className="text-xs text-muted-foreground">Active conversations</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : stats.totalMessages}</div>
                  <p className="text-xs text-muted-foreground">Messages exchanged</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : stats.activeProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeProducts} active of {stats.totalProducts} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Training Data</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : stats.activeTrainingEntries}</div>
                  <p className="text-xs text-muted-foreground">Active training entries</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Documents</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : stats.totalDocuments}</div>
                  <p className="text-xs text-muted-foreground">PDF documents uploaded</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default" className="bg-green-500">Online</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start space-y-2"
                      onClick={action.action}
                    >
                      <div className={`p-2 rounded-md ${action.color} text-white`}>
                        <action.icon className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-muted-foreground">{action.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-training">
            <ChatbotTraining />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Products & Asset Management</h2>
                <p className="text-muted-foreground">Manage your product catalog, 3D models, and images</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <EnhancedAssetManager />
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Chat session management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
