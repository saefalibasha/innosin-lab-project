// Service worker with safe caching for production builds
const CACHE_NAME = 'innosin-lab-v4';
const CORE_URLS = [
  '/',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_URLS))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const sameOrigin = request.url.startsWith(self.location.origin);

  if (request.method !== 'GET' || !sameOrigin) return;

  const url = new URL(request.url);
  const isAsset = url.pathname.startsWith('/assets/');
  const isScript = request.destination === 'script' || url.pathname.endsWith('.js');
  const isNavigation = request.mode === 'navigate';

  // Network-first for app shell navigation and JS chunks to avoid stale builds
  if (isNavigation || isAsset || isScript) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const respClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, respClone));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || Response.error();
        })
    );
    return;
  }

  // Cache-first for other static GETs
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200) {
          const respClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, respClone));
        }
        return response;
      });
    })
  );
});