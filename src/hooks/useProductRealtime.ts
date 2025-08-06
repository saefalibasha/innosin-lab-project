
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseProductRealtimeProps {
  onSeriesChange?: () => void;
  enabled?: boolean;
}

export const useProductRealtime = ({ onSeriesChange, enabled = true }: UseProductRealtimeProps) => {
  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Product change detected:', payload);
          onSeriesChange?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onSeriesChange, enabled]);
};
