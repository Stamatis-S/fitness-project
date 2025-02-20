
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

  const { data: frequentValues } = useQuery({
    queryKey: ['frequent-workout-values', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return { weights: [], reps: [] };

      const { data: weightData, error: weightError } = await supabase
        .from('workout_logs')
        .select('weight_kg')
        .eq('user_id', session.user.id)
        .not('weight_kg', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: repsData, error: repsError } = await supabase
        .from('workout_logs')
        .select('reps')
        .eq('user_id', session.user.id)
        .not('reps', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (weightError || repsError) {
        console.error('Error fetching frequent values:', weightError || repsError);
        return { weights: [], reps: [] };
      }

      // Get frequent weights
      const weightCounts = weightData.reduce((acc, { weight_kg }) => {
        if (weight_kg) {
          acc[weight_kg] = (acc[weight_kg] || 0) + 1;
        }
        return acc;
      }, {} as Record<number, number>);

      // Get frequent reps
      const repsCounts = repsData.reduce((acc, { reps }) => {
        if (reps) {
          acc[reps] = (acc[reps] || 0) + 1;
        }
        return acc;
      }, {} as Record<number, number>);

      // Get top 2 most frequent values
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
    enabled: !!session?.user.id,
  });

  const handleWeightChange = (amount: number) => {
    setValue(`sets.${index}.weight`, (weight || 0) + amount);
  };

  const handleRepsChange = (amount: number) => {
    setValue(`sets.${index}.reps`, (reps || 0) + amount);
  };

  const commonButtonStyle = "h-10 w-10 flex items-center justify-center rounded-full bg-[#222222] hover:bg-[#333333]";
  const quickButtonStyle = "h-10 w-20 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium backdrop-blur-sm border border-white/10 text-sm";

  const defaultWeightButtons = [5, -5];
  const defaultRepButtons = [1, -1];

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
          <div className="flex gap-2">
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
          <div className="flex gap-2">
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
