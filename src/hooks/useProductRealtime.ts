
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UseProductRealtimeProps {
  onProductChange?: () => void;
  onSeriesChange?: () => void;
  enabled?: boolean;
}

export const useProductRealtime = ({ onProductChange, onSeriesChange, enabled = true }: UseProductRealtimeProps) => {
  useEffect(() => {
    if (!enabled) return;

    console.log('🔄 Setting up real-time product updates...');
    
    // Create unique channel name to avoid conflicts
    const channelName = `products-changes-${Math.random().toString(36).substr(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('📡 Real-time product update received:', payload);
          onProductChange?.();
          onSeriesChange?.();
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [enabled]); // Removed callback dependencies to prevent re-subscriptions

  return null;
};
