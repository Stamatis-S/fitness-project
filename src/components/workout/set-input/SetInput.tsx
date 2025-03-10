
import { useFormContext } from "react-hook-form";
import { ExerciseFormData } from "@/components/workout/types";
import { Weight, RotateCw, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { SetInputProps } from "./types";
import { SetControl } from "./SetControl";
import { QuickSelectButtons } from "./QuickSelectButtons";
import { DeleteSetDialog } from "./DeleteSetDialog";

export function SetInput({ index, onRemove }: SetInputProps) {
  const { session } = useAuth();
  const { watch, setValue } = useFormContext<ExerciseFormData>();
  const weight = watch(`sets.${index}.weight`);
  const reps = watch(`sets.${index}.reps`);
  const selectedExercise = watch('exercise');
  const customExercise = watch('customExercise');
  const selectedCategory = watch('category');
  const isCardio = selectedCategory === 'CARDIO';

  // Query for frequent values (historical data)
  const { data: frequentValues } = useQuery({
    queryKey: ['frequent-workout-values', session?.user.id, selectedExercise, customExercise],
    queryFn: async () => {
      if (!session?.user.id) return { weights: [], reps: [] };

      const query = supabase
        .from('workout_logs')
        .select('weight_kg, reps')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (selectedExercise === 'custom' && customExercise) {
        query.eq('custom_exercise', customExercise);
      } else if (selectedExercise && selectedExercise !== 'custom') {
        query.eq('exercise_id', parseInt(selectedExercise));
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching frequent values:', error);
        return { weights: [], reps: [] };
      }

      const weightCounts: Record<number, number> = {};
      const repsCounts: Record<number, number> = {};

      data.forEach(log => {
        if (log.weight_kg) {
          weightCounts[log.weight_kg] = (weightCounts[log.weight_kg] || 0) + 1;
        }
        if (log.reps) {
          repsCounts[log.reps] = (repsCounts[log.reps] || 0) + 1;
        }
      });

      const weights = Object.entries(weightCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([weight]) => Number(weight));

      const reps = Object.entries(repsCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([reps]) => Number(reps));

      return { weights, reps };
    },
    enabled: !!session?.user.id && !!selectedExercise,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // New query to fetch last workout values
  const { data: lastWorkoutValues } = useQuery({
    queryKey: ['last-workout-values', session?.user.id, selectedExercise, customExercise],
    queryFn: async () => {
      if (!session?.user.id) return { lastWeight: null, lastReps: null, lastDate: null };

      const query = supabase
        .from('workout_logs')
        .select('weight_kg, reps, workout_date')
        .eq('user_id', session.user.id)
        .order('workout_date', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (selectedExercise === 'custom' && customExercise) {
        query.eq('custom_exercise', customExercise);
      } else if (selectedExercise && selectedExercise !== 'custom') {
        query.eq('exercise_id', parseInt(selectedExercise));
      }

      const { data, error } = await query.limit(1);

      if (error || !data || data.length === 0) {
        return { lastWeight: null, lastReps: null, lastDate: null };
      }

      return {
        lastWeight: data[0].weight_kg,
        lastReps: data[0].reps,
        lastDate: data[0].workout_date
      };
    },
    enabled: !!session?.user.id && !!selectedExercise,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const handleWeightChange = (amount: number) => {
    const currentWeight = weight || 0;
    // For cardio, allow increments of 1 minute
    const newWeight = isCardio 
      ? Math.max(0, (currentWeight + amount))
      : Math.max(0, Math.round((currentWeight + amount) * 2) / 2);
    setValue(`sets.${index}.weight`, newWeight);
  };

  const handleRepsChange = (amount: number) => {
    setValue(`sets.${index}.reps`, (reps || 0) + amount);
  };

  // Default values if no user history exists
  const defaultWeightButtons = isCardio ? [5, 10, 15, 30] : [5, 10, 15, 20];
  const defaultRepButtons = isCardio ? [3, 5, 7, 9] : [8, 10, 12];

  // Determine weight buttons to display
  let weightButtons: number[] = defaultWeightButtons;
  
  // First check if we have last workout data
  if (lastWorkoutValues?.lastWeight !== null && lastWorkoutValues?.lastWeight !== undefined) {
    const lastWeight = lastWorkoutValues.lastWeight;
    // Add the exact last weight and some increments
    weightButtons = isCardio 
      ? [lastWeight, lastWeight + 5, lastWeight + 10, lastWeight + 15].filter(Boolean)
      : [lastWeight, lastWeight + 2.5, lastWeight + 5, lastWeight + 7.5].filter(Boolean);
  } 
  // If no last workout, fall back to frequent values
  else if (frequentValues?.weights?.length) {
    weightButtons = frequentValues.weights;
  }

  // Determine rep buttons to display
  let repButtons: number[] = defaultRepButtons;
  
  // First check if we have last workout data
  if (lastWorkoutValues?.lastReps !== null && lastWorkoutValues?.lastReps !== undefined) {
    const lastReps = lastWorkoutValues.lastReps;
    // Add the exact last reps and some increments
    repButtons = isCardio 
      ? [lastReps, Math.min(lastReps + 1, 10), Math.min(lastReps + 2, 10)].filter(Boolean)
      : [lastReps, lastReps + 1, lastReps + 2, lastReps + 3].filter(Boolean);
  }
  // If no last workout, fall back to frequent values
  else if (frequentValues?.reps?.length) {
    repButtons = frequentValues.reps;
  }

  return (
    <div className="bg-[#111111] rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-red-500 text-sm font-semibold">
          Set {index + 1}
        </div>
        {index > 0 && (
          <DeleteSetDialog 
            setNumber={index + 1}
            onDelete={() => onRemove(index)}
          />
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Weight/Minutes Section */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            {isCardio ? (
              <Clock className="h-3.5 w-3.5 text-red-500" />
            ) : (
              <Weight className="h-3.5 w-3.5 text-red-500" />
            )}
            <span className="text-white text-xs font-medium">
              {isCardio ? `Minutes: ${weight || 0}` : `Weight: ${weight || 0} KG`}
            </span>
            {lastWorkoutValues?.lastWeight !== null && (
              <span className="text-xs text-gray-400 ml-auto">
                Last: {lastWorkoutValues.lastWeight}{isCardio ? 'min' : 'kg'}
              </span>
            )}
          </div>
          
          <QuickSelectButtons
            values={weightButtons}
            onSelect={(value) => setValue(`sets.${index}.weight`, value)}
            unit={isCardio ? "min" : "KG"}
            isLastValue={(val) => val === lastWorkoutValues?.lastWeight}
          />

          <SetControl
            value={weight || 0}
            onChange={(value) => setValue(`sets.${index}.weight`, value)}
            min={0}
            max={isCardio ? 120 : 200}
            step={isCardio ? 1 : 0.5}
            onDecrement={() => handleWeightChange(isCardio ? -1 : -0.5)}
            onIncrement={() => handleWeightChange(isCardio ? 1 : 0.5)}
          />
        </div>

        {/* Reps Section */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <RotateCw className="h-3.5 w-3.5 text-red-500" />
            <span className="text-white text-xs font-medium">
              {isCardio ? "Intensity (1-10)" : "Reps"}: {reps || 0}
            </span>
            {lastWorkoutValues?.lastReps !== null && (
              <span className="text-xs text-gray-400 ml-auto">
                Last: {lastWorkoutValues.lastReps}
              </span>
            )}
          </div>
          
          <QuickSelectButtons
            values={repButtons}
            onSelect={(value) => setValue(`sets.${index}.reps`, value)}
            isLastValue={(val) => val === lastWorkoutValues?.lastReps}
          />

          <SetControl
            value={reps || 0}
            onChange={(value) => setValue(`sets.${index}.reps`, value)}
            min={0}
            max={isCardio ? 10 : 50}
            step={1}
            onDecrement={() => handleRepsChange(-1)}
            onIncrement={() => handleRepsChange(1)}
          />
        </div>
      </div>
    </div>
  );
}
