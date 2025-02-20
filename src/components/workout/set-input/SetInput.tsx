
import { useFormContext } from "react-hook-form";
import { ExerciseFormData } from "@/components/workout/types";
import { Weight, RotateCw } from "lucide-react";
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

  const handleWeightChange = (amount: number) => {
    const currentWeight = weight || 0;
    const newWeight = Math.round((currentWeight + amount) * 2) / 2;
    setValue(`sets.${index}.weight`, Math.max(0, newWeight));
  };

  const handleRepsChange = (amount: number) => {
    setValue(`sets.${index}.reps`, (reps || 0) + amount);
  };

  const defaultWeightButtons = [5, 10, 15, 20];
  const defaultRepButtons = [8, 10, 12];

  const weightButtons = frequentValues?.weights.length 
    ? frequentValues.weights
    : defaultWeightButtons;

  const repButtons = frequentValues?.reps.length
    ? frequentValues.reps
    : defaultRepButtons;

  return (
    <div className="bg-[#111111] rounded-xl p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="text-red-500 text-base font-semibold">
          Set {index + 1}
        </div>
        {index > 0 && (
          <DeleteSetDialog 
            setNumber={index + 1}
            onDelete={() => onRemove(index)}
          />
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Weight Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Weight className="h-4 w-4 text-red-500" />
            <span className="text-white text-sm font-medium">Weight: {weight || 0} KG</span>
          </div>
          
          <QuickSelectButtons
            values={weightButtons}
            onSelect={(value) => setValue(`sets.${index}.weight`, value)}
            unit="KG"
          />

          <SetControl
            value={weight || 0}
            onChange={(value) => setValue(`sets.${index}.weight`, value)}
            min={0}
            max={200}
            step={0.5}
            onDecrement={() => handleWeightChange(-0.5)}
            onIncrement={() => handleWeightChange(0.5)}
          />
        </div>

        {/* Reps Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <RotateCw className="h-4 w-4 text-red-500" />
            <span className="text-white text-sm font-medium">Reps: {reps || 0}</span>
          </div>
          
          <QuickSelectButtons
            values={repButtons}
            onSelect={(value) => setValue(`sets.${index}.reps`, value)}
          />

          <SetControl
            value={reps || 0}
            onChange={(value) => setValue(`sets.${index}.reps`, value)}
            min={0}
            max={50}
            step={1}
            onDecrement={() => handleRepsChange(-1)}
            onIncrement={() => handleRepsChange(1)}
          />
        </div>
      </div>
    </div>
  );
}
