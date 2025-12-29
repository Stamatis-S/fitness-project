import { motion } from "framer-motion";
import { Download, Share, Plus, Check, Smartphone, Zap, Wifi, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const navigate = useNavigate();

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      navigate('/');
    }
  };

  const features = [
    { icon: Zap, title: "Γρήγορη Πρόσβαση", description: "Άνοιγμα με ένα tap από την αρχική οθόνη" },
    { icon: Wifi, title: "Offline Mode", description: "Λειτουργεί ακόμα και χωρίς internet" },
    { icon: Bell, title: "Ειδοποιήσεις", description: "Λάβε reminders για τις προπονήσεις σου" },
    { icon: Smartphone, title: "Native Experience", description: "Αίσθηση πραγματικής εφαρμογής" },
  ];

  return (
    <div className="min-h-screen bg-background p-6 safe-area-bottom">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto space-y-8 pt-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-3xl flex items-center justify-center shadow-lg"
          >
            <span className="text-4xl">💪</span>
          </motion.div>
          
          <h1 className="text-3xl font-bold">Εγκατάσταση FitTrack</h1>
          <p className="text-muted-foreground">
            Πρόσθεσε την εφαρμογή στην αρχική σου οθόνη για καλύτερη εμπειρία
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="p-4 h-full">
                <feature.icon className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Install Instructions */}
        {isInstalled ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold">Ήδη Εγκατεστημένο!</h2>
            <p className="text-muted-foreground">
              Η εφαρμογή είναι ήδη στην αρχική σου οθόνη
            </p>
            <Button onClick={() => navigate('/')} className="w-full h-14" variant="ios">
              Πίσω στην Εφαρμογή
            </Button>
          </motion.div>
        ) : isIOS ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <Card className="p-5 space-y-4">
              <h2 className="font-semibold text-lg">Οδηγίες για iPhone/iPad</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Πάτα το κουμπί Share</p>
                    <p className="text-sm text-muted-foreground">
                      Βρίσκεται στο κάτω μέρος του Safari
                    </p>
                    <div className="mt-2 p-3 bg-ios-surface-elevated rounded-ios inline-flex items-center gap-2">
                      <Share className="w-5 h-5 text-primary" />
                      <span className="text-sm">Share</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Επίλεξε "Add to Home Screen"</p>
                    <p className="text-sm text-muted-foreground">
                      Scroll κάτω στο menu για να το βρεις
                    </p>
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
                    <p className="font-medium">Πάτα "Add"</p>
                    <p className="text-sm text-muted-foreground">
                      Η εφαρμογή θα εμφανιστεί στην αρχική οθόνη
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : isInstallable ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <Button
              onClick={handleInstall}
              className="w-full h-14 text-lg font-semibold"
              variant="ios"
            >
              <Download className="w-5 h-5 mr-2" />
              Εγκατάσταση Εφαρμογής
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Θα προστεθεί στην αρχική σου οθόνη
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center space-y-4"
          >
            <p className="text-muted-foreground">
              Άνοιξε αυτή τη σελίδα στον browser του κινητού σου για να εγκαταστήσεις την εφαρμογή
            </p>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full h-14">
              Πίσω στην Εφαρμογή
            </Button>
          </motion.div>
        )}

        {/* Back Link */}
        {!isInstalled && (
          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-muted-foreground"
            >
              Συνέχεια χωρίς εγκατάσταση
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Install;
