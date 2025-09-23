// Simple service worker for static asset caching
const CACHE_NAME = 'innosin-lab-v1';
const CACHE_URLS = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  '/videos/landing-intro-v4.mp4',
  '/fonts/inter.woff2'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(CACHE_URLS);
      })
      .catch(() => {
        // Fail silently to not break functionality
      })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', (event) => {
  // Only cache GET requests for same origin
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Cache successful responses
            if (fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                })
                .catch(() => {
                  // Fail silently
                });
            }
            return fetchResponse;
          });
      })
      .catch(() => {
        // Return network request on cache failure
        return fetch(event.request);
      })
  );
});