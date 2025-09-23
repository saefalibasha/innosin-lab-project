import { lazy, Suspense } from 'react';

const LazyMapContainer = lazy(() => 
  import('react-leaflet').then(module => ({ default: module.MapContainer }))
);

const LazyTileLayer = lazy(() => 
  import('react-leaflet').then(module => ({ default: module.TileLayer }))
);

const LazyMarker = lazy(() => 
  import('react-leaflet').then(module => ({ default: module.Marker }))
);

const LazyPopup = lazy(() => 
  import('react-leaflet').then(module => ({ default: module.Popup }))
);

export const MapContainer = (props: any) => (
  <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}>
    <LazyMapContainer {...props} />
  </Suspense>
);

export const TileLayer = (props: any) => (
  <Suspense fallback={null}>
    <LazyTileLayer {...props} />
  </Suspense>
);

export const Marker = (props: any) => (
  <Suspense fallback={null}>
    <LazyMarker {...props} />
  </Suspense>
);

export const Popup = (props: any) => (
  <Suspense fallback={null}>
    <LazyPopup {...props} />
  </Suspense>
);