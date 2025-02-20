
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ExerciseFormData } from "@/components/workout/types";
import { Weight, RotateCw, Minus, Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
    const newWeight = Math.round((currentWeight + amount) * 2) / 2; // Ensures 0.5 step increments
    setValue(`sets.${index}.weight`, Math.max(0, newWeight));
  };

  const handleRepsChange = (amount: number) => {
    setValue(`sets.${index}.reps`, (reps || 0) + amount);
  };

  const quickButtonStyle = "h-9 px-4 rounded-full bg-[#222222] hover:bg-[#333333] text-white font-medium text-sm whitespace-nowrap";
  const controlButtonStyle = "h-10 w-10 flex items-center justify-center rounded-full bg-[#222222] hover:bg-[#333333]";

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
        <div className="text-red-500 text-xl font-semibold">
          Set {index + 1}
        </div>
        {index > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-red-500/20 hover:text-red-500"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Set {index + 1}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this set.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onRemove(index)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Weight Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Weight className="h-5 w-5 text-red-500" />
            <span className="text-white text-lg font-medium">Weight: {weight || 0} KG</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            {weightButtons.slice(0, 4).map((amount, i) => (
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

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className={controlButtonStyle}
              onClick={() => handleWeightChange(-0.5)}
            >
              <Minus className="h-5 w-5" />
            </Button>
            <Slider
              value={[weight || 0]}
              min={0}
              max={200}
              step={0.5}
              onValueChange={([value]) => setValue(`sets.${index}.weight`, value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              className={controlButtonStyle}
              onClick={() => handleWeightChange(0.5)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Reps Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <RotateCw className="h-5 w-5 text-red-500" />
            <span className="text-white text-lg font-medium">Reps: {reps || 0}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            {repButtons.map((amount, i) => (
              <Button
                key={i}
                type="button"
                variant="outline"
                className={quickButtonStyle}
                onClick={() => setValue(`sets.${index}.reps`, amount)}
              >
                {amount}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className={controlButtonStyle}
              onClick={() => handleRepsChange(-1)}
            >
              <Minus className="h-5 w-5" />
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
              className={controlButtonStyle}
              onClick={() => handleRepsChange(1)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
