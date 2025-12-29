import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useNavigate } from "react-router-dom";
import { useHaptic } from "@/hooks/useHaptic";

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const navigate = useNavigate();
  const { vibrate } = useHaptic();

  useEffect(() => {
    // Check if banner was dismissed before
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    vibrate('light');
    setIsDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  const handleInstall = async () => {
    vibrate('light');
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      const success = await promptInstall();
      if (success) {
        handleDismiss();
      }
    }
  };

  // Don't show if already installed, dismissed, or not installable
  if (isInstalled || isDismissed || !isInstallable) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20 rounded-ios-lg p-4 relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">Εγκατάσταση Εφαρμογής</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isIOS 
                  ? "Πρόσθεσε στην αρχική οθόνη για καλύτερη εμπειρία"
                  : "Εγκατάστησε για offline πρόσβαση"
                }
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={handleInstall}
                variant="ios"
                size="sm"
                className="h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isIOS ? "Πώς;" : "Εγκατάσταση"}
              </Button>
              <button
                onClick={handleDismiss}
                className="p-2 rounded-lg hover:bg-ios-fill transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* iOS Instructions Modal */}
      <AnimatePresence>
        {showIOSInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowIOSInstructions(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-ios-surface rounded-ios-xl p-6 space-y-5 safe-area-bottom"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Εγκατάσταση στο iPhone</h2>
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="p-2 rounded-lg hover:bg-ios-fill transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Πάτα το κουμπί Share</p>
                    <div className="mt-2 p-3 bg-ios-surface-elevated rounded-ios inline-flex items-center gap-2">
                      <Share className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Επίλεξε "Add to Home Screen"</p>
                    <div className="mt-2 p-3 bg-ios-surface-elevated rounded-ios inline-flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      <span className="text-sm">Add to Home Screen</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Πάτα "Add" πάνω δεξιά</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowIOSInstructions(false)}
                variant="ios"
                className="w-full h-12"
              >
                Κατάλαβα
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
