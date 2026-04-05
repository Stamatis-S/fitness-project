import { ExerciseEntryForm } from "@/components/ExerciseEntryForm";
import { useAuth } from "@/components/AuthProvider";
import { PageTransition } from "@/components/PageTransition";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, BookOpen, Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import { UserRecordPopup } from "@/components/UserRecordPopup";
import { DataErrorBoundary } from "@/components/ErrorBoundary";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { useWakeLock } from "@/hooks/useWakeLock";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { WorkoutTemplate } from "@/hooks/useWorkoutTemplates";
import { QuickAddButton } from "@/components/QuickAddButton";
import type { ExerciseCategory } from "@/lib/constants";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

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
  const { t } = useTranslation();
  const { requestWakeLock, releaseWakeLock } = useWakeLock();
  const [loadedTemplate, setLoadedTemplate] = useState<WorkoutTemplate | null>(null);
  const [quickExercise, setQuickExercise] = useState<QuickExercise | null>(null);

  // Today's workout count
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const { data: todayCount = 0 } = useQuery({
    queryKey: ['today_workout_count', todayStr, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      const { count, error } = await supabase
        .from('workout_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('workout_date', todayStr);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!session?.user?.id,
  });

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
        <div className="relative mx-auto max-w-lg px-4">
          {/* Compact Header */}
          <header className="flex items-center justify-between py-4">
            <img
              src="/lovable-uploads/fe89902d-f9fe-48fd-bee9-26aab489a8ad.png"
              alt="Fitness Project Logo"
              width={48}
              height={42}
              loading="eager"
              decoding="async"
              className="w-12 drop-shadow-lg"
            />

            {/* Today's progress badge */}
            {todayCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/20"
              >
                <Dumbbell className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  {todayCount} {todayCount === 1 ? t('exercise.exercise') : t('exercise.exercises')}
                </span>
              </motion.div>
            )}

            <div className="flex gap-1.5">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate("/templates")}
                className="p-2.5 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors touch-target"
                title="Templates"
              >
                <BookOpen className="h-4.5 w-4.5 text-muted-foreground" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors touch-target"
                title="Logout"
              >
                <LogOut className="h-4.5 w-4.5 text-muted-foreground" />
              </motion.button>
            </div>
          </header>

          {/* Loaded Template Banner */}
          {loadedTemplate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center justify-between mb-4"
            >
              <div>
                <p className="text-sm font-semibold text-primary">Template: {loadedTemplate.name}</p>
                <p className="text-xs text-muted-foreground">{loadedTemplate.exercises.length} exercises</p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearLoadedTemplate}>
                ✕
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
          <div className="mt-2">
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
          </div>
        </div>

        {/* Quick Add Button */}
        <QuickAddButton onSelectExercise={handleQuickAdd} />
      </div>
    </PageTransition>
  );
};

export default Index;
