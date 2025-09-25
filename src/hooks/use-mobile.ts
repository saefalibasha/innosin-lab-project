// src/hooks/use-mobile.ts
// Lightweight responsive hook to detect mobile screens safely
// Works in SSR/CSR by guarding window access
import { useEffect, useState } from 'react';

export function useIsMobile(breakpoint: number = 768) {
  const getInitial = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia ? window.matchMedia(`(max-width: ${breakpoint}px)`).matches : window.innerWidth <= breakpoint;
  };

  const [isMobile, setIsMobile] = useState<boolean>(getInitial);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    // Set initial state in case of hydration/SSR
    setIsMobile(media.matches);

    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else {
      // Safari <14 fallback
      // @ts-ignore
      media.addListener(listener);
      // @ts-ignore
      return () => media.removeListener(listener);
    }
  }, [breakpoint]);

  return isMobile;
}
