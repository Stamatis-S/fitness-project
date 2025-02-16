
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Trash2, Weight, Repeat, Plus, Minus } from "lucide-react";
import { UseFieldArrayRemove } from "react-hook-form";
import { ExerciseFormData } from "./types";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";

interface SetInputProps {
  index: number;
  onRemove: UseFieldArrayRemove;
}

export function SetInput({ index, onRemove }: SetInputProps) {
  const { register, setValue, watch } = useFormContext<ExerciseFormData>();
  const currentWeight = watch(`sets.${index}.weight`);
  const currentReps = watch(`sets.${index}.reps`);

  const handleWeightIncrement = (increment: number) => {
    const newValue = Math.max(0, currentWeight + increment);
    setValue(`sets.${index}.weight`, newValue);
  };

  const handleRepsIncrement = (increment: number) => {
    const newValue = Math.max(0, currentReps + increment);
    setValue(`sets.${index}.reps`, newValue);
  };

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
            Weight: {currentWeight} KG
          </Label>
          <div className="px-2">
            <Slider
              value={[currentWeight]}
              onValueChange={(values) => setValue(`sets.${index}.weight`, values[0])}
              max={200}
              step={2.5}
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
              step={2.5}
              className="h-12 text-center text-lg font-medium"
              {...register(`sets.${index}.weight` as const, { 
                valueAsNumber: true,
                min: 0 
              })}
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
            Repetitions: {currentReps}
          </Label>
          <div className="px-2">
            <Slider
              value={[currentReps]}
              onValueChange={(values) => setValue(`sets.${index}.reps`, values[0])}
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
              {...register(`sets.${index}.reps` as const, { 
                valueAsNumber: true,
                min: 0 
              })}
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
