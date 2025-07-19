
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalProducts: number;
  activeChatSessions: number;
  chatSessionsThisMonth: number;
  knowledgeBaseEntries: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  isLoading: boolean;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeChatSessions: 0,
    chatSessionsThisMonth: 0,
    knowledgeBaseEntries: 0,
    recentActivity: [],
    isLoading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total active products
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // Fetch active chat sessions
        const { count: activeSessionsCount } = await supabase
          .from('chat_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Fetch chat sessions this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: monthlySessionsCount } = await supabase
          .from('chat_sessions')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth.toISOString());

        // Fetch knowledge base entries
        const { count: knowledgeCount } = await supabase
          .from('knowledge_base_entries')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // Fetch recent activity (last 10 chat sessions)
        const { data: recentSessions } = await supabase
          .from('chat_sessions')
          .select('id, created_at, status, name, company')
          .order('created_at', { ascending: false })
          .limit(10);

        const recentActivity = (recentSessions || []).map(session => ({
          id: session.id,
          type: 'chat',
          description: `New chat session${session.name ? ` with ${session.name}` : ''}${session.company ? ` from ${session.company}` : ''}`,
          timestamp: session.created_at,
        }));

        setStats({
          totalProducts: productsCount || 0,
          activeChatSessions: activeSessionsCount || 0,
          chatSessionsThisMonth: monthlySessionsCount || 0,
          knowledgeBaseEntries: knowledgeCount || 0,
          recentActivity,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return stats;
};
