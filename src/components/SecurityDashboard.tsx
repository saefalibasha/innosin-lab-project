import React from 'react';
import { useEnhancedSecurityMonitoring } from '@/hooks/useSecurityMonitoring.enhanced';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const SecurityDashboard: React.FC = () => {
  const { alerts, metrics, getSecurityStatus } = useEnhancedSecurityMonitoring();
  const securityStatus = getSecurityStatus();

  const getStatusIcon = () => {
    switch (securityStatus.status) {
      case 'SECURE':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'ALERT':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'CRITICAL':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadgeVariant = () => {
    switch (securityStatus.status) {
      case 'SECURE':
        return 'default';
      case 'WARNING':
        return 'secondary';
      case 'ALERT':
        return 'destructive';
      case 'CRITICAL':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW':
        return 'text-blue-500';
      case 'MEDIUM':
        return 'text-yellow-500';
      case 'HIGH':
        return 'text-orange-500';
      case 'CRITICAL':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Status
          </CardTitle>
          <CardDescription>Real-time security monitoring and threat detection</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <AlertTitle>Status: {securityStatus.status}</AlertTitle>
            </div>
            <AlertDescription>{securityStatus.message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAttempts}</div>
            <p className="text-xs text-muted-foreground">Security events detected</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Blocked Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{metrics.blockedAttempts}</div>
            <p className="text-xs text-muted-foreground">Malicious attempts blocked</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={getStatusBadgeVariant()}>
              {metrics.riskLevel}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Current threat level</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Alerts</CardTitle>
          <CardDescription>Latest security events and threat detections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No security alerts detected</p>
            ) : (
              alerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <span className="text-sm font-medium">{alert.type.replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    {alert.metadata && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-muted-foreground">
                          Show details
                        </summary>
                        <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                          {JSON.stringify(alert.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground ml-4">
                    {alert.timestamp.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;