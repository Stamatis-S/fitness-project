
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

export function SetInput({ index, onRemove, exerciseLabel, fieldArrayPath = "sets", customExercise }: SetInputProps) {
  const { session } = useAuth();
  const { watch, setValue } = useFormContext<ExerciseFormData>();
  
  // Use type assertion for dynamic field paths
  const fieldPath = `${fieldArrayPath}.${index}`;
  const weight = watch(`${fieldArrayPath}.${index}.weight` as any);
  const reps = watch(`${fieldArrayPath}.${index}.reps` as any);
  
  const selectedExercise = watch('exercise');
  const formCustomExercise = watch('customExercise');
  const selectedCategory = watch('category');
  const isCardio = selectedCategory === 'CARDIO';
  
  const effectiveCustomExercise = customExercise || formCustomExercise;

  // Check if selected exercise is a custom one (not a numeric ID)
  const isCustomExercise = selectedExercise && isNaN(parseInt(selectedExercise));

  const { data: frequentValues } = useQuery({
    queryKey: ['frequent-workout-values', session?.user.id, selectedExercise, effectiveCustomExercise, isCustomExercise],
    queryFn: async () => {
      if (!session?.user.id) return { weights: [], reps: [] };

      const query = supabase
        .from('workout_logs')
        .select('weight_kg, reps')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      // For custom exercises, match by custom_exercise name
      if (isCustomExercise || effectiveCustomExercise) {
        const customName = effectiveCustomExercise || selectedExercise;
        query.eq('custom_exercise', customName);
      } else if (selectedExercise && !isNaN(parseInt(selectedExercise))) {
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
        .slice(0, 1)
        .map(([weight]) => Number(weight));

      const reps = Object.entries(repsCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 1)
        .map(([reps]) => Number(reps));

      return { weights, reps };
    },
    enabled: !!session?.user.id && (!!selectedExercise || !!effectiveCustomExercise),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: lastWorkoutValues, isLoading: isLoadingLast } = useQuery({
    queryKey: ['last-workout-values', session?.user.id, selectedExercise, effectiveCustomExercise, index + 1, isCustomExercise],
    queryFn: async () => {
      if (!session?.user.id) {
        return { lastWeight: null, lastReps: null, lastDate: null };
      }

      const query = supabase
        .from('workout_logs')
        .select('weight_kg, reps, workout_date')
        .eq('user_id', session.user.id)
        .eq('set_number', index + 1)
        .order('workout_date', { ascending: false })
        .order('created_at', { ascending: false });
      
      // For custom exercises, match by custom_exercise name
      if (isCustomExercise || effectiveCustomExercise || fieldArrayPath !== 'sets') {
        const customName = effectiveCustomExercise || selectedExercise;
        query.eq('custom_exercise', customName);
      } else if (selectedExercise && !isNaN(parseInt(selectedExercise))) {
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
    enabled: !!session?.user.id && (!!selectedExercise || !!effectiveCustomExercise),
  });

  const handleWeightChange = (amount: number) => {
    const currentWeight = typeof weight === 'number' ? weight : 0;
    const newWeight = isCardio 
      ? Math.max(0, (currentWeight + amount))
      : Math.max(0, Math.round((currentWeight + amount) * 2) / 2);
    setValue(`${fieldArrayPath}.${index}.weight` as any, newWeight);
  };

  const handleRepsChange = (amount: number) => {
    const currentReps = typeof reps === 'number' ? reps : 0;
    setValue(`${fieldArrayPath}.${index}.reps` as any, currentReps + amount);
  };

  const createButtonValues = () => {
    const weightBtns: number[] = [];
    const repsBtns: number[] = [];
    
    const defaultWeight = isCardio ? 10 : 20;
    const defaultReps = isCardio ? 5 : 10;
    
    if (lastWorkoutValues && typeof lastWorkoutValues.lastWeight === 'number') {
      weightBtns.push(lastWorkoutValues.lastWeight);
    }
    
    if (lastWorkoutValues && typeof lastWorkoutValues.lastReps === 'number') {
      repsBtns.push(lastWorkoutValues.lastReps);
    }
    
    if (frequentValues?.weights?.length) {
      const freqWeight = frequentValues.weights[0];
      if (weightBtns.length === 0 || weightBtns[0] !== freqWeight) {
        weightBtns.push(freqWeight);
      }
    }
    
    if (frequentValues?.reps?.length) {
      const freqReps = frequentValues.reps[0];
      if (repsBtns.length === 0 || repsBtns[0] !== freqReps) {
        repsBtns.push(freqReps);
      }
    }
    
    if (weightBtns.length === 0) {
      weightBtns.push(defaultWeight);
    }
    
    if (repsBtns.length === 0) {
      repsBtns.push(defaultReps);
    }
    
    if (weightBtns.length === 1) {
      const valueToAdd = isCardio ? 
        weightBtns[0] + 5 : 
        weightBtns[0] + 2.5;
      weightBtns.push(valueToAdd);
    }
    
    if (repsBtns.length === 1) {
      const valueToAdd = isCardio ? 
        Math.min(repsBtns[0] + 1, 10) : 
        repsBtns[0] + 2;
      repsBtns.push(valueToAdd);
    }
    
    return {
      weightButtons: weightBtns.slice(0, 2),
      repButtons: repsBtns.slice(0, 2)
    };
  };

  const { weightButtons, repButtons } = createButtonValues();

  const isLastWeightValue = (val: number): boolean => {
    if (!lastWorkoutValues || typeof lastWorkoutValues.lastWeight !== 'number') {
      return false;
    }
    return val === lastWorkoutValues.lastWeight;
  };

  const isLastRepsValue = (val: number): boolean => {
    if (!lastWorkoutValues || typeof lastWorkoutValues.lastReps !== 'number') {
      return false;
    }
    return val === lastWorkoutValues.lastReps;
  };

  const displayWeight = typeof weight === 'number' ? weight : 0;
  const displayReps = typeof reps === 'number' ? reps : 0;

  return (
    <div className="bg-ios-surface-elevated rounded-ios-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-primary text-base font-semibold">
          {exerciseLabel ? exerciseLabel : `Set ${index + 1}`}
        </div>
        {index > 0 && !exerciseLabel && (
          <DeleteSetDialog 
            setNumber={index + 1}
            onDelete={() => onRemove(index)}
          />
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            {isCardio ? (
              <Clock className="h-4 w-4 text-primary" />
            ) : (
              <Weight className="h-4 w-4 text-primary" />
            )}
            <span className="text-foreground text-sm font-medium">
              {isCardio ? `${displayWeight} min` : `${displayWeight} KG`}
            </span>
            {!isLoadingLast && lastWorkoutValues && typeof lastWorkoutValues.lastWeight === 'number' && (
              <span className="text-xs text-muted-foreground ml-auto">
                Last: {lastWorkoutValues.lastWeight}
              </span>
            )}
          </div>
          
          <QuickSelectButtons
            values={weightButtons}
            onSelect={(value) => setValue(`${fieldArrayPath}.${index}.weight` as any, value)}
            unit={isCardio ? "min" : "KG"}
            isLastValue={isLastWeightValue}
          />

          <SetControl
            value={displayWeight}
            onChange={(value) => setValue(`${fieldArrayPath}.${index}.weight` as any, value)}
            min={0}
            max={isCardio ? 120 : 200}
            step={isCardio ? 1 : 0.5}
            onDecrement={() => handleWeightChange(isCardio ? -1 : -0.5)}
            onIncrement={() => handleWeightChange(isCardio ? 1 : 0.5)}
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <RotateCw className="h-4 w-4 text-primary" />
            <span className="text-foreground text-sm font-medium">
              {isCardio ? `Intensity: ${displayReps}` : `${displayReps} reps`}
            </span>
            {!isLoadingLast && lastWorkoutValues && typeof lastWorkoutValues.lastReps === 'number' && (
              <span className="text-xs text-muted-foreground ml-auto">
                Last: {lastWorkoutValues.lastReps}
              </span>
            )}
          </div>
          
          <QuickSelectButtons
            values={repButtons}
            onSelect={(value) => setValue(`${fieldArrayPath}.${index}.reps` as any, value)}
            isLastValue={isLastRepsValue}
          />

          <SetControl
            value={displayReps}
            onChange={(value) => setValue(`${fieldArrayPath}.${index}.reps` as any, value)}
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
