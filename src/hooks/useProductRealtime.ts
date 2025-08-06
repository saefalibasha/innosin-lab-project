
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
    
    const channel = supabase
      .channel('products-changes')
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
  }, [onProductChange, onSeriesChange, enabled]);

  return null;
};
