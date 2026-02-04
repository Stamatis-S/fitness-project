import { ExerciseEntryForm } from "@/components/ExerciseEntryForm";
import { useAuth } from "@/components/AuthProvider";
import { PageTransition } from "@/components/PageTransition";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState, useCallback, useRef } from "react";
import { UserRecordPopup } from "@/components/UserRecordPopup";
import { DataErrorBoundary } from "@/components/ErrorBoundary";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { useWakeLock } from "@/hooks/useWakeLock";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { WorkoutTemplate } from "@/hooks/useWorkoutTemplates";
import { QuickAddButton } from "@/components/QuickAddButton";
import type { ExerciseCategory } from "@/lib/constants";


interface SetData {
  weight: number;
  reps: number;
}

interface QuickExercise {
  exerciseName: string;
  category: ExerciseCategory;
  exercise_id: number | null;
  customExercise: string | null;
  lastWeight: number;
  lastReps: number;
  lastDate: string;
  sets?: SetData[];
}

const Index = () => {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const { requestWakeLock, releaseWakeLock } = useWakeLock();
  const [loadedTemplate, setLoadedTemplate] = useState<WorkoutTemplate | null>(null);
  const [quickExercise, setQuickExercise] = useState<QuickExercise | null>(null);

  // Check for loaded template from sessionStorage
  useEffect(() => {
    const storedTemplate = sessionStorage.getItem("loadedTemplate");
    if (storedTemplate) {
      try {
        const template = JSON.parse(storedTemplate) as WorkoutTemplate;
        setLoadedTemplate(template);
        sessionStorage.removeItem("loadedTemplate");
      } catch (e) {
        console.error("Failed to parse template:", e);
      }
    }
  }, []);

  const clearLoadedTemplate = useCallback(() => {
    setLoadedTemplate(null);
  }, []);

  const handleQuickAdd = useCallback((exercise: QuickExercise) => {
    setQuickExercise(exercise);
    toast.success(`${exercise.exerciseName} loaded!`);
  }, []);

  const clearQuickExercise = useCallback(() => {
    setQuickExercise(null);
  }, []);

  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/auth');
    }
  }, [session, isLoading, navigate]);

  // Keep screen awake while on workout page
  useEffect(() => {
    if (session) {
      requestWakeLock();
    }
    return () => {
      releaseWakeLock();
    };
  }, [session, requestWakeLock, releaseWakeLock]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-28">
        {/* Background gradient effect */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
        </div>
        
        <div className="relative mx-auto max-w-lg px-4 space-y-5">
          {/* Header */}
          <header className="flex items-center justify-between py-5">
            <div className="flex-1" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            >
              <img 
                src="/lovable-uploads/fe89902d-f9fe-48fd-bee9-26aab489a8ad.png"
                alt="Fitness Project Logo"
                width={112}
                height={98}
                loading="eager"
                decoding="async"
                className="w-24 md:w-28 drop-shadow-2xl" 
              />
            </motion.div>
            <div className="flex-1 flex justify-end gap-2">
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => navigate("/templates")}
                className="p-3 rounded-xl bg-card/60 backdrop-blur-xl border border-white/5 hover:bg-card transition-all active:scale-95 touch-target"
                title="Templates"
              >
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleLogout}
                className="p-3 rounded-xl bg-card/60 backdrop-blur-xl border border-white/5 hover:bg-card transition-all active:scale-95 touch-target"
                title="Logout"
              >
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </motion.button>
            </div>
          </header>

          {/* Loaded Template Banner */}
          {loadedTemplate && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between backdrop-blur-xl"
            >
              <div>
                <p className="text-sm font-semibold text-primary">Template: {loadedTemplate.name}</p>
                <p className="text-xs text-muted-foreground">{loadedTemplate.exercises.length} ασκήσεις</p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearLoadedTemplate} className="hover:bg-white/5">
                Κλείσιμο
              </Button>
            </motion.div>
          )}

          {/* PWA Install Banner */}
          <PWAInstallBanner />

          {/* User Record Popup */}
          <DataErrorBoundary>
            <UserRecordPopup />
          </DataErrorBoundary>


          {/* Exercise Entry Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="pt-1"
          >
            {session && (
              <DataErrorBoundary>
                <ExerciseEntryForm 
                  loadedTemplate={loadedTemplate}
                  onTemplateConsumed={clearLoadedTemplate}
                  quickExercise={quickExercise}
                  onQuickExerciseConsumed={clearQuickExercise}
                />
              </DataErrorBoundary>
            )}
          </motion.div>
        </div>

        {/* Quick Add Button */}
        <QuickAddButton onSelectExercise={handleQuickAdd} />
      </div>
    </PageTransition>
  );
}

export default Index;
