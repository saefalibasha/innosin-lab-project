
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseOptimizedRealtimeProps {
  onUpdate?: () => void;
  enabled?: boolean;
  debounceMs?: number;
}

export const useOptimizedRealtime = ({ 
  onUpdate, 
  enabled = true, 
  debounceMs = 1000 
}: UseOptimizedRealtimeProps) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const updateCountRef = useRef(0);

  const debouncedUpdate = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (onUpdate) {
        console.log(`🔄 Real-time update triggered (batched ${updateCountRef.current} changes)`);
        onUpdate();
        updateCountRef.current = 0;
      }
    }, debounceMs);
  }, [onUpdate, debounceMs]);

  useEffect(() => {
    if (!enabled || !onUpdate) return;

    console.log('🔄 Setting up optimized real-time subscription...');
    
    const channel = supabase
      .channel('products-optimized')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'products',
          filter: 'is_series_parent=eq.true'
        },
        (payload) => {
          console.log('📡 Real-time update received:', payload.eventType);
          updateCountRef.current++;
          debouncedUpdate();
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Cleaning up optimized real-time subscription');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [enabled, onUpdate, debouncedUpdate]);

  return null;
};
