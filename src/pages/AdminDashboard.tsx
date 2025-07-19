
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Brain, 
  Package, 
  Upload,
  BarChart3,
  Settings,
  FileText,
  Calendar,
  Activity
} from 'lucide-react';
import EnhancedAssetManager from '@/components/admin/EnhancedAssetManager';
import { ProductSeriesManager } from '@/components/admin/ProductSeriesManager';
import AITrainingCenter from '@/components/admin/AITrainingCenter';

interface DashboardStats {
  totalSessions: number;
  activeSessions: number;
  totalProducts: number;
  completedTrainingRuns: number;
  avgSatisfactionScore: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    activeSessions: 0,
    totalProducts: 0,
    completedTrainingRuns: 0,
    avgSatisfactionScore: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      console.log('Fetching dashboard stats...');
      
      // Fetch chat sessions data
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('id, status, satisfaction_score');

      if (sessionsError) throw sessionsError;

      // Fetch products data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, is_active');

      if (productsError) throw productsError;

      // Fetch training sessions data
      const { data: trainingSessions, error: trainingError } = await supabase
        .from('training_sessions')
        .select('id, status');

      if (trainingError) throw trainingError;

      // Calculate stats
      const totalSessions = sessions?.length || 0;
      const activeSessions = sessions?.filter(s => s.status === 'active').length || 0;
      const totalProducts = products?.length || 0;
      const completedTrainingRuns = trainingSessions?.filter(t => t.status === 'completed').length || 0;
      
      // Calculate average satisfaction score
      const satisfactionScores = sessions?.filter(s => s.satisfaction_score !== null).map(s => s.satisfaction_score) || [];
      const avgSatisfactionScore = satisfactionScores.length > 0 
        ? satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length 
        : 0;

      setStats({
        totalSessions,
        activeSessions,
        totalProducts,
        completedTrainingRuns,
        avgSatisfactionScore
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

  const handleProductSelect = (product: any) => {
    console.log('Product selected:', product);
  };

  const handleProductEdit = (product: any) => {
    console.log('Edit product:', product);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Enhanced Quick Actions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Chat Sessions</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">{stats.totalSessions}</div>
                <div className="text-xs text-blue-700">
                  {stats.activeSessions} active now
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Package className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Products</span>
                </div>
                <div className="text-2xl font-bold text-green-900">{stats.totalProducts}</div>
                <div className="text-xs text-green-700">Total catalog</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center">
                <Package className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">AI Training</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">{stats.completedTrainingRuns}</div>
                <div className="text-xs text-purple-700">Completed runs</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-200 flex items-center justify-center">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Satisfaction</span>
                </div>
                <div className="text-2xl font-bold text-orange-900">
                  {stats.avgSatisfactionScore.toFixed(1)}
                </div>
                <div className="text-xs text-orange-700">Average score</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-200 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Upload className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-900">Assets</span>
                </div>
                <div className="text-2xl font-bold text-indigo-900">Ready</div>
                <div className="text-xs text-indigo-700">System status</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-indigo-200 flex items-center justify-center">
                <Settings className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Tabbed Interface */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="chat-sessions" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat Sessions
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products & Assets
          </TabsTrigger>
          <TabsTrigger value="ai-training" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Training Center
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">System operational</span>
                    </div>
                    <Badge variant="secondary">Now</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">New chat session started</span>
                    </div>
                    <Badge variant="secondary">2 min ago</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">AI model updated</span>
                    </div>
                    <Badge variant="secondary">1 hour ago</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Database Performance</span>
                      <span>98%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>API Response Time</span>
                      <span>95%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage Utilization</span>
                      <span>67%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chat-sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat Session Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Chat Session Monitor</h3>
                <p className="text-muted-foreground mb-4">
                  Real-time monitoring and management of active chat sessions.
                </p>
                <Button>View Active Sessions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <ProductSeriesManager 
            onProductSelect={handleProductSelect}
            onProductEdit={handleProductEdit}
          />
        </TabsContent>

        <TabsContent value="ai-training" className="space-y-6">
          <AITrainingCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
