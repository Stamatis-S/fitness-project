
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function UpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Simplified service worker registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          
          console.log('Service Worker registered with scope:', registration.scope);

          // Check for updates
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
          
          // Handle controller change
          let refreshing = false;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
              refreshing = true;
              window.location.reload();
            }
          });
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      });
    }
  }, []);

  const reloadPage = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
    setUpdateAvailable(false);
  };

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
