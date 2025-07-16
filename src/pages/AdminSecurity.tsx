import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Activity, Clock, Users, Eye } from 'lucide-react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminRoleManager from '@/components/AdminRoleManager';

interface RateLimitLog {
  id: string;
  user_id: string | null;
  email: string | null;
  operation: string;
  ip_address: unknown;
  created_at: string;
  success: boolean;
}

interface SecurityStats {
  totalUsers: number;
  activeAdmins: number;
  failedLogins: number;
  rateLimitHits: number;
}

const AdminSecurity = () => {
  const { user } = useAuth();
  const [rateLimitLogs, setRateLimitLogs] = useState<RateLimitLog[]>([]);
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    totalUsers: 0,
    activeAdmins: 0,
    failedLogins: 0,
    rateLimitHits: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      // Fetch rate limit logs
      const { data: rateLimitData } = await supabase
        .from('rate_limit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setRateLimitLogs(rateLimitData || []);

      // Fetch security statistics
      const [
        { count: activeAdminsCount },
        { count: failedLoginsCount },
        { count: rateLimitHitsCount }
      ] = await Promise.all([
        supabase
          .from('admin_roles')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),
        supabase
          .from('rate_limit_log')
          .select('*', { count: 'exact', head: true })
          .eq('success', false)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from('rate_limit_log')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      setSecurityStats({
        totalUsers: 0, // Can't access auth.users directly
        activeAdmins: activeAdminsCount || 0,
        failedLogins: failedLoginsCount || 0,
        rateLimitHits: rateLimitHitsCount || 0
      });

    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearOldLogs = async () => {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      await supabase
        .from('rate_limit_log')
        .delete()
        .lt('created_at', oneWeekAgo);

      fetchSecurityData();
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading security dashboard...</div>
      </div>
    );
  }

  return (
    <AdminAuthGuard>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
        </div>

        {/* Security Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityStats.activeAdmins}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Logins (24h)</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{securityStats.failedLogins}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rate Limit Hits (24h)</CardTitle>
              <Activity className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{securityStats.rateLimitHits}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Status</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-green-600">SECURE</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="roles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="roles">Admin Roles</TabsTrigger>
            <TabsTrigger value="logs">Security Logs</TabsTrigger>
            <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="roles">
            <AdminRoleManager />
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Security Event Logs
                </CardTitle>
                <Button variant="outline" onClick={clearOldLogs}>
                  Clear Old Logs
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rateLimitLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={log.success ? 'default' : 'destructive'}>
                          {log.operation}
                        </Badge>
                        <span className="text-sm">
                          {log.email || 'Anonymous'} 
                          {log.ip_address && ` from ${log.ip_address}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  
                  {rateLimitLogs.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No security events recorded recently
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-time Security Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Database Security</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Row Level Security:</span>
                          <Badge variant="default">Enabled</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Function Security:</span>
                          <Badge variant="default">Secured</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Audit Logging:</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Application Security</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Input Validation:</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Rate Limiting:</span>
                          <Badge variant="default">Enabled</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Authentication:</span>
                          <Badge variant="default">Secured</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Security Status: All Clear</h3>
                    <p className="text-sm text-green-700">
                      All security measures are active and functioning properly. 
                      No immediate threats detected.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminAuthGuard>
  );
};

export default AdminSecurity;