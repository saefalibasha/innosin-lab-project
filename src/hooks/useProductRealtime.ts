
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseProductRealtimeProps {
  onProductChange?: () => void;
  onSeriesChange?: () => void;
  enabled?: boolean;
}

export const useProductRealtime = ({ 
  onProductChange, 
  onSeriesChange, 
  enabled = true 
}: UseProductRealtimeProps = {}) => {
  const handleProductUpdate = useCallback((payload: any) => {
    console.log('Product updated:', payload);
    
    // Check if it's a series parent update
    if (payload.new?.is_series_parent) {
      onSeriesChange?.();
    } else {
      onProductChange?.();
    }
  }, [onProductChange, onSeriesChange]);

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel('products-realtime-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        handleProductUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, handleProductUpdate]);
};
