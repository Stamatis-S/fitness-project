
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
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
  const { register, setValue, watch } = useFormContext<ExerciseFormData>();
  const currentWeight = watch(`sets.${index}.weight`);
  const currentReps = watch(`sets.${index}.reps`);

  const handleWeightChange = useCallback((value: string | number) => {
    console.log('handleWeightChange called with value:', value);
    
    // Convert to number and handle empty input
    const numValue = value === '' ? 0 : Number(value);
    console.log('Converted numValue:', numValue);
    
    // Update only if it's a valid number
    if (!isNaN(numValue)) {
      console.log('Setting weight value:', numValue);
      setValue(`sets.${index}.weight`, numValue);
    }
  }, [index, setValue]);

  const handleWeightIncrement = useCallback((increment: number) => {
    console.log('handleWeightIncrement called with increment:', increment);
    const newValue = Math.max(0, (currentWeight || 0) + increment);
    console.log('New weight value after increment:', newValue);
    setValue(`sets.${index}.weight`, newValue);
  }, [currentWeight, index, setValue]);

  const handleRepsIncrement = useCallback((increment: number) => {
    console.log('handleRepsIncrement called with increment:', increment);
    const newValue = Math.max(0, (currentReps || 0) + increment);
    console.log('New reps value after increment:', newValue);
    setValue(`sets.${index}.reps`, Math.floor(newValue));
  }, [currentReps, index, setValue]);

  const handleInputInteraction = useCallback((event: React.SyntheticEvent) => {
    console.log('Input interaction:', {
      type: event.type,
      target: event.target,
      isTouchEvent: event.nativeEvent instanceof TouchEvent,
      timestamp: new Date().toISOString(),
      currentValue: currentWeight
    });
  }, [currentWeight]);

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
            Weight: {currentWeight || 0} KG
          </Label>
          <div className="px-2">
            <Slider
              value={[currentWeight || 0]}
              onValueChange={(values) => {
                console.log('Slider value changed:', values);
                setValue(`sets.${index}.weight`, values[0]);
              }}
              max={200}
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
              onClick={() => handleWeightIncrement(-2.5)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              inputMode="decimal"
              className="h-12 text-center text-lg font-medium"
              value={currentWeight || 0}
              onChange={(e) => handleWeightChange(e.target.value)}
              onFocus={handleInputInteraction}
              onClick={handleInputInteraction}
              onTouchStart={handleInputInteraction}
              min={0}
              step="any"
              pattern="[0-9]*"
              aria-label="Weight in KG"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => handleWeightIncrement(2.5)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          <Label className="flex items-center gap-2 text-lg">
            <Repeat className="h-5 w-5 text-primary" />
            Repetitions: {currentReps || 0}
          </Label>
          <div className="px-2">
            <Slider
              value={[currentReps || 0]}
              onValueChange={(values) => setValue(`sets.${index}.reps`, Math.floor(values[0]))}
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
            <Input
              type="number"
              inputMode="numeric"
              className="h-12 text-center text-lg font-medium"
              value={currentReps || 0}
              onChange={(e) => setValue(`sets.${index}.reps`, Math.max(0, Math.floor(Number(e.target.value))))}
              min={0}
              pattern="[0-9]*"
              aria-label="Number of repetitions"
            />
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
