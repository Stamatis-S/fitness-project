
// This is a minimal service worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('Service worker installed');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
  console.log('Service worker activated');
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Simple fetch handler that doesn't try to read directories
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Network error', { status: 408 });
    })
  );
});
