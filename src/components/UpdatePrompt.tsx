
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { registerSW } from 'virtual:pwa-register';

export function UpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    try {
      // Use vite-plugin-pwa's registerSW function
      const updateSW = registerSW({
        onNeedRefresh() {
          setUpdateAvailable(true);
          showUpdateToast();
        },
        onOfflineReady() {
          toast.success("App ready for offline use");
        },
      });

      // No need to directly interact with service worker anymore
      return () => {
        // Clean up
      };
    } catch (error) {
      console.error('Error registering service worker:', error);
    }
  }, []);

  const reloadPage = () => {
    // Will automatically trigger the update
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
