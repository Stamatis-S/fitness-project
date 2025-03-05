
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

// Cache the underlying font files with a cache-first strategy for 1 year.
registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      }),
    ],
  })
);

// Cache images
registerRoute(
  /\.(?:png|gif|jpg|jpeg|svg)$/,
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// Use a stale-while-revalidate strategy for all other requests.
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html')),
);

// Background sync for offline workout submissions
const workoutSyncPlugin = new BackgroundSyncPlugin('workout-sync-queue', {
  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
});

// Register route for API calls that should use background sync
registerRoute(
  /\/api\/workouts/,
  async ({url, request, event, params}) => {
    try {
      const response = await fetch(request.clone());
      return response;
    } catch (error) {
      await workoutSyncPlugin.addRequest({request}); // Fixed: changed pushRequest to addRequest
      return new Response('Offline, request queued', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    }
  },
  'POST'
);

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Service worker gets installed
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Service worker gets activated
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // Delete old version caches
          return cacheName.startsWith('workbox-') && !cacheName.endsWith('-v1');
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url)
    );
  }
});
