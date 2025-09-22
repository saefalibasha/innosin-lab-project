import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityAlert {
  id: string;
  type: 'XSS_ATTEMPT' | 'SQL_INJECTION' | 'CSRF_ATTEMPT' | 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_ACTIVITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface SecurityMetrics {
  totalAttempts: number;
  blockedAttempts: number;
  lastIncident: Date | null;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const useEnhancedSecurityMonitoring = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalAttempts: 0,
    blockedAttempts: 0,
    lastIncident: null,
    riskLevel: 'LOW'
  });

  // Enhanced input validation with security patterns
  const validateInput = useCallback((input: string, type: 'text' | 'email' | 'url' | 'json' = 'text'): { isValid: boolean; threats: string[] } => {
    const threats: string[] = [];
    
    // XSS patterns
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /eval\s*\(/gi,
      /document\.cookie/gi,
      /window\.location/gi
    ];

    // SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|OR|AND)\b)/gi,
      /(-{2}|\/\*|\*\/)/g,
      /(\b(sleep|waitfor|delay)\s*\()/gi,
      /(\b(concat|char|ascii|substring)\s*\()/gi
    ];

    // CSRF patterns
    const csrfPatterns = [
      /\baction\s*=\s*["'][^"']*["']/gi,
      /\bmethod\s*=\s*["']post["']/gi
    ];

    // Check for XSS
    xssPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        threats.push('XSS_ATTEMPT');
      }
    });

    // Check for SQL injection
    sqlPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        threats.push('SQL_INJECTION');
      }
    });

    // Check for CSRF
    csrfPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        threats.push('CSRF_ATTEMPT');
      }
    });

    // Type-specific validation
    if (type === 'email' && input.includes('<') || input.includes('>')) {
      threats.push('XSS_ATTEMPT');
    }

    if (type === 'url' && !/^https?:\/\//.test(input) && input.includes('javascript:')) {
      threats.push('XSS_ATTEMPT');
    }

    // Length-based anomaly detection
    if (input.length > 10000) {
      threats.push('SUSPICIOUS_ACTIVITY');
    }

    return {
      isValid: threats.length === 0,
      threats: [...new Set(threats)] // Remove duplicates
    };
  }, []);

  // Log security events
  const logSecurityEvent = useCallback(async (
    type: SecurityAlert['type'],
    message: string,
    severity: SecurityAlert['severity'] = 'MEDIUM',
    metadata?: Record<string, any>
  ) => {
    const alert: SecurityAlert = {
      id: crypto.randomUUID(),
      type,
      severity,
      message,
      timestamp: new Date(),
      metadata
    };

    setAlerts(prev => [alert, ...prev.slice(0, 99)]); // Keep last 100 alerts

    // Log to Supabase
    try {
      await supabase.rpc('log_security_event', {
        p_action: type,
        p_resource: 'user_input',
        p_metadata: metadata || {}
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }

    // Update metrics
    setMetrics(prev => ({
      totalAttempts: prev.totalAttempts + 1,
      blockedAttempts: severity === 'HIGH' || severity === 'CRITICAL' ? prev.blockedAttempts + 1 : prev.blockedAttempts,
      lastIncident: new Date(),
      riskLevel: calculateRiskLevel(severity, prev.riskLevel)
    }));
  }, []);

  // Calculate risk level based on recent activity
  const calculateRiskLevel = (newSeverity: SecurityAlert['severity'], currentLevel: SecurityMetrics['riskLevel']): SecurityMetrics['riskLevel'] => {
    if (newSeverity === 'CRITICAL') return 'CRITICAL';
    if (newSeverity === 'HIGH' && currentLevel !== 'CRITICAL') return 'HIGH';
    if (newSeverity === 'MEDIUM' && currentLevel === 'LOW') return 'MEDIUM';
    return currentLevel;
  };

  // Enhanced rate limiting with IP tracking
  const checkRateLimit = useCallback(async (operation: string, maxAttempts = 5, windowMinutes = 60): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        operation_name: operation,
        max_attempts: maxAttempts,
        time_window_minutes: windowMinutes
      });

      if (error) throw error;

      if (!data) {
        await logSecurityEvent('RATE_LIMIT_EXCEEDED', `Rate limit exceeded for operation: ${operation}`, 'HIGH', {
          operation,
          maxAttempts,
          windowMinutes
        });
      }

      return data;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return false;
    }
  }, [logSecurityEvent]);

  // Sanitize input with security awareness
  const sanitizeInput = useCallback((input: string): string => {
    const validation = validateInput(input);
    
    if (!validation.isValid) {
      // Log the threat attempt
      validation.threats.forEach(threat => {
        logSecurityEvent(
          threat as SecurityAlert['type'],
          `Malicious input detected: ${threat}`,
          'HIGH',
          { originalInput: input.substring(0, 100) } // Log first 100 chars only
        );
      });
    }

    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi, '') // Remove SQL keywords
      .trim();
  }, [validateInput, logSecurityEvent]);

  // Auto-cleanup old alerts
  useEffect(() => {
    const cleanup = setInterval(() => {
      setAlerts(prev => prev.filter(alert => 
        Date.now() - alert.timestamp.getTime() < 24 * 60 * 60 * 1000 // Keep last 24 hours
      ));
    }, 60 * 60 * 1000); // Run every hour

    return () => clearInterval(cleanup);
  }, []);

  // Real-time security status
  const getSecurityStatus = useCallback((): { status: 'SECURE' | 'WARNING' | 'ALERT' | 'CRITICAL'; message: string } => {
    const recentAlerts = alerts.filter(alert => 
      Date.now() - alert.timestamp.getTime() < 60 * 60 * 1000 // Last hour
    );

    const criticalAlerts = recentAlerts.filter(alert => alert.severity === 'CRITICAL');
    const highAlerts = recentAlerts.filter(alert => alert.severity === 'HIGH');

    if (criticalAlerts.length > 0) {
      return { status: 'CRITICAL', message: `${criticalAlerts.length} critical security incidents detected` };
    }
    if (highAlerts.length > 3) {
      return { status: 'ALERT', message: `${highAlerts.length} high-severity security events detected` };
    }
    if (recentAlerts.length > 10) {
      return { status: 'WARNING', message: `Elevated security activity detected (${recentAlerts.length} events)` };
    }
    return { status: 'SECURE', message: 'Security status normal' };
  }, [alerts]);

  return {
    alerts,
    metrics,
    validateInput,
    logSecurityEvent,
    checkRateLimit,
    sanitizeInput,
    getSecurityStatus
  };
};