import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import { motion } from 'framer-motion';

interface LastWorkoutExercise {
  category: string;
  exercise_id: number | null;
  custom_exercise: string | null;
  exercise_name?: string;
  sets: Array<{
    set_number: number;
    weight_kg: number | null;
    reps: number | null;
  }>;
}

interface RepeatLastWorkoutProps {
  onRepeat: (exercises: LastWorkoutExercise[]) => void;
}

export function RepeatLastWorkout({ onRepeat }: RepeatLastWorkoutProps) {
  const { session } = useAuth();

  const { data: lastWorkout, isLoading } = useQuery({
    queryKey: ['last-workout-session', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return null;

      // Get the most recent workout date
      const { data: recentDate, error: dateError } = await supabase
        .from('workout_logs')
        .select('workout_date')
        .eq('user_id', session.user.id)
        .order('workout_date', { ascending: false })
        .limit(1);

      if (dateError || !recentDate || recentDate.length === 0) {
        return null;
      }

      const lastDate = recentDate[0].workout_date;

      // Get all exercises from that date
      const { data: logs, error: logsError } = await supabase
        .from('workout_logs')
        .select(`
          category,
          exercise_id,
          custom_exercise,
          set_number,
          weight_kg,
          reps,
          exercises (name)
        `)
        .eq('user_id', session.user.id)
        .eq('workout_date', lastDate)
        .order('created_at', { ascending: true });

      if (logsError || !logs) {
        return null;
      }

      // Group by exercise
      const exerciseMap = new Map<string, LastWorkoutExercise>();

      logs.forEach((log: any) => {
        const key = log.exercise_id ? `e_${log.exercise_id}` : `c_${log.custom_exercise}`;
        
        if (!exerciseMap.has(key)) {
          exerciseMap.set(key, {
            category: log.category,
            exercise_id: log.exercise_id,
            custom_exercise: log.custom_exercise,
            exercise_name: log.exercises?.name || log.custom_exercise,
            sets: [],
          });
        }

        exerciseMap.get(key)!.sets.push({
          set_number: log.set_number,
          weight_kg: log.weight_kg,
          reps: log.reps,
        });
      });

      return {
        date: lastDate,
        exercises: Array.from(exerciseMap.values()),
      };
    },
    enabled: !!session?.user.id,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !lastWorkout || lastWorkout.exercises.length === 0) {
    return null;
  }

  const exerciseCount = lastWorkout.exercises.length;
  const totalSets = lastWorkout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  const handleRepeat = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    onRepeat(lastWorkout.exercises);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Button
        type="button"
        variant="outline"
        className="w-full h-14 justify-start gap-3 bg-ios-surface-elevated border-0 hover:bg-ios-fill"
        onClick={handleRepeat}
      >
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <History className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-foreground">Repeat Last Workout</span>
          <span className="text-xs text-muted-foreground">
            {exerciseCount} exercise{exerciseCount > 1 ? 's' : ''}, {totalSets} set{totalSets > 1 ? 's' : ''}
          </span>
        </div>
      </Button>
    </motion.div>
  );
}
