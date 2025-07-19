
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
  Eye,
  Upload,
  Download,
  Zap,
  Activity,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ChatbotTraining from '@/components/ChatbotTraining';
import { ProductSeriesManager } from '@/components/admin/ProductSeriesManager';
import { FileUploadManager } from '@/components/admin/FileUploadManager';

interface DashboardStats {
  totalSessions: number;
  totalMessages: number;
  activeTrainingEntries: number;
  totalProducts: number;
  activeProducts: number;
  totalDocuments: number;
  totalSeries: number;
  productsWithAssets: number;
}

interface RecentActivity {
  id: string;
  type: 'chat' | 'upload' | 'training' | 'product';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'error';
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    totalMessages: 0,
    activeTrainingEntries: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalDocuments: 0,
    totalSeries: 0,
    productsWithAssets: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
  }, []);

  const fetchDashboardStats = async () => {
    console.log('Fetching dashboard stats...');
    try {
      setLoading(true);

      const [
        sessionsResult, 
        messagesResult, 
        trainingResult, 
        productsResult, 
        documentsResult
      ] = await Promise.all([
        supabase.from('chat_sessions').select('id', { count: 'exact', head: true }),
        supabase.from('chat_messages').select('id', { count: 'exact', head: true }),
        supabase.from('chatbot_training_data').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('products').select('id, is_active, product_series, thumbnail_path, model_path', { count: 'exact' }),
        supabase.from('pdf_documents').select('id', { count: 'exact', head: true })
      ]);

      const activeProductsCount = productsResult.data?.filter(p => p.is_active).length || 0;
      const productsWithAssets = productsResult.data?.filter(p => p.thumbnail_path || p.model_path).length || 0;
      const uniqueSeries = new Set(productsResult.data?.map(p => p.product_series).filter(Boolean)).size;

      setStats({
        totalSessions: sessionsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        activeTrainingEntries: trainingResult.count || 0,
        totalProducts: productsResult.count || 0,
        activeProducts: activeProductsCount,
        totalDocuments: documentsResult.count || 0,
        totalSeries: uniqueSeries,
        productsWithAssets
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

  const fetchRecentActivity = async () => {
    // Mock recent activity for demonstration
    setRecentActivity([
      {
        id: '1',
        type: 'product',
        title: 'Product Updated',
        description: 'Mobile Cabinet MC-PC (755065) assets uploaded',
        timestamp: '2 minutes ago',
        status: 'success'
      },
      {
        id: '2',
        type: 'training',
        title: 'Training Data Added',
        description: 'New intent for laboratory equipment queries',
        timestamp: '15 minutes ago',
        status: 'success'
      },
      {
        id: '3',
        type: 'chat',
        title: 'Chat Session',
        description: 'User inquiry about bench configurations',
        timestamp: '1 hour ago',
        status: 'success'
      }
    ]);
  };

  const quickActions = [
    {
      title: "Add New Product",
      description: "Create a new product entry with assets",
      icon: Plus,
      action: () => setActiveTab('products'),
      color: "from-blue-500 to-blue-600",
      stats: `${stats.totalProducts} total products`,
      trend: "+12%"
    },
    {
      title: "Upload Assets",
      description: "Upload 3D models and product images",
      icon: Upload,
      action: () => setActiveTab('products'),
      color: "from-green-500 to-green-600",
      stats: `${stats.productsWithAssets} with assets`,
      trend: "+8%"
    },
    {
      title: "Train AI Assistant",
      description: "Improve AI responses and accuracy",
      icon: Brain,
      action: () => setActiveTab('ai-training'),
      color: "from-purple-500 to-purple-600",
      stats: `${stats.activeTrainingEntries} active entries`,
      trend: "+15%"
    },
    {
      title: "Monitor Sessions",
      description: "View active chat conversations",
      icon: Eye,
      action: () => setActiveTab('sessions'),
      color: "from-orange-500 to-orange-600",
      stats: `${stats.totalSessions} total sessions`,
      trend: "+5%"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'chat': return MessageSquare;
      case 'upload': return Upload;
      case 'training': return Brain;
      case 'product': return Package;
      default: return Activity;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'error': return <Activity className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

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
            {/* Enhanced Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : stats.totalSessions}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalMessages} total messages
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : stats.activeProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalSeries} series • {stats.productsWithAssets} with assets
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Training</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : stats.activeTrainingEntries}</div>
                  <p className="text-xs text-muted-foreground">Active training entries</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Documents</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : stats.totalDocuments}</div>
                  <p className="text-xs text-muted-foreground">PDF documents uploaded</p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <Card
                      key={index}
                      className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group"
                      onClick={action.action}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                      <CardContent className="p-4 relative">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white`}>
                            <action.icon className="h-4 w-4" />
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-green-600 font-medium">{action.trend}</div>
                          </div>
                        </div>
                        <h3 className="font-semibold mb-1">{action.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                        <p className="text-xs text-muted-foreground">{action.stats}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => {
                    const ActivityIcon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="p-2 rounded-full bg-muted">
                          <ActivityIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{activity.title}</p>
                            {getStatusIcon(activity.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
                      </div>
                    );
                  })}
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
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProductSeriesManager 
                  onProductSelect={(product) => console.log('Selected product:', product)}
                  onProductEdit={(product) => console.log('Edit product:', product)}
                />
              </div>
              <div className="space-y-6">
                <FileUploadManager 
                  onFilesUploaded={(files) => {
                    console.log('Files uploaded:', files);
                    // Refresh products after upload
                    fetchDashboardStats();
                  }}
                />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Asset Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Products with Images</span>
                      <span className="font-medium">{stats.productsWithAssets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Products with 3D Models</span>
                      <span className="font-medium">{stats.productsWithAssets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Series</span>
                      <span className="font-medium">{stats.totalSeries}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat Sessions Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Chat Sessions</h3>
                  <p className="text-muted-foreground mb-4">
                    Monitor and manage active chat conversations with users.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Sessions: {stats.totalSessions} • Total Messages: {stats.totalMessages}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
