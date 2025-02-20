
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ExerciseFormData } from "@/components/workout/types";
import { Weight, RotateCw, Minus, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface SetInputProps {
  index: number;
  onRemove: (index: number) => void;
}

export function SetInput({ index, onRemove }: SetInputProps) {
  const { session } = useAuth();
  const { register, watch, setValue } = useFormContext<ExerciseFormData>();
  const weight = watch(`sets.${index}.weight`);
  const reps = watch(`sets.${index}.reps`);
  const selectedExercise = watch('exercise');
  const customExercise = watch('customExercise');

  const { data: frequentValues, isLoading } = useQuery({
    queryKey: ['frequent-workout-values', session?.user.id, selectedExercise, customExercise],
    queryFn: async () => {
      if (!session?.user.id) return { weights: [], reps: [] };

      const query = supabase
        .from('workout_logs')
        .select('weight_kg, reps')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      // Add exercise-specific filters
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

      // Count frequency of weights and reps
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

      // Get top 3 most frequent values
      const weights = Object.entries(weightCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([weight]) => Number(weight));

      const reps = Object.entries(repsCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([reps]) => Number(reps));

      return { weights, reps };
    },
    enabled: !!session?.user.id && !!selectedExercise,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (previously cacheTime)
  });

  const handleWeightChange = (amount: number) => {
    setValue(`sets.${index}.weight`, (weight || 0) + amount);
  };

  const handleRepsChange = (amount: number) => {
    setValue(`sets.${index}.reps`, (reps || 0) + amount);
  };

  const commonButtonStyle = "h-10 w-10 flex items-center justify-center rounded-full bg-[#222222] hover:bg-[#333333]";
  const quickButtonStyle = "h-10 w-20 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium backdrop-blur-sm border border-white/10 text-sm";

  // Default values if no history exists
  const defaultWeightButtons = [5, 10, 15];
  const defaultRepButtons = [8, 10, 12];

  const weightButtons = frequentValues?.weights.length 
    ? frequentValues.weights
    : defaultWeightButtons;

  const repButtons = frequentValues?.reps.length
    ? frequentValues.reps
    : defaultRepButtons;

  return (
    <div className="space-y-6 bg-[#111111] rounded-lg p-4">
      <div className="text-red-500 text-lg font-medium">
        Set {index + 1}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Weight Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Weight className="h-5 w-5 text-red-500" />
            <span className="text-white">Weight: {weight || 0} KG</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {weightButtons.map((amount, i) => (
              <Button
                key={i}
                type="button"
                variant="outline"
                className={quickButtonStyle}
                onClick={() => setValue(`sets.${index}.weight`, amount)}
              >
                {amount} KG
              </Button>
            ))}
          </div>
        </div>

        {/* Reps Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <RotateCw className="h-5 w-5 text-red-500" />
            <span className="text-white">Reps: {reps || 0}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {repButtons.map((amount, i) => (
              <Button
                key={i}
                type="button"
                variant="outline"
                className={quickButtonStyle}
                onClick={() => setValue(`sets.${index}.reps`, amount)}
              >
                {amount} Reps
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Sliders Section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className={commonButtonStyle}
            onClick={() => handleWeightChange(-5)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Slider
            value={[weight || 0]}
            min={0}
            max={200}
            step={1}
            onValueChange={([value]) => setValue(`sets.${index}.weight`, value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            className={commonButtonStyle}
            onClick={() => handleWeightChange(5)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className={commonButtonStyle}
            onClick={() => handleRepsChange(-1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Slider
            value={[reps || 0]}
            min={0}
            max={50}
            step={1}
            onValueChange={([value]) => setValue(`sets.${index}.reps`, value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            className={commonButtonStyle}
            onClick={() => handleRepsChange(1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
