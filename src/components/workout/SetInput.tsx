
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
