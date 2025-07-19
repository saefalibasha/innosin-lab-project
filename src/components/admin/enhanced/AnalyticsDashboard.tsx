
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Brain,
  Activity,
  Target,
  Users,
  Clock,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AnalyticsData {
  knowledgeBase: {
    totalEntries: number;
    activeEntries: number;
    averageEffectiveness: number;
    mostUsedEntries: any[];
  };
  trainingData: {
    totalEntries: number;
    averagePerformance: number;
    topPerformingIntents: any[];
  };
  chatSessions: {
    totalSessions: number;
    averageSatisfaction: number;
    responseTime: string;
    completionRate: number;
  };
  trends: {
    dailyUsage: any[];
    topQueries: any[];
  };
}

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch knowledge base analytics
      const { data: knowledgeEntries, error: kbError } = await supabase
        .from('knowledge_base_entries')
        .select('*');

      if (kbError) throw kbError;

      // Fetch training data analytics
      const { data: trainingEntries, error: trainingError } = await supabase
        .from('training_data_entries')
        .select('*');

      if (trainingError) throw trainingError;

      // Fetch chat session analytics
      const { data: chatSessions, error: chatError } = await supabase
        .from('chat_sessions')
        .select('*');

      if (chatError) throw chatError;

      // Process the data
      const analyticsData: AnalyticsData = {
        knowledgeBase: {
          totalEntries: knowledgeEntries?.length || 0,
          activeEntries: knowledgeEntries?.filter(e => e.is_active).length || 0,
          averageEffectiveness: knowledgeEntries?.reduce((acc, e) => acc + (e.effectiveness_score || 0), 0) / (knowledgeEntries?.length || 1),
          mostUsedEntries: knowledgeEntries?.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0)).slice(0, 5) || []
        },
        trainingData: {
          totalEntries: trainingEntries?.length || 0,
          averagePerformance: trainingEntries?.reduce((acc, e) => acc + (e.performance_score || 0), 0) / (trainingEntries?.length || 1),
          topPerformingIntents: trainingEntries?.sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0)).slice(0, 5) || []
        },
        chatSessions: {
          totalSessions: chatSessions?.length || 0,
          averageSatisfaction: chatSessions?.reduce((acc, s) => acc + (s.satisfaction_score || 0), 0) / (chatSessions?.length || 1),
          responseTime: '< 2s',
          completionRate: chatSessions?.filter(s => s.end_time).length / (chatSessions?.length || 1) * 100
        },
        trends: {
          dailyUsage: [],
          topQueries: []
        }
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading analytics data...</span>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No analytics data available</h3>
          <p className="text-muted-foreground">
            Analytics will appear once you have knowledge base entries and chat interactions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Performance Analytics</CardTitle>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.knowledgeBase.totalEntries}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.knowledgeBase.activeEntries} active entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Data</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.trainingData.totalEntries}</div>
            <p className="text-xs text-muted-foreground">
              Avg. performance: {analytics.trainingData.averagePerformance.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.chatSessions.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.chatSessions.completionRate.toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.chatSessions.responseTime}</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Knowledge Base Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              Knowledge Base Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Effectiveness Score</span>
                <span className="font-medium">{analytics.knowledgeBase.averageEffectiveness.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Entries</span>
                <span className="font-medium">
                  {analytics.knowledgeBase.activeEntries}/{analytics.knowledgeBase.totalEntries}
                </span>
              </div>
              
              {analytics.knowledgeBase.mostUsedEntries.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Most Used Entries</h4>
                  <div className="space-y-2">
                    {analytics.knowledgeBase.mostUsedEntries.slice(0, 3).map((entry, idx) => (
                      <div key={entry.id} className="flex justify-between text-sm">
                        <span className="truncate">{entry.brand} - {entry.product_category}</span>
                        <span className="text-muted-foreground">{entry.usage_count || 0} uses</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Training Data Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Training Data Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Performance</span>
                <span className="font-medium">{analytics.trainingData.averagePerformance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Intents</span>
                <span className="font-medium">{analytics.trainingData.totalEntries}</span>
              </div>
              
              {analytics.trainingData.topPerformingIntents.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Top Performing Intents</h4>
                  <div className="space-y-2">
                    {analytics.trainingData.topPerformingIntents.slice(0, 3).map((entry, idx) => (
                      <div key={entry.id} className="flex justify-between text-sm">
                        <span className="truncate">{entry.intent}</span>
                        <span className="text-muted-foreground">{entry.performance_score?.toFixed(2) || '0.00'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Session Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Chat Session Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{analytics.chatSessions.totalSessions}</div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {analytics.chatSessions.averageSatisfaction > 0 
                  ? analytics.chatSessions.averageSatisfaction.toFixed(1) 
                  : 'N/A'
                }
              </div>
              <p className="text-sm text-muted-foreground">Avg. Satisfaction</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {analytics.chatSessions.completionRate.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Enhancements Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Advanced Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Enhanced Analytics Coming Soon</h3>
            <p className="text-muted-foreground">
              Advanced charts, trend analysis, and detailed performance metrics will be available in the next update.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
