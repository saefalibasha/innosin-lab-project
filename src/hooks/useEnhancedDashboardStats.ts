
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedDashboardStats {
  totalProducts: number;
  activeChatSessions: number;
  chatSessionsThisMonth: number;
  chatSessionsToday: number;
  knowledgeBaseEntries: number;
  totalChatMessages: number;
  averageSessionDuration: number;
  hubspotSyncedSessions: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status?: string;
  }>;
  chatMetrics: {
    totalSessions: number;
    completedSessions: number;
    averageSatisfaction: number;
    responseTime: string;
  };
  isLoading: boolean;
}

export const useEnhancedDashboardStats = () => {
  const [stats, setStats] = useState<EnhancedDashboardStats>({
    totalProducts: 0,
    activeChatSessions: 0,
    chatSessionsThisMonth: 0,
    chatSessionsToday: 0,
    knowledgeBaseEntries: 0,
    totalChatMessages: 0,
    averageSessionDuration: 0,
    hubspotSyncedSessions: 0,
    recentActivity: [],
    chatMetrics: {
      totalSessions: 0,
      completedSessions: 0,
      averageSatisfaction: 0,
      responseTime: '~250ms',
    },
    isLoading: true,
  });

  useEffect(() => {
    const fetchEnhancedStats = async () => {
      try {
        // Fetch all stats in parallel
        const [
          productsResult,
          activeSessionsResult,
          monthlySessionsResult,
          todaySessionsResult,
          knowledgeResult,
          messagesResult,
          hubspotSyncedResult,
          recentSessionsResult,
          completedSessionsResult,
          satisfactionResult
        ] = await Promise.all([
          // Total active products
          supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true),
          
          // Active chat sessions
          supabase
            .from('chat_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active'),
          
          // Chat sessions this month
          supabase
            .from('chat_sessions')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
          
          // Chat sessions today
          supabase
            .from('chat_sessions')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', new Date().toISOString().split('T')[0] + 'T00:00:00.000Z'),
          
          // Knowledge base entries
          supabase
            .from('knowledge_base_entries')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true),
          
          // Total chat messages
          supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true }),
          
          // HubSpot synced sessions
          supabase
            .from('chat_sessions')
            .select('*', { count: 'exact', head: true })
            .not('hubspot_contact_id', 'is', null),
          
          // Recent sessions for activity feed
          supabase
            .from('chat_sessions')
            .select('id, created_at, status, name, company, email, satisfaction_score')
            .order('created_at', { ascending: false })
            .limit(15),
          
          // Completed sessions for metrics
          supabase
            .from('chat_sessions')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'active'),
          
          // Average satisfaction score
          supabase
            .from('chat_sessions')
            .select('satisfaction_score')
            .not('satisfaction_score', 'is', null)
        ]);

        // Process satisfaction scores
        const satisfactionScores = satisfactionResult.data?.map(s => s.satisfaction_score).filter(Boolean) || [];
        const averageSatisfaction = satisfactionScores.length > 0 
          ? satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length 
          : 0;

        // Build recent activity from sessions
        const recentActivity = (recentSessionsResult.data || []).map(session => ({
          id: session.id,
          type: session.status === 'active' ? 'chat_active' : 'chat_completed',
          description: `${session.status === 'active' ? 'Active chat' : 'Chat completed'}${session.name ? ` with ${session.name}` : ''}${session.company ? ` from ${session.company}` : ''}${session.satisfaction_score ? ` (${session.satisfaction_score}⭐)` : ''}`,
          timestamp: session.created_at,
          status: session.status,
        }));

        setStats({
          totalProducts: productsResult.count || 0,
          activeChatSessions: activeSessionsResult.count || 0,
          chatSessionsThisMonth: monthlySessionsResult.count || 0,
          chatSessionsToday: todaySessionsResult.count || 0,
          knowledgeBaseEntries: knowledgeResult.count || 0,
          totalChatMessages: messagesResult.count || 0,
          averageSessionDuration: 0, // TODO: Calculate from session data
          hubspotSyncedSessions: hubspotSyncedResult.count || 0,
          recentActivity,
          chatMetrics: {
            totalSessions: (monthlySessionsResult.count || 0),
            completedSessions: completedSessionsResult.count || 0,
            averageSatisfaction: Math.round(averageSatisfaction * 10) / 10,
            responseTime: '~250ms',
          },
          isLoading: false,
        });
      } catch (error) {
        console.error('Error fetching enhanced dashboard stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchEnhancedStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchEnhancedStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return stats;
};
