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

export function SetInput({ index, onRemove, exerciseLabel, fieldArrayPath = "sets" }: SetInputProps) {
  const { session } = useAuth();
  const { watch, setValue } = useFormContext<ExerciseFormData>();
  const weight = watch(`${fieldArrayPath}.${index}.weight`);
  const reps = watch(`${fieldArrayPath}.${index}.reps`);
  const selectedExercise = watch('exercise');
  const customExercise = watch('customExercise');
  const selectedCategory = watch('category');
  const isCardio = selectedCategory === 'CARDIO';

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
        .slice(0, 1)
        .map(([weight]) => Number(weight));

      const reps = Object.entries(repsCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 1)
        .map(([reps]) => Number(reps));

      return { weights, reps };
    },
    enabled: !!session?.user.id && !!selectedExercise,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: lastWorkoutValues, isLoading: isLoadingLast } = useQuery({
    queryKey: ['last-workout-values', session?.user.id, selectedExercise, customExercise, index + 1],
    queryFn: async () => {
      if (!session?.user.id || !selectedExercise) {
        return { lastWeight: null, lastReps: null, lastDate: null };
      }

      const query = supabase
        .from('workout_logs')
        .select('weight_kg, reps, workout_date')
        .eq('user_id', session.user.id)
        .eq('set_number', index + 1)
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
  });

  const handleWeightChange = (amount: number) => {
    const currentWeight = weight || 0;
    const newWeight = isCardio 
      ? Math.max(0, (currentWeight + amount))
      : Math.max(0, Math.round((currentWeight + amount) * 2) / 2);
    setValue(`${fieldArrayPath}.${index}.weight`, newWeight);
  };

  const handleRepsChange = (amount: number) => {
    setValue(`${fieldArrayPath}.${index}.reps`, (reps || 0) + amount);
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

  return (
    <div className="bg-[#111111] rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-red-500 text-sm font-semibold">
          {exerciseLabel ? exerciseLabel : `Set ${index + 1}`}
        </div>
        {index > 0 && !exerciseLabel && (
          <DeleteSetDialog 
            setNumber={index + 1}
            onDelete={() => onRemove(index)}
          />
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
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
            {!isLoadingLast && lastWorkoutValues && typeof lastWorkoutValues.lastWeight === 'number' && (
              <span className="text-xs text-gray-400 ml-auto">
                Last: {lastWorkoutValues.lastWeight}{isCardio ? 'min' : 'kg'}
              </span>
            )}
          </div>
          
          <QuickSelectButtons
            values={weightButtons}
            onSelect={(value) => setValue(`${fieldArrayPath}.${index}.weight`, value)}
            unit={isCardio ? "min" : "KG"}
            isLastValue={isLastWeightValue}
          />

          <SetControl
            value={weight || 0}
            onChange={(value) => setValue(`${fieldArrayPath}.${index}.weight`, value)}
            min={0}
            max={isCardio ? 120 : 200}
            step={isCardio ? 1 : 0.5}
            onDecrement={() => handleWeightChange(isCardio ? -1 : -0.5)}
            onIncrement={() => handleWeightChange(isCardio ? 1 : 0.5)}
          />
        </div>

        <div>
          <div className="flex items-center gap-1 mb-2">
            <RotateCw className="h-3.5 w-3.5 text-red-500" />
            <span className="text-white text-xs font-medium">
              {isCardio ? "Intensity (1-10)" : "Reps"}: {reps || 0}
            </span>
            {!isLoadingLast && lastWorkoutValues && typeof lastWorkoutValues.lastReps === 'number' && (
              <span className="text-xs text-gray-400 ml-auto">
                Last: {lastWorkoutValues.lastReps}
              </span>
            )}
          </div>
          
          <QuickSelectButtons
            values={repButtons}
            onSelect={(value) => setValue(`${fieldArrayPath}.${index}.reps`, value)}
            isLastValue={isLastRepsValue}
          />

          <SetControl
            value={reps || 0}
            onChange={(value) => setValue(`${fieldArrayPath}.${index}.reps`, value)}
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
