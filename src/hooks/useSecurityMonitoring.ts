import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  action: string;
  resource?: string;
  resource_id?: string;
  metadata?: Record<string, any>;
}

interface SecurityMetrics {
  failedLoginAttempts: number;
  suspiciousActivity: number;
  dataAccessEvents: number;
  adminActions: number;
}

export const useSecurityMonitoring = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    failedLoginAttempts: 0,
    suspiciousActivity: 0,
    dataAccessEvents: 0,
    adminActions: 0
  });
  const { toast } = useToast();

  const logSecurityEvent = useCallback(async (event: SecurityEvent) => {
    try {
      const { error } = await supabase.rpc('log_security_event', {
        p_action: event.action,
        p_resource: event.resource,
        p_resource_id: event.resource_id,
        p_metadata: event.metadata || {}
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Security logging error:', error);
    }
  }, []);

  const validateInput = useCallback((input: any, type: 'email' | 'text' | 'url' | 'json'): boolean => {
    if (!input) return false;

    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) && input.length <= 254;
      
      case 'text':
        return typeof input === 'string' && input.length <= 5000 && !/<script|javascript:|data:|vbscript:/i.test(input);
      
      case 'url':
        try {
          new URL(input);
          return !input.includes('javascript:') && !input.includes('data:');
        } catch {
          return false;
        }
      
      case 'json':
        try {
          JSON.parse(input);
          return true;
        } catch {
          return false;
        }
      
      default:
        return false;
    }
  }, []);

  const detectSuspiciousActivity = useCallback(async (activity: string, data?: any) => {
    const suspiciousPatterns = [
      /union.*select/i,
      /script.*alert/i,
      /<script/i,
      /javascript:/i,
      /eval\(/i,
      /exec\(/i
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(activity) || (data && JSON.stringify(data).match(pattern))
    );

    if (isSuspicious) {
      await logSecurityEvent({
        action: 'suspicious_activity_detected',
        resource: 'user_input',
        metadata: { activity, data: JSON.stringify(data)?.slice(0, 1000) }
      });

      toast({
        title: "Security Alert",
        description: "Suspicious activity detected and logged.",
        variant: "destructive"
      });

      return true;
    }

    return false;
  }, [logSecurityEvent, toast]);

  const checkRateLimit = useCallback(async (operation: string, maxAttempts = 5, windowMinutes = 1) => {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        operation_name: operation,
        max_attempts: maxAttempts,
        time_window_minutes: windowMinutes
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Allow by default if check fails
      }

      const allowed = data as boolean;
      
      if (!allowed) {
        await logSecurityEvent({
          action: 'rate_limit_exceeded',
          resource: operation,
          metadata: { maxAttempts, windowMinutes }
        });

        toast({
          title: "Rate Limit Exceeded",
          description: `Too many ${operation} attempts. Please try again later.`,
          variant: "destructive"
        });
      }

      return allowed;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow by default
    }
  }, [logSecurityEvent, toast]);

  const loadSecurityMetrics = useCallback(async () => {
    try {
      setIsMonitoring(true);
      
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get failed login attempts
      const { data: failedLogins } = await supabase
        .from('security_audit_log')
        .select('id')
        .eq('action', 'failed_login')
        .gte('created_at', twentyFourHoursAgo.toISOString());

      // Get suspicious activity
      const { data: suspiciousEvents } = await supabase
        .from('security_audit_log')
        .select('id')
        .eq('action', 'suspicious_activity_detected')
        .gte('created_at', twentyFourHoursAgo.toISOString());

      // Get data access events
      const { data: dataAccess } = await supabase
        .from('security_audit_log')
        .select('id')
        .in('action', ['data_export', 'sensitive_data_access'])
        .gte('created_at', twentyFourHoursAgo.toISOString());

      // Get admin actions
      const { data: adminActions } = await supabase
        .from('security_audit_log')
        .select('id')
        .like('action', 'admin_%')
        .gte('created_at', twentyFourHoursAgo.toISOString());

      setMetrics({
        failedLoginAttempts: failedLogins?.length || 0,
        suspiciousActivity: suspiciousEvents?.length || 0,
        dataAccessEvents: dataAccess?.length || 0,
        adminActions: adminActions?.length || 0
      });

    } catch (error) {
      console.error('Failed to load security metrics:', error);
    } finally {
      setIsMonitoring(false);
    }
  }, []);

  // Auto-refresh metrics
  useEffect(() => {
    loadSecurityMetrics();
    const interval = setInterval(loadSecurityMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [loadSecurityMetrics]);

  return {
    logSecurityEvent,
    validateInput,
    detectSuspiciousActivity,
    checkRateLimit,
    loadSecurityMetrics,
    metrics,
    isMonitoring
  };
};