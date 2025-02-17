import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Trash2, Weight, Repeat, Plus, Minus } from "lucide-react";
import { UseFieldArrayRemove } from "react-hook-form";
import { ExerciseFormData } from "./types";
import { useFormContext, useWatch } from "react-hook-form";
import { motion } from "framer-motion";
import { useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface SetInputProps {
  index: number;
  onRemove: UseFieldArrayRemove;
}

interface CommonValue {
  value: number;
  count: number;
}

export function SetInput({ index, onRemove }: SetInputProps) {
  const { setValue, watch } = useFormContext<ExerciseFormData>();
  const { session } = useAuth();
  const currentWeight = watch(`sets.${index}.weight`) || 0;
  const currentReps = watch(`sets.${index}.reps`) || 0;
  const selectedExercise = useWatch({ name: 'exercise' });
  const customExercise = useWatch({ name: 'customExercise' });

  const { data: commonValues, isLoading, error } = useQuery({
    queryKey: ['common-values', selectedExercise, customExercise],
    queryFn: async () => {
      console.log('Fetching common values for:', {
        userId: session?.user?.id,
        selectedExercise,
        customExercise
      });

      if (!session?.user?.id) return null;

      const isCustomExercise = selectedExercise === 'custom';
      let query = supabase
        .from('workout_logs')
        .select('weight_kg, reps')
        .eq('user_id', session.user.id);

      if (isCustomExercise) {
        query = query.eq('custom_exercise', customExercise);
      } else {
        query = query.eq('exercise_id', selectedExercise);
      }

      const { data, error } = await query;
      
      console.log('Query response:', { data, error });
      
      if (error) throw error;

      const weightValues: Record<number, number> = {};
      const repValues: Record<number, number> = {};

      data.forEach(log => {
        if (log.weight_kg) {
          weightValues[log.weight_kg] = (weightValues[log.weight_kg] || 0) + 1;
        }
        if (log.reps) {
          repValues[log.reps] = (repValues[log.reps] || 0) + 1;
        }
      });

      const formatCommonValues = (values: Record<number, number>): CommonValue[] => {
        return Object.entries(values)
          .map(([value, count]) => ({ value: Number(value), count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);
      };

      const result = {
        weights: formatCommonValues(weightValues),
        reps: formatCommonValues(repValues),
      };

      console.log('Formatted common values:', result);
      return result;
    },
    enabled: !!session?.user?.id && !!selectedExercise,
  });

  useEffect(() => {
    console.log('Component state:', {
      session: !!session,
      selectedExercise,
      customExercise,
      commonValues,
      isLoading,
      error
    });
  }, [session, selectedExercise, customExercise, commonValues, isLoading, error]);

  const handleWeightIncrement = useCallback((increment: number) => {
    const newValue = Math.max(0, currentWeight + increment);
    setValue(`sets.${index}.weight`, Number(newValue.toFixed(1)));
  }, [currentWeight, index, setValue]);

  const handleRepsIncrement = useCallback((increment: number) => {
    const newValue = Math.max(0, currentReps + increment);
    setValue(`sets.${index}.reps`, Math.floor(newValue));
  }, [currentReps, index, setValue]);

  const handleSliderChange = useCallback((field: 'weight' | 'reps', values: number[]) => {
    if (values.length === 0) return;
    const value = values[0];
    if (field === 'weight') {
      setValue(`sets.${index}.weight`, Number(value.toFixed(1)));
    } else {
      setValue(`sets.${index}.reps`, Math.floor(value));
    }
  }, [index, setValue]);

  const handleQuickSelect = useCallback((field: 'weight' | 'reps', value: number) => {
    if (field === 'weight') {
      setValue(`sets.${index}.weight`, Number(value.toFixed(1)));
    } else {
      setValue(`sets.${index}.reps`, Math.floor(value));
    }
  }, [index, setValue]);

  const QuickSelectButton = ({ value, field }: { value: number, field: 'weight' | 'reps' }) => {
    console.log('Rendering quick select button:', { value, field });
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => handleQuickSelect(field, value)}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground
          ${field === 'weight' ? 'bg-blue-50 dark:bg-blue-950' : 'bg-green-50 dark:bg-green-950'}
          ${(field === 'weight' ? currentWeight === value : currentReps === value) ? 
            'border-primary text-primary dark:border-primary dark:text-primary' : 
            'border-muted-foreground/20'}`}
      >
        {value}{field === 'weight' ? 'kg' : ''}
      </Button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <Label className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Set {index + 1}
        </Label>
        {index > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-red-500 transition-colors rounded-full"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Weight Controls */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Weight className="h-4 w-4 text-primary" />
            Weight: {currentWeight.toFixed(1)} KG
          </Label>
          {commonValues?.weights && commonValues.weights.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {commonValues.weights.map((common, i) => (
                <QuickSelectButton key={i} value={common.value} field="weight" />
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full shrink-0"
              onClick={() => handleWeightIncrement(-0.5)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Slider
              defaultValue={[currentWeight]}
              value={[currentWeight]}
              onValueChange={(values) => handleSliderChange('weight', values)}
              max={200}
              step={0.5}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full shrink-0"
              onClick={() => handleWeightIncrement(0.5)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Reps Controls */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-primary" />
            Reps: {currentReps}
          </Label>
          {commonValues?.reps && commonValues.reps.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {commonValues.reps.map((common, i) => (
                <QuickSelectButton key={i} value={common.value} field="reps" />
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full shrink-0"
              onClick={() => handleRepsIncrement(-1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Slider
              defaultValue={[currentReps]}
              value={[currentReps]}
              onValueChange={(values) => handleSliderChange('reps', values)}
              max={30}
              step={1}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full shrink-0"
              onClick={() => handleRepsIncrement(1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
