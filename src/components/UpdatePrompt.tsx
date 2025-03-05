
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

export function UpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    // Listen for update notifications from the service worker
    const handleUpdateReady = (event: MessageEvent) => {
      if (event.data && event.data.type === 'UPDATE_READY') {
        setShowUpdatePrompt(true);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleUpdateReady);
    
    // Check if there's a waiting worker when component mounts
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.waiting) {
          setShowUpdatePrompt(true);
        }
      });
    }

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleUpdateReady);
    };
  }, []);

  const handleUpdate = () => {
    // Send message to service worker to skip waiting
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page after updating
      window.location.reload();
      setShowUpdatePrompt(false);
      
      toast.success("App updated to the latest version!", {
        duration: 3000,
      });
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
    toast.info("Update postponed. You can update later.", {
      duration: 3000,
    });
  };

  return (
    <Dialog open={showUpdatePrompt} onOpenChange={setShowUpdatePrompt}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            Update Available
          </DialogTitle>
          <DialogDescription>
            A new version of the app is available. Update now to get the latest features and improvements.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" onClick={handleDismiss}>
            Later
          </Button>
          <Button onClick={handleUpdate} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Update Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
