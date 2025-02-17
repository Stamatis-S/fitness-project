
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Trash2, Weight, Repeat, Plus, Minus } from "lucide-react";
import { UseFieldArrayRemove } from "react-hook-form";
import { ExerciseFormData } from "./types";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { useCallback } from "react";

interface SetInputProps {
  index: number;
  onRemove: UseFieldArrayRemove;
}

export function SetInput({ index, onRemove }: SetInputProps) {
  const { setValue, watch } = useFormContext<ExerciseFormData>();
  const currentWeight = watch(`sets.${index}.weight`) || 0;
  const currentReps = watch(`sets.${index}.reps`) || 0;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 p-6 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <Label className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Set {index + 1}
        </Label>
        {index > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 hover:text-red-500 transition-colors rounded-full"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Label className="flex items-center gap-2 text-lg">
            <Weight className="h-5 w-5 text-primary" />
            Weight: {currentWeight.toFixed(1)} KG
          </Label>
          <div className="px-2">
            <Slider
              defaultValue={[currentWeight]}
              value={[currentWeight]}
              onValueChange={(values) => handleSliderChange('weight', values)}
              max={200}
              step={0.5}
              className="py-4"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => handleWeightIncrement(-0.5)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="h-12 px-4 flex items-center justify-center text-lg font-medium border rounded-md bg-background min-w-[100px]">
              {currentWeight.toFixed(1)} KG
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => handleWeightIncrement(0.5)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          <Label className="flex items-center gap-2 text-lg">
            <Repeat className="h-5 w-5 text-primary" />
            Repetitions: {currentReps}
          </Label>
          <div className="px-2">
            <Slider
              defaultValue={[currentReps]}
              value={[currentReps]}
              onValueChange={(values) => handleSliderChange('reps', values)}
              max={30}
              step={1}
              className="py-4"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => handleRepsIncrement(-1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="h-12 px-4 flex items-center justify-center text-lg font-medium border rounded-md bg-background min-w-[100px]">
              {currentReps} reps
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => handleRepsIncrement(1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
