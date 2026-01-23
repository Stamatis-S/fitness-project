import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, Clock, Dumbbell, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useHaptic } from "@/hooks/useHaptic";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { el } from "date-fns/locale";
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

interface WorkoutDay {
  date: string;
  exercises: RecentExercise[];
}

interface QuickAddButtonProps {
  onSelectExercise: (exercise: RecentExercise) => void;
}

type TabType = 'recent' | string; // 'recent' or date string

export function QuickAddButton({ onSelectExercise }: QuickAddButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('recent');
  const { session } = useAuth();
  const { vibrate } = useHaptic();

  // Fetch recent unique exercises
  const { data: recentExercises = [] } = useQuery({
    queryKey: ['recent-exercises', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return [];

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
    staleTime: 1000 * 60 * 2
  });

  // Fetch last 3 workout days with exercises
  const { data: workoutDays = [] } = useQuery({
    queryKey: ['workout-days', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return [];

      // Get unique workout dates
      const { data: dates, error: datesError } = await supabase
        .from('workout_logs')
        .select('workout_date')
        .eq('user_id', session.user.id)
        .order('workout_date', { ascending: false })
        .limit(100);

      if (datesError) throw datesError;

      const uniqueDates = [...new Set(dates?.map(d => d.workout_date) || [])].slice(0, 3);

      if (uniqueDates.length === 0) return [];

      // Get exercises for these dates
      const { data, error } = await supabase
        .from('workout_logs')
        .select(`
          exercise_id,
          custom_exercise,
          category,
          weight_kg,
          reps,
          workout_date,
          set_number,
          exercises (name)
        `)
        .eq('user_id', session.user.id)
        .in('workout_date', uniqueDates)
        .order('workout_date', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date and dedupe exercises per day
      const dayMap = new Map<string, RecentExercise[]>();
      
      for (const log of data || []) {
        const exerciseName = log.custom_exercise || log.exercises?.name;
        if (!exerciseName) continue;

        if (!dayMap.has(log.workout_date)) {
          dayMap.set(log.workout_date, []);
        }

        const dayExercises = dayMap.get(log.workout_date)!;
        const exists = dayExercises.some(e => e.exerciseName === exerciseName);
        
        if (!exists) {
          dayExercises.push({
            exerciseName,
            category: log.category as ExerciseCategory,
            exercise_id: log.exercise_id,
            customExercise: log.custom_exercise,
            lastWeight: log.weight_kg || 0,
            lastReps: log.reps || 0,
            lastDate: log.workout_date
          });
        }
      }

      const days: WorkoutDay[] = [];
      for (const date of uniqueDates) {
        const exercises = dayMap.get(date);
        if (exercises && exercises.length > 0) {
          days.push({ date, exercises });
        }
      }

      return days;
    },
    enabled: !!session?.user.id,
    staleTime: 1000 * 60 * 2
  });

  const handleToggle = () => {
    vibrate('light');
    setIsOpen(!isOpen);
    if (!isOpen) {
      setActiveTab('recent');
    }
  };

  const handleSelect = (exercise: RecentExercise) => {
    vibrate('success');
    onSelectExercise(exercise);
    setIsOpen(false);
  };

  const handleTabChange = (tab: TabType) => {
    vibrate('light');
    setActiveTab(tab);
  };

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, 'd MMM', { locale: el });
  };

  const getActiveExercises = (): RecentExercise[] => {
    if (activeTab === 'recent') {
      return recentExercises;
    }
    const day = workoutDays.find(d => d.date === activeTab);
    return day?.exercises || [];
  };

  if (recentExercises.length === 0 && workoutDays.length === 0) return null;

  const activeExercises = getActiveExercises();

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

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 left-4 right-4 z-50 max-w-lg mx-auto max-h-[70vh] flex flex-col"
          >
            <div className="bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Quick Add</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-4 pb-3">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {/* Recent Tab */}
                  <button
                    onClick={() => handleTabChange('recent')}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all",
                      activeTab === 'recent'
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10"
                    )}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Recent
                  </button>

                  {/* Workout Day Tabs */}
                  {workoutDays.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => handleTabChange(day.date)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all",
                        activeTab === day.date
                          ? "bg-primary text-primary-foreground"
                          : "bg-white/5 text-muted-foreground hover:bg-white/10"
                      )}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(day.date)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercise List */}
              <div className="px-4 pb-4 overflow-y-auto flex-1">
                <div className="space-y-2">
                  {activeExercises.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No exercises found
                    </p>
                  ) : (
                    activeExercises.map((exercise, index) => (
                      <motion.button
                        key={`${exercise.exerciseName}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleSelect(exercise)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl",
                          "bg-gradient-to-r from-white/5 to-transparent",
                          "border border-white/5 hover:border-primary/30",
                          "active:scale-[0.98] transition-all duration-200"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Dumbbell className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {exercise.exerciseName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {exercise.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-sm font-semibold text-foreground">
                            {exercise.lastWeight}kg × {exercise.lastReps}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {activeTab === 'recent' ? 'Last used' : 'Tap to add'}
                          </p>
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
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
          "active:scale-95 transition-transform"
        )}
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
