import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface ExerciseHistoryParams {
  exerciseId: string | undefined;
  customExercise: string | undefined;
  isCustomExercise: boolean;
  setNumber: number;
}

interface ExerciseHistoryData {
  frequentWeight: number | null;
  frequentReps: number | null;
  lastWeight: number | null;
  lastReps: number | null;
  lastDate: string | null;
}

export function useExerciseHistory({
  exerciseId,
  customExercise,
  isCustomExercise,
  setNumber,
}: ExerciseHistoryParams) {
  const { session } = useAuth();

  return useQuery({
    queryKey: [
      "exercise-history",
      session?.user.id,
      exerciseId,
      customExercise,
      isCustomExercise,
      setNumber,
    ],
    queryFn: async (): Promise<ExerciseHistoryData> => {
      if (!session?.user.id) {
        return {
          frequentWeight: null,
          frequentReps: null,
          lastWeight: null,
          lastReps: null,
          lastDate: null,
        };
      }

      // Build base query conditions
      const isStandardExercise = !isCustomExercise && exerciseId && !isNaN(parseInt(exerciseId));
      const hasCustomExercise = isCustomExercise && customExercise;

      if (!isStandardExercise && !hasCustomExercise) {
        return {
          frequentWeight: null,
          frequentReps: null,
          lastWeight: null,
          lastReps: null,
          lastDate: null,
        };
      }

      // Single query to get all history for this exercise
      let query = supabase
        .from("workout_logs")
        .select("weight_kg, reps, workout_date, set_number, created_at")
        .eq("user_id", session.user.id)
        .order("workout_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (hasCustomExercise) {
        query = query.eq("custom_exercise", customExercise);
      } else if (isStandardExercise) {
        query = query.eq("exercise_id", parseInt(exerciseId));
      }

      const { data, error } = await query.limit(100);

      if (error || !data || data.length === 0) {
        return {
          frequentWeight: null,
          frequentReps: null,
          lastWeight: null,
          lastReps: null,
          lastDate: null,
        };
      }

      // Calculate frequent values from all data
      const weightCounts: Record<number, number> = {};
      const repsCounts: Record<number, number> = {};

      data.forEach((log) => {
        if (log.weight_kg) {
          weightCounts[log.weight_kg] = (weightCounts[log.weight_kg] || 0) + 1;
        }
        if (log.reps) {
          repsCounts[log.reps] = (repsCounts[log.reps] || 0) + 1;
        }
      });

      const frequentWeight =
        Object.entries(weightCounts).length > 0
          ? Number(
              Object.entries(weightCounts).sort(([, a], [, b]) => b - a)[0][0]
            )
          : null;

      const frequentReps =
        Object.entries(repsCounts).length > 0
          ? Number(
              Object.entries(repsCounts).sort(([, a], [, b]) => b - a)[0][0]
            )
          : null;

      // Find the last workout for this specific set number
      const lastSetLog = data.find((log) => log.set_number === setNumber);

      return {
        frequentWeight,
        frequentReps,
        lastWeight: lastSetLog?.weight_kg ?? null,
        lastReps: lastSetLog?.reps ?? null,
        lastDate: lastSetLog?.workout_date ?? null,
      };
    },
    enabled:
      !!session?.user.id &&
      ((!!exerciseId && !isCustomExercise) || (!!customExercise && isCustomExercise)),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
