// Register or unregister Service Worker based on environment
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    // In development, ensure any existing SW is unregistered to avoid caching dev modules
    navigator.serviceWorker.getRegistrations().then((regs) => {
      const hadSW = regs.length > 0;
      regs.forEach((reg) => reg.unregister());
      console.log('[SW] Unregistered for development to avoid caching issues');
      if (hadSW) {
        // Reload once to ensure the page is no longer controlled by an old SW
        setTimeout(() => {
          // Avoid reload loops
          if (!sessionStorage.getItem('__sw_reloaded')) {
            sessionStorage.setItem('__sw_reloaded', '1');
            window.location.reload();
          }
        }, 50);
      }
    }).catch(() => {});
  } else if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[SW] registered:', registration);
        })
        .catch((err) => {
          console.log('[SW] registration failed:', err);
        });
    });
  }
}
