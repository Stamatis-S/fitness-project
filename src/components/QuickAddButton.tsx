import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, Clock, Dumbbell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useHaptic } from "@/hooks/useHaptic";
import { cn } from "@/lib/utils";
import type { ExerciseCategory } from "@/lib/constants";

interface RecentExercise {
  exerciseName: string;
  category: ExerciseCategory;
  exercise_id: number | null;
  customExercise: string | null;
  lastWeight: number;
  lastReps: number;
  lastDate: string;
}

interface QuickAddButtonProps {
  onSelectExercise: (exercise: RecentExercise) => void;
}

export function QuickAddButton({ onSelectExercise }: QuickAddButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { session } = useAuth();
  const { vibrate } = useHaptic();

  const { data: recentExercises = [] } = useQuery({
    queryKey: ['recent-exercises', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return [];

      // Get the 5 most recent unique exercises
      const { data, error } = await supabase
        .from('workout_logs')
        .select(`
          exercise_id,
          custom_exercise,
          category,
          weight_kg,
          reps,
          workout_date,
          exercises (name)
        `)
        .eq('user_id', session.user.id)
        .order('workout_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Dedupe by exercise name
      const seen = new Set<string>();
      const recent: RecentExercise[] = [];

      for (const log of data || []) {
        const exerciseName = log.custom_exercise || log.exercises?.name;
        if (!exerciseName || seen.has(exerciseName)) continue;
        
        seen.add(exerciseName);
        recent.push({
          exerciseName,
          category: log.category as ExerciseCategory,
          exercise_id: log.exercise_id,
          customExercise: log.custom_exercise,
          lastWeight: log.weight_kg || 0,
          lastReps: log.reps || 0,
          lastDate: log.workout_date
        });

        if (recent.length >= 5) break;
      }

      return recent;
    },
    enabled: !!session?.user.id,
    staleTime: 1000 * 60 * 2 // 2 minutes
  });

  const handleToggle = () => {
    vibrate('light');
    setIsOpen(!isOpen);
  };

  const handleSelect = (exercise: RecentExercise) => {
    vibrate('success');
    onSelectExercise(exercise);
    setIsOpen(false);
  };

  if (recentExercises.length === 0) return null;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Recent Exercises Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 left-4 right-4 z-50 max-w-lg mx-auto"
          >
            <div className="bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">Recent Exercises</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-2">
                {recentExercises.map((exercise, index) => (
                  <motion.button
                    key={`${exercise.exerciseName}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelect(exercise)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl",
                      "bg-gradient-to-r from-white/5 to-transparent",
                      "border border-white/5 hover:border-primary/30",
                      "active:scale-[0.98] transition-all duration-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Dumbbell className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground truncate max-w-[160px]">
                          {exercise.exerciseName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {exercise.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {exercise.lastWeight}kg × {exercise.lastReps}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Last used
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.3 }}
        onClick={handleToggle}
        className={cn(
          "fixed bottom-24 right-4 z-50",
          "w-14 h-14 rounded-full",
          "bg-gradient-to-br from-primary to-primary/80",
          "shadow-lg shadow-primary/30",
          "flex items-center justify-center",
          "active:scale-95 transition-transform",
          isOpen && "rotate-45"
        )}
        style={{
          transition: "transform 0.2s ease"
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
            >
              <X className="h-6 w-6 text-primary-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="zap"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Zap className="h-6 w-6 text-primary-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
