import React, { useEffect, useRef } from 'react';

interface GoogleMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  height?: string;
  title?: string;
  className?: string;
}

const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const TRACKING_ID = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

let loaderPromise: Promise<typeof google> | null = null;

const loadGoogleMaps = (): Promise<typeof google> => {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if ((window as any).google?.maps) return Promise.resolve((window as any).google);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    if (!BROWSER_KEY) {
      reject(new Error('Missing Google Maps browser key'));
      return;
    }
    const cbName = `__initGoogleMap_${Date.now()}`;
    (window as any)[cbName] = () => {
      resolve((window as any).google);
      delete (window as any)[cbName];
    };
    const script = document.createElement('script');
    const params = new URLSearchParams({
      key: BROWSER_KEY,
      loading: 'async',
      callback: cbName,
      v: 'weekly',
    });
    if (TRACKING_ID) params.set('channel', TRACKING_ID);
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
  return loaderPromise;
};

const GoogleMap: React.FC<GoogleMapProps> = ({
  lat,
  lng,
  zoom = 16,
  height = '700px',
  title,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !containerRef.current) return;
        const position = { lat, lng };
        if (!mapRef.current) {
          mapRef.current = new google.maps.Map(containerRef.current, {
            center: position,
            zoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          });
          markerRef.current = new google.maps.Marker({
            position,
            map: mapRef.current,
            title,
          });
        } else {
          mapRef.current.setCenter(position);
          mapRef.current.setZoom(zoom);
          markerRef.current?.setPosition(position);
          if (title) markerRef.current?.setTitle(title);
        }
      })
      .catch((err) => {
        console.error('GoogleMap load error:', err);
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lng, zoom, title]);

  if (!BROWSER_KEY) {
    return (
      <div
        className={`flex items-center justify-center bg-muted text-muted-foreground text-sm p-4 ${className}`}
        style={{ height }}
      >
        Map unavailable: Google Maps key not configured.
      </div>
    );
  }

  return <div ref={containerRef} className={className} style={{ height, width: '100%' }} />;
};

export default GoogleMap;
