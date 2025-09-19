import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, AlertCircle, CheckCircle, Clock, Users, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface IntegrationLog {
  id: string;
  action: string;
  success: boolean;
  hubspot_object_type: string | null;
  hubspot_object_id: string | null;
  error_message: string | null;
  request_data: any;
  response_data: any;
  created_at: string;
  session_id: string | null;
}

interface ChatSession {
  id: string;
  session_id: string;
  email: string | null;
  name: string | null;
  company: string | null;
  status: string;
  hubspot_contact_id: string | null;
  hubspot_deal_id: string | null;
  hubspot_ticket_id: string | null;
  created_at: string;
  last_activity: string;
}

const HubSpotMonitor = () => {
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLogs: 0,
    successRate: 0,
    activeSessions: 0,
    recentErrors: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch integration logs
      const { data: logsData, error: logsError } = await supabase
        .from('hubspot_integration_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      // Fetch chat sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('last_activity', { ascending: false })
        .limit(30);

      if (sessionsError) throw sessionsError;

      setLogs(logsData || []);
      setSessions(sessionsData || []);

      // Calculate stats
      const totalLogs = logsData?.length || 0;
      const successfulLogs = logsData?.filter(log => log.success).length || 0;
      const successRate = totalLogs > 0 ? (successfulLogs / totalLogs) * 100 : 0;
      const activeSessions = sessionsData?.filter(session => session.status === 'active').length || 0;
      const recentErrors = logsData?.filter(log => 
        !log.success && 
        new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length || 0;

      setStats({
        totalLogs,
        successRate,
        activeSessions,
        recentErrors
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch monitoring data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge variant="default" className="gap-1">
        <CheckCircle className="h-3 w-3" />
        Success
      </Badge>
    ) : (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        Failed
      </Badge>
    );
  };

  const getSessionStatusBadge = (status: string) => {
    const variant = status === 'active' ? 'default' : 
                   status === 'completed' ? 'secondary' : 'outline';
    return (
      <Badge variant={variant}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">HubSpot Integration Monitor</h1>
          <p className="text-muted-foreground">
            Monitor HubSpot integration health and view recent activity
          </p>
        </div>
        <Button onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
            <p className="text-xs text-muted-foreground">Last 50 attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Integration success</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
            <p className="text-xs text-muted-foreground">Current chat sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentErrors}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Integration Logs
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Users className="h-4 w-4" />
            Chat Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Recent HubSpot Integration Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{log.action}</span>
                          {getStatusBadge(log.success)}
                          {log.hubspot_object_type && (
                            <Badge variant="outline">{log.hubspot_object_type}</Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                      
                      {log.hubspot_object_id && (
                        <p className="text-sm text-muted-foreground">
                          HubSpot ID: {log.hubspot_object_id}
                        </p>
                      )}
                      
                      {log.error_message && (
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {log.error_message}
                        </p>
                      )}
                      
                      {log.request_data && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground">
                            View Request Data
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(log.request_data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                  
                  {logs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No integration logs found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Chat Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {session.name || session.email || session.session_id}
                          </span>
                          {getSessionStatusBadge(session.status)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(session.created_at)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <span className="ml-2">{session.email || 'Not provided'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Company:</span>
                          <span className="ml-2">{session.company || 'Not provided'}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">HubSpot Contact:</span>
                          <span className="ml-2">
                            {session.hubspot_contact_id ? (
                              <Badge variant="outline">Created</Badge>
                            ) : (
                              <Badge variant="secondary">Not Created</Badge>
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Activity:</span>
                          <span className="ml-2">{formatDate(session.last_activity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {sessions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No chat sessions found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HubSpotMonitor;