
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function UpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      try {
        // Register service worker
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);

            // Check if there's a waiting service worker
            if (registration.waiting) {
              setUpdateAvailable(true);
              showUpdateToast();
            }

            // When a new service worker is waiting
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    setUpdateAvailable(true);
                    showUpdateToast();
                  }
                });
              }
            });
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });

        // Detect controller change and refresh the page
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });
      } catch (error) {
        console.error('Error registering service worker:', error);
      }
    }
  }, []);

  const reloadPage = () => {
    // Send message to service worker to skip waiting
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
    setUpdateAvailable(false);
  };

  // Show update toast when available
  const showUpdateToast = () => {
    if (updateAvailable) {
      toast.message("App update available", {
        description: "A new version is available. Refresh to update.",
        action: {
          label: "Update",
          onClick: reloadPage
        },
        duration: Infinity
      });
    }
  };

  return null;
}
