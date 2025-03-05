
/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Add proper type declaration
declare const self: ServiceWorkerGlobalScope;

// Use clientsClaim to take control immediately
clientsClaim();

// Precache assets from the manifest
const manifestEntries = self.__WB_MANIFEST;
precacheAndRoute(manifestEntries);

// Set up offline fallback
const navigationHandler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(navigationHandler, {
  // Exclude URLs that should not be handled by the navigation route
  denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
});
registerRoute(navigationRoute);

// Background sync plugin for workout data
const workoutSyncPlugin = new BackgroundSyncPlugin('workout-data-queue', {
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours (in minutes)
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
        console.log('Sync successful for request', entry.request.url);
      } catch (error) {
        console.error('Error replaying queued request:', error);
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  }
});

// Set up event listener for update notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Register custom handler for update notifications
self.addEventListener('updatefound', () => {
  const newWorker = self.registration.installing;
  
  if (newWorker) {
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && self.registration.active) {
        // New service worker is installed, but waiting
        // Notify all clients there's an update ready
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'UPDATE_READY' });
          });
        });
      }
    });
  }
});

// Manually handle offline workout submissions
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('workout_logs') && event.request.method === 'POST') {
    const bgSyncLogic = async () => {
      try {
        const response = await fetch(event.request.clone());
        return response;
      } catch (error) {
        // If offline, add to background sync queue
        await workoutSyncPlugin.queue.pushRequest({ request: event.request.clone() });
        return new Response(JSON.stringify({ 
          queued: true,
          message: "Your workout has been saved and will be uploaded when you're back online."
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    };

    event.respondWith(bgSyncLogic());
  }
});

// Log service worker lifecycle events for debugging
self.addEventListener('install', (event) => {
  console.log('Service worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
});
