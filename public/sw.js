
// This is a minimal service worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch event handler for caching
self.addEventListener('fetch', (event) => {
  // Default fetch behavior
  event.respondWith(fetch(event.request));
});
