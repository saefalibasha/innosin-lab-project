import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SecurityEvent {
  id: string;
  operation: string;
  email?: string;
  ip_address?: string;
  success: boolean;
  created_at: string;
}

const SecurityAuditLog = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityEvents();
  }, []);

  const fetchSecurityEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('rate_limit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Transform the data to ensure ip_address is properly typed
      const transformedData = (data || []).map(event => ({
        ...event,
        ip_address: event.ip_address ? String(event.ip_address) : undefined
      }));
      
      setEvents(transformedData);
    } catch (error) {
      console.error('Error fetching security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (operation: string, success: boolean) => {
    if (!success) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    
    switch (operation) {
      case 'signin':
      case 'signup':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getEventColor = (success: boolean) => {
    return success ? 'default' : 'destructive';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading security events...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Audit Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-4">
                {getEventIcon(event.operation, event.success)}
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">
                      {event.operation.replace('_', ' ')}
                    </span>
                    <Badge variant={getEventColor(event.success)}>
                      {event.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground flex items-center gap-4">
                    {event.email && (
                      <span>Email: {event.email}</span>
                    )}
                    {event.ip_address && (
                      <span>IP: {event.ip_address}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {new Date(event.created_at).toLocaleString()}
              </div>
            </div>
          ))}
          
          {events.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No security events recorded yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityAuditLog;
